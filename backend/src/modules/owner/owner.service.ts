import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingSource,
  BookingStatus,
  Prisma,
  Role,
  VenueMemberRole,
  VenueMemberStatus,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { generateBookingCode, generateToken } from '../../common/utils/code.util';
import {
  CreateWalkInDto,
  InviteStaffDto,
  RefuseBookingDto,
  ReportsQueryDto,
  UpdateStaffDto,
} from './dto/owner.dto';

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────── Dashboard ───────────────────

  /**
   * KPI tổng quan cho owner: doanh thu hôm nay, booking hôm nay, occupancy, revenue tháng.
   * Aggregate across tất cả venues mà ownerId sở hữu.
   */
  async dashboard(ownerId: string) {
    const venueIds = (
      await this.prisma.venue.findMany({
        where: { ownerId, deletedAt: null },
        select: { id: true },
      })
    ).map((v) => v.id);

    if (venueIds.length === 0) {
      return {
        venueCount: 0,
        revenueToday: 0,
        bookingsToday: 0,
        revenueMonth: 0,
        revenueMonthDelta: 0,
        occupancyToday: 0,
        ratingAvg: 0,
        recentBookings: [],
        revenueLast7Days: Array(7).fill(0),
        topCustomers: [],
      };
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 3600_000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const successStatuses: BookingStatus[] = ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'];

    const [todayAgg, monthAgg, prevMonthAgg, todayCount, recent, venues] = await Promise.all([
      this.prisma.booking.aggregate({
        where: {
          venueId: { in: venueIds },
          status: { in: successStatuses },
          startsAt: { gte: startOfDay, lt: endOfDay },
        },
        _sum: { total: true },
      }),
      this.prisma.booking.aggregate({
        where: {
          venueId: { in: venueIds },
          status: { in: successStatuses },
          startsAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      this.prisma.booking.aggregate({
        where: {
          venueId: { in: venueIds },
          status: { in: successStatuses },
          startsAt: { gte: startOfPrevMonth, lt: startOfMonth },
        },
        _sum: { total: true },
      }),
      this.prisma.booking.count({
        where: {
          venueId: { in: venueIds },
          startsAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      this.prisma.booking.findMany({
        where: { venueId: { in: venueIds } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          venue: { select: { name: true } },
          court: { select: { name: true } },
          user: { select: { fullName: true } },
        },
      }),
      this.prisma.venue.findMany({
        where: { id: { in: venueIds } },
        select: { ratingAvg: true, ratingCount: true },
      }),
    ]);

    // Revenue 7 ngày gần nhất
    const last7 = await this.prisma.$queryRaw<Array<{ day: Date; total: number }>>`
      SELECT date_trunc('day', "startsAt") AS day,
             COALESCE(SUM("total"), 0)::float AS total
      FROM "Booking"
      WHERE "venueId" = ANY(${venueIds})
        AND status IN ('CONFIRMED', 'CHECKED_IN', 'COMPLETED')
        AND "startsAt" >= ${new Date(now.getTime() - 7 * 24 * 3600_000)}
      GROUP BY day
      ORDER BY day
    `;
    const revenueLast7Days: number[] = Array(7).fill(0);
    for (const row of last7) {
      const daysAgo = Math.floor((now.getTime() - row.day.getTime()) / (24 * 3600_000));
      const idx = 6 - daysAgo;
      if (idx >= 0 && idx < 7) revenueLast7Days[idx] = Number(row.total);
    }

    // Top customer tháng
    const topRaw = await this.prisma.booking.groupBy({
      by: ['userId'],
      where: {
        venueId: { in: venueIds },
        status: { in: successStatuses },
        startsAt: { gte: startOfMonth },
      },
      _sum: { total: true },
      _count: { _all: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    });
    const userIds = topRaw.map((r) => r.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true },
    });
    const topCustomers = topRaw.map((r) => ({
      name: users.find((u) => u.id === r.userId)?.fullName ?? '—',
      bookings: r._count._all,
      total: Number(r._sum.total ?? 0),
    }));

    const revenueMonth = Number(monthAgg._sum.total ?? 0);
    const revenuePrev = Number(prevMonthAgg._sum.total ?? 0);
    const revenueMonthDelta = revenuePrev > 0 ? ((revenueMonth - revenuePrev) / revenuePrev) * 100 : 0;

    // ratingAvg weighted theo ratingCount
    let totalRating = 0;
    let totalCount = 0;
    for (const v of venues) {
      totalRating += Number(v.ratingAvg) * v.ratingCount;
      totalCount += v.ratingCount;
    }
    const ratingAvg = totalCount > 0 ? totalRating / totalCount : 0;

    // Occupancy hôm nay (rough): bookings hôm nay / (courts × 16 slot)
    const courts = await this.prisma.court.count({
      where: { venueId: { in: venueIds }, isActive: true, deletedAt: null },
    });
    const occupancyToday = courts > 0 ? Math.round((todayCount / (courts * 16)) * 100) : 0;

    return {
      venueCount: venueIds.length,
      revenueToday: Number(todayAgg._sum.total ?? 0),
      bookingsToday: todayCount,
      revenueMonth,
      revenueMonthDelta: Math.round(revenueMonthDelta * 10) / 10,
      occupancyToday: Math.min(100, occupancyToday),
      ratingAvg: Math.round(ratingAvg * 10) / 10,
      recentBookings: recent,
      revenueLast7Days,
      topCustomers,
    };
  }

  // ─────────────────── Venue: submit ───────────────────

  async submitVenue(ownerId: string, venueId: string) {
    const v = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!v) throw new NotFoundException();
    if (v.ownerId !== ownerId) throw new ForbiddenException();
    if (v.status !== 'DRAFT') {
      throw new BadRequestException(`Venue is in status ${v.status}, cannot submit`);
    }
    return this.prisma.venue.update({
      where: { id: venueId },
      data: { status: 'PENDING' },
    });
  }

  // ─────────────────── Bookings: list / walk-in / refuse ───────────────────

  async listBookings(
    ownerId: string,
    params: { date?: string; status?: BookingStatus; venueId?: string },
  ) {
    const venueIds = (
      await this.prisma.venue.findMany({
        where: { ownerId, deletedAt: null },
        select: { id: true },
      })
    ).map((v) => v.id);

    const where: Prisma.BookingWhereInput = { venueId: { in: venueIds } };
    if (params.venueId) where.venueId = params.venueId;
    if (params.status) where.status = params.status;
    if (params.date) {
      const start = new Date(params.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start.getTime() + 24 * 3600_000);
      where.startsAt = { gte: start, lt: end };
    }

    return this.prisma.booking.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      include: {
        venue: { select: { id: true, name: true } },
        court: { select: { id: true, name: true } },
        user: { select: { id: true, fullName: true, phone: true } },
      },
    });
  }

  async createWalkIn(ownerId: string, dto: CreateWalkInDto) {
    const court = await this.prisma.court.findUnique({
      where: { id: dto.courtId },
      include: { venue: true, priceRules: true },
    });
    if (!court) throw new NotFoundException('Court not found');
    if (court.venue.ownerId !== ownerId) throw new ForbiddenException();

    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    // Conflict check
    const overlap = await this.prisma.booking.findFirst({
      where: {
        courtId: dto.courtId,
        status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN'] },
        AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gt: startsAt } }],
      },
    });
    if (overlap) throw new BadRequestException('Slot conflict');

    // Tạo/tìm user theo phone hoặc dùng owner làm user.
    let userId = ownerId;
    if (dto.customerPhone) {
      const existing = await this.prisma.user.findUnique({ where: { phone: dto.customerPhone } });
      if (existing) {
        userId = existing.id;
      }
    }

    return this.prisma.booking.create({
      data: {
        code: generateBookingCode(),
        userId,
        courtId: court.id,
        venueId: court.venueId,
        startsAt,
        endsAt,
        status: BookingStatus.CONFIRMED, // Walk-in đã thu tiền mặt → CONFIRMED luôn
        source: BookingSource.WALK_IN,
        subtotal: dto.total,
        discount: 0,
        total: dto.total,
        notes: dto.customerName
          ? `Walk-in: ${dto.customerName}${dto.customerPhone ? ' · ' + dto.customerPhone : ''}`
          : 'Walk-in',
        handledByUserId: ownerId,
        checkInToken: generateToken(),
      },
    });
  }

  async refuseBooking(ownerId: string, bookingId: string, dto: RefuseBookingDto) {
    const b = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { venue: true },
    });
    if (!b) throw new NotFoundException();
    if (b.venue.ownerId !== ownerId) throw new ForbiddenException();
    if (!(['PENDING_PAYMENT', 'CONFIRMED'] as BookingStatus[]).includes(b.status)) {
      throw new BadRequestException('Booking cannot be refused');
    }
    // Chỉ refuse được trong 5 phút sau tạo
    const ageMin = (Date.now() - b.createdAt.getTime()) / 60_000;
    if (ageMin > 5) {
      throw new BadRequestException('Refuse window expired (>5 min). Use cancel instead.');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED_BY_OWNER,
        cancelledAt: new Date(),
        refusedAt: new Date(),
        refuseReason: dto.reason,
        refundAmount: b.total,
      },
    });
  }

  // ─────────────────── Staff: list / invite / suspend / remove ───────────────────

  async listStaff(ownerId: string, venueId?: string) {
    const where: Prisma.VenueMemberWhereInput = {
      venue: { ownerId },
      inviteStatus: { not: VenueMemberStatus.REMOVED },
    };
    if (venueId) where.venueId = venueId;

    return this.prisma.venueMember.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        venue: { select: { id: true, name: true } },
        user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
      },
    });
  }

  async inviteStaff(ownerId: string, dto: InviteStaffDto) {
    // Verify ownership
    const venue = await this.prisma.venue.findUnique({ where: { id: dto.venueId } });
    if (!venue) throw new NotFoundException('Venue not found');
    if (venue.ownerId !== ownerId) throw new ForbiddenException();

    // Tìm user theo email nếu đã có tài khoản
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    // Check trùng
    if (user) {
      const existing = await this.prisma.venueMember.findUnique({
        where: { venueId_userId: { venueId: dto.venueId, userId: user.id } },
      });
      if (existing && existing.inviteStatus !== VenueMemberStatus.REMOVED) {
        throw new BadRequestException('User is already member of this venue');
      }
    }

    const inviteToken = randomBytes(24).toString('hex');
    const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 3600_000); // 7 days

    return this.prisma.venueMember.create({
      data: {
        venueId: dto.venueId,
        userId: user?.id,
        email: dto.email,
        role: dto.role ?? VenueMemberRole.STAFF,
        inviteStatus: user ? VenueMemberStatus.PENDING : VenueMemberStatus.PENDING,
        inviteToken,
        inviteExpiresAt,
      },
    });
  }

  async updateStaff(ownerId: string, memberId: string, dto: UpdateStaffDto) {
    const m = await this.prisma.venueMember.findUnique({
      where: { id: memberId },
      include: { venue: true },
    });
    if (!m) throw new NotFoundException();
    if (m.venue.ownerId !== ownerId) throw new ForbiddenException();

    return this.prisma.venueMember.update({
      where: { id: memberId },
      data: {
        role: dto.role,
        inviteStatus: dto.inviteStatus,
      },
    });
  }

  async removeStaff(ownerId: string, memberId: string) {
    const m = await this.prisma.venueMember.findUnique({
      where: { id: memberId },
      include: { venue: true },
    });
    if (!m) throw new NotFoundException();
    if (m.venue.ownerId !== ownerId) throw new ForbiddenException();

    return this.prisma.venueMember.update({
      where: { id: memberId },
      data: { inviteStatus: VenueMemberStatus.REMOVED },
    });
  }

  /** Staff click email link → activate VenueMember. */
  async acceptInvite(userId: string, token: string) {
    const m = await this.prisma.venueMember.findUnique({ where: { inviteToken: token } });
    if (!m) throw new NotFoundException('Invite not found');
    if (m.inviteStatus !== VenueMemberStatus.PENDING) {
      throw new BadRequestException('Invite is no longer valid');
    }
    if (m.inviteExpiresAt && m.inviteExpiresAt < new Date()) {
      throw new BadRequestException('Invite expired');
    }

    return this.prisma.venueMember.update({
      where: { id: m.id },
      data: {
        userId,
        inviteStatus: VenueMemberStatus.ACTIVE,
        acceptedAt: new Date(),
        inviteToken: null,
      },
    });
  }

  // ─────────────────── Reports ───────────────────

  async reports(ownerId: string, dto: ReportsQueryDto) {
    const venueIds = (
      await this.prisma.venue.findMany({
        where: { ownerId, deletedAt: null },
        select: { id: true },
      })
    ).map((v) => v.id);

    const from = dto.from ? new Date(dto.from) : new Date(Date.now() - 30 * 24 * 3600_000);
    const to = dto.to ? new Date(dto.to) : new Date();
    const successStatuses: BookingStatus[] = ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'];

    const groupBy = dto.groupBy ?? 'day';
    const trunc = groupBy === 'month' ? 'month' : groupBy === 'week' ? 'week' : 'day';

    const series = await this.prisma.$queryRawUnsafe<
      Array<{ bucket: Date; total: number; count: number }>
    >(
      `SELECT date_trunc('${trunc}', "startsAt") AS bucket,
              COALESCE(SUM("total"), 0)::float AS total,
              COUNT(*)::int AS count
       FROM "Booking"
       WHERE "venueId" = ANY($1)
         AND status = ANY($2)
         AND "startsAt" >= $3 AND "startsAt" < $4
       GROUP BY bucket ORDER BY bucket`,
      venueIds,
      successStatuses,
      from,
      to,
    );

    // Breakdown theo provider
    const paymentBreakdown = await this.prisma.payment.groupBy({
      by: ['provider'],
      where: {
        booking: { venueId: { in: venueIds }, status: { in: successStatuses } },
        status: 'SUCCESS',
        createdAt: { gte: from, lt: to },
      },
      _sum: { amount: true },
      _count: { _all: true },
    });

    return {
      from,
      to,
      groupBy,
      series: series.map((s) => ({ bucket: s.bucket, total: Number(s.total), count: s.count })),
      paymentBreakdown: paymentBreakdown.map((p) => ({
        provider: p.provider,
        total: Number(p._sum.amount ?? 0),
        count: p._count._all,
      })),
    };
  }

  // ─────────────────── Payout ───────────────────

  async payoutSummary(ownerId: string) {
    const [pending, paid, history, bankAccount] = await Promise.all([
      this.prisma.ownerEarning.aggregate({
        where: { ownerId, status: 'PENDING' },
        _sum: { netAmount: true },
        _count: { _all: true },
      }),
      this.prisma.ownerEarning.aggregate({
        where: { ownerId, status: 'PAID' },
        _sum: { netAmount: true },
      }),
      this.prisma.payout.findMany({
        where: { ownerId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.bankAccount.findFirst({ where: { userId: ownerId, isDefault: true } }),
    ]);

    return {
      pendingAmount: Number(pending._sum.netAmount ?? 0),
      pendingCount: pending._count._all,
      paidTotal: Number(paid._sum.netAmount ?? 0),
      bankAccount,
      history,
    };
  }

  async requestPayout(ownerId: string) {
    const pending = await this.prisma.ownerEarning.findMany({
      where: { ownerId, status: 'PENDING' },
    });
    if (pending.length === 0) throw new BadRequestException('No pending earnings');

    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { userId: ownerId, isDefault: true },
    });
    if (!bankAccount) throw new BadRequestException('No default bank account configured');

    const amount = pending.reduce((sum, e) => sum.plus(e.netAmount), new Prisma.Decimal(0));
    const periodFrom = pending.reduce(
      (min, e) => (e.createdAt < min ? e.createdAt : min),
      pending[0].createdAt,
    );

    const payout = await this.prisma.payout.create({
      data: {
        ownerId,
        periodFrom,
        periodTo: new Date(),
        amount,
        bankAccountId: bankAccount.id,
        status: 'PENDING',
      },
    });

    // Đánh dấu earnings đã được attach vào payout
    await this.prisma.ownerEarning.updateMany({
      where: { id: { in: pending.map((e) => e.id) } },
      data: { payoutId: payout.id },
    });

    return payout;
  }

  // ─────────────────── Helper: scope assertion ───────────────────

  async assertOwner(venueId: string, ownerId: string) {
    const v = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!v) throw new NotFoundException();
    if (v.ownerId !== ownerId) throw new ForbiddenException();
    return v;
  }

  async assertOwnerRole(_userId: string, role: Role) {
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Owner-only');
    }
  }
}
