import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { VenuesService } from '../venues/venues.service';
import { CreatePriceOverrideDto, CreatePriceRuleDto } from './dto/price.dto';

const HHMM = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService, private venues: VenuesService) {}

  /**
   * Tính giá cho 1 court trong khoảng [startsAt, endsAt).
   * Quy tắc:
   *  - chia thành slot = slotDurationMinutes của court.
   *  - mỗi slot tra giá:
   *      1. PriceOverride match (date + time range chứa slot start) → ưu tiên.
   *      2. PriceRule match (dayOfWeek + time range chứa slot start).
   *      3. Không có → throw BadRequest.
   *  - tổng = sum(slot prices).
   */
  async quote(input: { courtId: string; startsAt: Date; endsAt: Date }) {
    const { courtId, startsAt, endsAt } = input;

    if (endsAt <= startsAt) throw new BadRequestException('endsAt must be after startsAt');

    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
      include: { priceRules: true, priceOverrides: true },
    });
    if (!court || court.deletedAt || !court.isActive) {
      throw new NotFoundException('Court not available');
    }

    const slotMinutes = court.slotDurationMinutes;
    const totalMinutes = (endsAt.getTime() - startsAt.getTime()) / 60_000;
    if (totalMinutes % slotMinutes !== 0) {
      throw new BadRequestException(`Duration must be multiple of ${slotMinutes} minutes`);
    }

    // Kiểm tra closure
    const closure = await this.prisma.courtClosure.findFirst({
      where: {
        courtId,
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });
    if (closure) throw new BadRequestException('Court is closed during requested time');

    // Tính giá từng slot
    const slots: { startsAt: Date; endsAt: Date; price: Prisma.Decimal }[] = [];
    let cursor = new Date(startsAt);
    while (cursor < endsAt) {
      const slotEnd = new Date(cursor.getTime() + slotMinutes * 60_000);
      const slotPrice = this.priceForSlot(court, cursor);
      slots.push({ startsAt: new Date(cursor), endsAt: slotEnd, price: slotPrice });
      cursor = slotEnd;
    }

    const subtotal = slots.reduce(
      (sum, s) => sum.plus(s.price),
      new Prisma.Decimal(0),
    );

    return {
      courtId,
      slotDurationMinutes: slotMinutes,
      slots,
      subtotal,
    };
  }

  private priceForSlot(
    court: { priceRules: any[]; priceOverrides: any[] },
    slotStart: Date,
  ): Prisma.Decimal {
    const hhmm = HHMM(slotStart);
    const dow = slotStart.getDay();
    const dateOnly = new Date(
      slotStart.getFullYear(),
      slotStart.getMonth(),
      slotStart.getDate(),
    );

    // 1. Override match cùng ngày
    const override = court.priceOverrides.find((o) => {
      const od = new Date(o.date);
      return (
        od.getFullYear() === dateOnly.getFullYear() &&
        od.getMonth() === dateOnly.getMonth() &&
        od.getDate() === dateOnly.getDate() &&
        hhmm >= o.startTime &&
        hhmm < o.endTime
      );
    });
    if (override) return new Prisma.Decimal(override.price);

    // 2. Rule theo dayOfWeek
    const rule = court.priceRules.find(
      (r) => r.dayOfWeek === dow && hhmm >= r.startTime && hhmm < r.endTime,
    );
    if (rule) return new Prisma.Decimal(rule.pricePerSlot);

    throw new BadRequestException(`No price defined for ${hhmm} on day ${dow}`);
  }

  // CRUD price rules
  async addRule(courtId: string, ownerId: string, dto: CreatePriceRuleDto) {
    const court = await this.prisma.court.findUniqueOrThrow({ where: { id: courtId } });
    await this.venues.assertOwner(court.venueId, ownerId);
    await this.assertNoOverlap(courtId, dto, null);
    return this.prisma.priceRule.create({
      data: { courtId, ...dto },
    });
  }

  /**
   * Check khung giờ mới không trùng với rule nào đang tồn tại của cùng court + dayOfWeek.
   * 2 khung giờ trùng = `startA < endB` AND `endA > startB` (half-open interval [start, end)).
   * `excludeId` để skip chính rule đang update.
   */
  private async assertNoOverlap(
    courtId: string,
    dto: { dayOfWeek: number; startTime: string; endTime: string },
    excludeId: string | null,
  ) {
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('Giờ kết thúc phải sau giờ bắt đầu');
    }
    const existing = await this.prisma.priceRule.findMany({
      where: {
        courtId,
        dayOfWeek: dto.dayOfWeek,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, startTime: true, endTime: true },
    });
    const conflict = existing.find(
      (r) => dto.startTime < r.endTime && dto.endTime > r.startTime,
    );
    if (conflict) {
      throw new BadRequestException(
        `Khung giờ trùng với rule ${conflict.startTime}–${conflict.endTime} đã có. Sửa hoặc xoá rule cũ trước.`,
      );
    }
  }

  async addOverride(courtId: string, ownerId: string, dto: CreatePriceOverrideDto) {
    const court = await this.prisma.court.findUniqueOrThrow({ where: { id: courtId } });
    await this.venues.assertOwner(court.venueId, ownerId);
    return this.prisma.priceOverride.create({
      data: {
        courtId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        price: dto.price,
        reason: dto.reason,
      },
    });
  }

  async listRules(courtId: string) {
    return this.prisma.priceRule.findMany({
      where: { courtId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async updateRule(id: string, ownerId: string, dto: CreatePriceRuleDto) {
    const rule = await this.prisma.priceRule.findUniqueOrThrow({
      where: { id },
      include: { court: { select: { venueId: true } } },
    });
    await this.venues.assertOwner(rule.court.venueId, ownerId);
    await this.assertNoOverlap(rule.courtId, dto, id);
    return this.prisma.priceRule.update({ where: { id }, data: { ...dto } });
  }

  async deleteRule(id: string, ownerId: string) {
    const rule = await this.prisma.priceRule.findUniqueOrThrow({
      where: { id },
      include: { court: { select: { venueId: true } } },
    });
    await this.venues.assertOwner(rule.court.venueId, ownerId);
    await this.prisma.priceRule.delete({ where: { id } });
    return { ok: true };
  }
}
