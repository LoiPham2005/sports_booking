import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  Prisma,
  RefundStatus,
  Role,
  UserStatus,
  VenueStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AuditQueryDto,
  ListUsersDto,
  ListVenuesDto,
  RejectVenueDto,
  ResolveDisputeDto,
  UpdateUserDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────── Audit log helper ───────────────────

  private async audit(
    actorId: string,
    actorRole: Role,
    action: string,
    resourceType: string,
    resourceId: string | null,
    before?: unknown,
    after?: unknown,
  ) {
    await this.prisma.auditLog.create({
      data: {
        actorId,
        actorRole,
        action,
        resourceType,
        resourceId: resourceId ?? undefined,
        beforeJson: before === undefined ? undefined : (before as Prisma.InputJsonValue),
        afterJson: after === undefined ? undefined : (after as Prisma.InputJsonValue),
      },
    });
  }

  // ─────────────────── Dashboard ───────────────────

  async dashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const success: BookingStatus[] = ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'];

    const [
      totalUsers,
      newUsersMonth,
      totalVenues,
      pendingVenues,
      gmvMonth,
      gmvPrev,
      bookingsMonth,
      pendingDisputes,
      paymentSplit,
    ] = await Promise.all([
      this.prisma.user.count({ where: { status: { not: UserStatus.DELETED } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.venue.count({ where: { deletedAt: null } }),
      this.prisma.venue.count({ where: { status: VenueStatus.PENDING } }),
      this.prisma.booking.aggregate({
        where: { status: { in: success }, startsAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      this.prisma.booking.aggregate({
        where: {
          status: { in: success },
          startsAt: { gte: startOfPrevMonth, lt: startOfMonth },
        },
        _sum: { total: true },
      }),
      this.prisma.booking.count({
        where: { status: { in: success }, startsAt: { gte: startOfMonth } },
      }),
      this.prisma.refund.count({ where: { status: RefundStatus.PENDING } }),
      this.prisma.payment.groupBy({
        by: ['provider'],
        where: { status: 'SUCCESS', createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    // Top venue tháng
    const topVenuesRaw = await this.prisma.booking.groupBy({
      by: ['venueId'],
      where: { status: { in: success }, startsAt: { gte: startOfMonth } },
      _sum: { total: true },
      _count: { _all: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    });
    const venues = await this.prisma.venue.findMany({
      where: { id: { in: topVenuesRaw.map((v) => v.venueId) } },
      select: { id: true, name: true, city: true },
    });

    const gmv = Number(gmvMonth._sum.total ?? 0);
    const gmvPrevN = Number(gmvPrev._sum.total ?? 0);
    const gmvDelta = gmvPrevN > 0 ? ((gmv - gmvPrevN) / gmvPrevN) * 100 : 0;

    return {
      totalUsers,
      newUsersMonth,
      totalVenues,
      pendingVenues,
      gmvMonth: gmv,
      gmvDelta: Math.round(gmvDelta * 10) / 10,
      bookingsMonth,
      pendingDisputes,
      topVenues: topVenuesRaw.map((v) => ({
        ...venues.find((x) => x.id === v.venueId),
        total: Number(v._sum.total ?? 0),
        bookings: v._count._all,
      })),
      paymentSplit: paymentSplit.map((p) => ({
        provider: p.provider,
        total: Number(p._sum.amount ?? 0),
        count: p._count._all,
      })),
    };
  }

  // ─────────────────── Venues approval ───────────────────

  async listVenues(dto: ListVenuesDto) {
    const where: Prisma.VenueWhereInput = { deletedAt: null };
    if (dto.status) where.status = dto.status;
    if (dto.q) {
      where.OR = [
        { name: { contains: dto.q, mode: 'insensitive' } },
        { addressLine: { contains: dto.q, mode: 'insensitive' } },
      ];
    }
    return this.prisma.venue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: dto.limit ?? 50,
      include: {
        owner: { select: { id: true, fullName: true, email: true } },
        _count: { select: { courts: true, bookings: true } },
      },
    });
  }

  async approveVenue(actorId: string, actorRole: Role, venueId: string) {
    const v = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!v) throw new NotFoundException();
    if (v.status === VenueStatus.APPROVED) {
      throw new BadRequestException('Already approved');
    }
    const after = await this.prisma.venue.update({
      where: { id: venueId },
      data: { status: VenueStatus.APPROVED },
    });
    await this.audit(actorId, actorRole, 'VENUE_APPROVE', 'Venue', venueId, v, after);
    return after;
  }

  async rejectVenue(actorId: string, actorRole: Role, venueId: string, dto: RejectVenueDto) {
    const v = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!v) throw new NotFoundException();
    const after = await this.prisma.venue.update({
      where: { id: venueId },
      data: { status: VenueStatus.SUSPENDED },
    });
    await this.audit(actorId, actorRole, 'VENUE_REJECT', 'Venue', venueId, v, {
      ...after,
      rejectReason: dto.reason,
    });
    return after;
  }

  async suspendVenue(actorId: string, actorRole: Role, venueId: string) {
    const v = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!v) throw new NotFoundException();
    const after = await this.prisma.venue.update({
      where: { id: venueId },
      data: { status: VenueStatus.SUSPENDED },
    });
    await this.audit(actorId, actorRole, 'VENUE_SUSPEND', 'Venue', venueId, v, after);
    return after;
  }

  // ─────────────────── Users ───────────────────

  async listUsers(dto: ListUsersDto) {
    const where: Prisma.UserWhereInput = {};
    if (dto.role) where.role = dto.role;
    if (dto.status) where.status = dto.status;
    if (dto.q) {
      where.OR = [
        { fullName: { contains: dto.q, mode: 'insensitive' } },
        { email: { contains: dto.q, mode: 'insensitive' } },
        { phone: { contains: dto.q } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: dto.limit ?? 50,
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          _count: { select: { bookings: true, ownedVenues: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total };
  }

  async updateUser(actorId: string, actorRole: Role, userId: string, dto: UpdateUserDto) {
    const before = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!before) throw new NotFoundException();
    // SUPER_ADMIN only có thể đổi sang SUPER_ADMIN
    if (dto.role === 'SUPER_ADMIN' && actorRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can promote to SUPER_ADMIN');
    }
    const after = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role, status: dto.status },
    });
    await this.audit(actorId, actorRole, 'USER_UPDATE', 'User', userId, before, after);
    return after;
  }

  // ─────────────────── Disputes / refunds ───────────────────

  async listDisputes() {
    return this.prisma.refund.findMany({
      where: { status: RefundStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      include: {
        payment: {
          include: {
            booking: {
              select: {
                id: true,
                code: true,
                userId: true,
                venueId: true,
                total: true,
                status: true,
              },
            },
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });
  }

  async resolveDispute(
    actorId: string,
    actorRole: Role,
    refundId: string,
    dto: ResolveDisputeDto,
  ) {
    const r = await this.prisma.refund.findUnique({ where: { id: refundId } });
    if (!r) throw new NotFoundException();
    if (r.status !== RefundStatus.PENDING) {
      throw new BadRequestException('Refund already resolved');
    }

    const newStatus = dto.approve ? RefundStatus.SUCCESS : RefundStatus.FAILED;
    const after = await this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status: newStatus,
        amount: dto.amount ?? r.amount,
        reason: dto.note ?? r.reason,
      },
    });
    await this.audit(actorId, actorRole, 'REFUND_RESOLVE', 'Refund', refundId, r, after);
    return after;
  }

  // ─────────────────── Reports (platform-wide) ───────────────────

  async reports(params: { from?: string; to?: string }) {
    const from = params.from ? new Date(params.from) : new Date(Date.now() - 30 * 24 * 3600_000);
    const to = params.to ? new Date(params.to) : new Date();
    // Pass as text[] thay vì enum[] — Postgres không tự cast TS string[] sang `BookingStatus[]`.
    const success: string[] = ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'];

    const series = await this.prisma.$queryRaw<
      Array<{ day: Date; gmv: number; bookings: number }>
    >`
      SELECT date_trunc('day', "startsAt") AS day,
             COALESCE(SUM("total"), 0)::float AS gmv,
             COUNT(*)::int AS bookings
      FROM "Booking"
      WHERE status::text = ANY(${success})
        AND "startsAt" >= ${from} AND "startsAt" < ${to}
      GROUP BY day ORDER BY day
    `;

    const bySport = await this.prisma.$queryRaw<Array<{ sportId: string; total: number; count: number }>>`
      SELECT c."sportId",
             COALESCE(SUM(b."total"), 0)::float AS total,
             COUNT(*)::int AS count
      FROM "Booking" b
      INNER JOIN "Court" c ON c.id = b."courtId"
      WHERE b.status::text = ANY(${success})
        AND b."startsAt" >= ${from} AND b."startsAt" < ${to}
      GROUP BY c."sportId"
    `;
    const sports = await this.prisma.sport.findMany({
      where: { id: { in: bySport.map((s) => s.sportId) } },
      select: { id: true, slug: true, nameVi: true },
    });

    return {
      from,
      to,
      series: series.map((s) => ({ day: s.day, gmv: Number(s.gmv), bookings: s.bookings })),
      bySport: bySport.map((s) => ({
        sport: sports.find((x) => x.id === s.sportId)?.nameVi ?? s.sportId,
        slug: sports.find((x) => x.id === s.sportId)?.slug ?? '',
        total: Number(s.total),
        count: s.count,
      })),
    };
  }

  // ─────────────────── Audit log ───────────────────

  async listAudit(dto: AuditQueryDto) {
    const where: Prisma.AuditLogWhereInput = {};
    if (dto.actorId) where.actorId = dto.actorId;
    if (dto.action) where.action = { contains: dto.action, mode: 'insensitive' };
    if (dto.resourceType) where.resourceType = dto.resourceType;
    if (dto.from || dto.to) {
      where.createdAt = {};
      if (dto.from) where.createdAt.gte = new Date(dto.from);
      if (dto.to) where.createdAt.lt = new Date(dto.to);
    }
    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: dto.limit ?? 100,
      include: { actor: { select: { id: true, fullName: true, email: true } } },
    });
  }
}
