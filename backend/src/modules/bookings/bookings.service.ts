import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { VenuesService } from '../venues/venues.service';
import { generateBookingCode, generateToken } from '../../common/utils/code.util';
import {
  CancelBookingDto,
  CreateBookingDto,
  QuoteBookingDto,
  RescheduleBookingDto,
} from './dto/booking.dto';
import { HoldPayload, HoldService } from './hold.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private pricing: PricingService,
    private venues: VenuesService,
    private hold: HoldService,
  ) {}

  /**
   * Báo giá + giữ slot trong Redis. Trả về holdToken có hiệu lực 10' (configurable).
   */
  async quote(userId: string, dto: QuoteBookingDto) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    const priced = await this.pricing.quote({ courtId: dto.courtId, startsAt, endsAt });

    // Kiểm tra ngay trong DB: có booking active overlap không
    // (Tầng app — exclusion constraint là tầng an toàn cuối cùng).
    const overlap = await this.prisma.booking.findFirst({
      where: {
        courtId: dto.courtId,
        status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN'] },
        AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gt: startsAt } }],
      },
      select: { id: true },
    });
    if (overlap) throw new ConflictException('Time slot already booked');

    // Voucher (đơn giản — chưa apply, chỉ tính để hiển thị)
    let discount = new Prisma.Decimal(0);
    let voucherCode: string | undefined;
    if (dto.voucherCode) {
      const voucher = await this.prisma.voucher.findFirst({
        where: {
          code: dto.voucherCode,
          isActive: true,
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() },
        },
      });
      if (voucher) {
        voucherCode = voucher.code;
        if (voucher.type === 'PERCENT') {
          discount = priced.subtotal.mul(voucher.value).div(100);
          if (voucher.maxDiscount && discount.gt(voucher.maxDiscount)) {
            discount = new Prisma.Decimal(voucher.maxDiscount);
          }
        } else {
          discount = new Prisma.Decimal(voucher.value);
        }
        if (voucher.minOrder && priced.subtotal.lt(voucher.minOrder)) {
          discount = new Prisma.Decimal(0);
          voucherCode = undefined;
        }
      }
    }

    const total = priced.subtotal.minus(discount);
    if (total.lt(0)) throw new BadRequestException('Total cannot be negative');

    let holdToken: string;
    try {
      const held = await this.hold.hold({
        userId,
        courtId: dto.courtId,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        subtotal: priced.subtotal.toFixed(2),
        total: total.toFixed(2),
        discount: discount.toFixed(2),
        voucherCode,
      });
      holdToken = held.token;
    } catch (e) {
      if ((e as Error).message === 'SLOT_HELD') {
        throw new ConflictException('Slot is being held by another customer');
      }
      throw e;
    }

    return {
      courtId: dto.courtId,
      startsAt,
      endsAt,
      slots: priced.slots,
      subtotal: priced.subtotal,
      discount,
      total,
      voucherCode,
      holdToken,
    };
  }

  /**
   * Tạo booking từ holdToken. Booking trạng thái PENDING_PAYMENT.
   * Sau khi payment success → chuyển sang CONFIRMED.
   */
  async createFromHold(userId: string, dto: CreateBookingDto) {
    const payload = await this.hold.consume(dto.holdToken);
    if (!payload) throw new BadRequestException('Hold token expired or invalid');
    if (payload.userId !== userId) throw new ForbiddenException('Hold belongs to another user');

    const court = await this.prisma.court.findUniqueOrThrow({
      where: { id: payload.courtId },
      select: { id: true, venueId: true },
    });

    let voucherId: string | undefined;
    if (payload.voucherCode) {
      const v = await this.prisma.voucher.findUnique({ where: { code: payload.voucherCode } });
      voucherId = v?.id;
    }

    try {
      const booking = await this.prisma.$transaction(async (tx) => {
        // Advisory lock theo courtId để serialize attempts
        const lockKey = this.hashCourtIdForLock(court.id);
        await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(${lockKey})`);

        return tx.booking.create({
          data: {
            code: generateBookingCode(),
            userId,
            courtId: court.id,
            venueId: court.venueId,
            startsAt: new Date(payload.startsAt),
            endsAt: new Date(payload.endsAt),
            status: BookingStatus.PENDING_PAYMENT,
            subtotal: payload.subtotal,
            discount: payload.discount,
            total: payload.total,
            voucherId,
            notes: dto.notes,
            checkInToken: generateToken(),
          },
        });
      });
      return booking;
    } catch (e: any) {
      // Lỗi từ exclusion constraint (booking_no_overlap) hoặc race condition
      if (
        e?.code === 'P2010' ||
        (typeof e?.message === 'string' && /booking_no_overlap/.test(e.message))
      ) {
        throw new ConflictException('Slot already booked');
      }
      throw e;
    }
  }

  async detail(id: string, user: { sub: string; role: Role }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        court: { include: { sport: true } },
        venue: { select: { id: true, name: true, slug: true, ownerId: true } },
        payments: true,
      },
    });
    if (!booking) throw new NotFoundException();

    const isOwner = booking.venue.ownerId === user.sub;
    const isCustomer = booking.userId === user.sub;
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isOwner && !isCustomer && !isAdmin) throw new ForbiddenException();
    return booking;
  }

  async listMine(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { venue: { select: { id: true, name: true } }, court: true, payments: true },
    });
  }

  async cancelByUser(id: string, userId: string, dto: CancelBookingDto) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id } });
    if (booking.userId !== userId) throw new ForbiddenException();
    if (!['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.status)) {
      throw new BadRequestException('Booking cannot be cancelled');
    }

    const refundAmount = this.computeRefund(booking);

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED_BY_USER,
        cancelledAt: new Date(),
        cancelReason: dto.reason,
        refundAmount,
      },
    });
  }

  async cancelByOwner(id: string, ownerUserId: string, dto: CancelBookingDto) {
    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id },
      include: { venue: true },
    });
    if (booking.venue.ownerId !== ownerUserId) throw new ForbiddenException();
    if (!['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.status)) {
      throw new BadRequestException('Booking cannot be cancelled');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED_BY_OWNER,
        cancelledAt: new Date(),
        cancelReason: dto.reason,
        refundAmount: booking.total,
      },
    });
  }

  async checkIn(id: string, ownerUserId: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id },
      include: { venue: true },
    });
    if (booking.venue.ownerId !== ownerUserId) throw new ForbiddenException();
    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Booking must be CONFIRMED to check-in');
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CHECKED_IN, checkedInAt: new Date() },
    });
  }

  async markCompleted(id: string) {
    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.COMPLETED },
    });
  }

  async reschedule(id: string, userId: string, dto: RescheduleBookingDto) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id } });
    if (booking.userId !== userId) throw new ForbiddenException();
    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Only CONFIRMED booking can be rescheduled');
    }
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    // Re-quote để chắc chắn giá đủ + slot trống
    const priced = await this.pricing.quote({ courtId: booking.courtId, startsAt, endsAt });
    if (!priced.subtotal.equals(booking.subtotal)) {
      throw new BadRequestException('Price changed — please cancel and rebook');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const lockKey = this.hashCourtIdForLock(booking.courtId);
        await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(${lockKey})`);

        return tx.booking.update({ where: { id }, data: { startsAt, endsAt } });
      });
    } catch (e: any) {
      if (/booking_no_overlap/.test(e?.message ?? '')) {
        throw new ConflictException('New slot already booked');
      }
      throw e;
    }
  }

  async cancelTimedOut(): Promise<number> {
    const timeoutMin = 15; // Bắt buộc — sẽ dùng config trong cron file
    const cutoff = new Date(Date.now() - timeoutMin * 60_000);
    const res = await this.prisma.booking.updateMany({
      where: { status: 'PENDING_PAYMENT', createdAt: { lt: cutoff } },
      data: { status: 'CANCELLED_TIMEOUT', cancelledAt: new Date() },
    });
    return res.count;
  }

  // ===== helpers =====
  private computeRefund(booking: { startsAt: Date; total: Prisma.Decimal }): Prisma.Decimal {
    const hoursToStart = (booking.startsAt.getTime() - Date.now()) / 3_600_000;
    if (hoursToStart >= 24) return new Prisma.Decimal(booking.total);
    if (hoursToStart >= 12) return new Prisma.Decimal(booking.total).mul(0.5);
    return new Prisma.Decimal(0);
  }

  /**
   * Hash courtId thành 8-byte int để dùng với pg_advisory_xact_lock.
   * Đủ để tránh race condition cho cùng court (collision không nguy hại vì exclusion constraint là tầng cuối).
   */
  private hashCourtIdForLock(courtId: string): number {
    let h = 0;
    for (let i = 0; i < courtId.length; i += 1) {
      h = (Math.imul(31, h) + courtId.charCodeAt(i)) | 0;
    }
    return h;
  }
}
