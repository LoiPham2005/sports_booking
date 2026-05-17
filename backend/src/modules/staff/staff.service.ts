import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  Prisma,
  VenueMemberRole,
  VenueMemberStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckInDto, CreateOverrideDto } from './dto/staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách venueIds + sub-role (Manager/Staff) của user hiện tại.
   * Một user có thể là Manager ở venue A nhưng Staff ở venue B.
   */
  async memberships(userId: string) {
    return this.prisma.venueMember.findMany({
      where: {
        userId,
        inviteStatus: VenueMemberStatus.ACTIVE,
      },
      include: { venue: { select: { id: true, name: true } } },
    });
  }

  /** True nếu user là Manager ít nhất 1 venue. */
  async isManager(userId: string): Promise<boolean> {
    const count = await this.prisma.venueMember.count({
      where: {
        userId,
        inviteStatus: VenueMemberStatus.ACTIVE,
        role: VenueMemberRole.MANAGER,
      },
    });
    return count > 0;
  }

  private async venueIdsForUser(userId: string): Promise<string[]> {
    const members = await this.prisma.venueMember.findMany({
      where: { userId, inviteStatus: VenueMemberStatus.ACTIVE },
      select: { venueId: true },
    });
    return members.map((m) => m.venueId);
  }

  private async assertManager(userId: string, venueId: string) {
    const m = await this.prisma.venueMember.findFirst({
      where: {
        userId,
        venueId,
        inviteStatus: VenueMemberStatus.ACTIVE,
        role: VenueMemberRole.MANAGER,
      },
    });
    if (!m) throw new ForbiddenException('Manager role required for this venue');
    return m;
  }

  // ─────────────────── Today / Schedule ───────────────────

  async today(userId: string) {
    const venueIds = await this.venueIdsForUser(userId);
    if (venueIds.length === 0) return [];

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 24 * 3600_000);

    return this.prisma.booking.findMany({
      where: {
        venueId: { in: venueIds },
        startsAt: { gte: start, lt: end },
      },
      orderBy: { startsAt: 'asc' },
      include: {
        court: { select: { id: true, name: true } },
        venue: { select: { id: true, name: true } },
        user: { select: { id: true, fullName: true, phone: true } },
      },
    });
  }

  async schedule(userId: string, params: { date?: string; days?: number }) {
    const venueIds = await this.venueIdsForUser(userId);
    if (venueIds.length === 0) return [];

    const start = params.date ? new Date(params.date) : new Date();
    start.setHours(0, 0, 0, 0);
    const days = params.days ?? 7;
    const end = new Date(start.getTime() + days * 24 * 3600_000);

    return this.prisma.booking.findMany({
      where: {
        venueId: { in: venueIds },
        startsAt: { gte: start, lt: end },
      },
      orderBy: { startsAt: 'asc' },
      include: {
        court: { select: { id: true, name: true } },
        venue: { select: { id: true, name: true } },
        user: { select: { id: true, fullName: true } },
      },
    });
  }

  // ─────────────────── Check-in ───────────────────

  async checkIn(userId: string, dto: CheckInDto) {
    const booking = await this.prisma.booking.findFirst({
      where: { OR: [{ checkInToken: dto.token }, { code: dto.token }] },
      include: { venue: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // Verify user là member của venue đó
    const venueIds = await this.venueIdsForUser(userId);
    if (!venueIds.includes(booking.venueId)) {
      throw new ForbiddenException('You are not staff of this venue');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(`Booking status is ${booking.status}, cannot check-in`);
    }

    return this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CHECKED_IN,
        checkedInAt: new Date(),
        handledByUserId: userId,
      },
    });
  }

  // ─────────────────── Manager: revenue ───────────────────

  async revenue(userId: string, params: { venueId?: string; date?: string }) {
    // Verify manager scope
    const memberships = await this.prisma.venueMember.findMany({
      where: {
        userId,
        inviteStatus: VenueMemberStatus.ACTIVE,
        role: VenueMemberRole.MANAGER,
      },
      select: { venueId: true },
    });
    if (memberships.length === 0) throw new ForbiddenException('Manager role required');
    let venueIds = memberships.map((m) => m.venueId);
    if (params.venueId) {
      if (!venueIds.includes(params.venueId)) throw new ForbiddenException();
      venueIds = [params.venueId];
    }

    const day = params.date ? new Date(params.date) : new Date();
    day.setHours(0, 0, 0, 0);
    const end = new Date(day.getTime() + 24 * 3600_000);

    const successStatuses: BookingStatus[] = ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'];

    const [agg, countAgg, byHour] = await Promise.all([
      this.prisma.booking.aggregate({
        where: {
          venueId: { in: venueIds },
          status: { in: successStatuses },
          startsAt: { gte: day, lt: end },
        },
        _sum: { total: true },
        _count: { _all: true },
      }),
      this.prisma.booking.count({
        where: {
          venueId: { in: venueIds },
          startsAt: { gte: day, lt: end },
        },
      }),
      this.prisma.$queryRaw<Array<{ hour: number; total: number; count: number }>>`
        SELECT EXTRACT(hour FROM "startsAt")::int AS hour,
               COALESCE(SUM("total"), 0)::float AS total,
               COUNT(*)::int AS count
        FROM "Booking"
        WHERE "venueId" = ANY(${venueIds})
          AND status::text = ANY(${successStatuses})
          AND "startsAt" >= ${day}
          AND "startsAt" < ${end}
        GROUP BY hour
        ORDER BY hour
      `,
    ]);

    const byCourt = await this.prisma.$queryRaw<Array<{ courtId: string; total: number; count: number }>>`
      SELECT "courtId",
             COALESCE(SUM("total"), 0)::float AS total,
             COUNT(*)::int AS count
      FROM "Booking"
      WHERE "venueId" = ANY(${venueIds})
        AND status::text = ANY(${successStatuses})
        AND "startsAt" >= ${day}
        AND "startsAt" < ${end}
      GROUP BY "courtId"
    `;
    const courts = await this.prisma.court.findMany({
      where: { id: { in: byCourt.map((b) => b.courtId) } },
      select: { id: true, name: true },
    });

    return {
      date: day.toISOString(),
      revenue: Number(agg._sum.total ?? 0),
      bookings: agg._count._all,
      totalSlots: countAgg,
      byHour: byHour.map((r) => ({ hour: r.hour, total: Number(r.total), count: r.count })),
      byCourt: byCourt.map((b) => ({
        courtId: b.courtId,
        courtName: courts.find((c) => c.id === b.courtId)?.name ?? b.courtId,
        total: Number(b.total),
        count: b.count,
      })),
    };
  }

  // ─────────────────── Manager: pricing overrides ───────────────────

  async listOverrides(userId: string, venueId: string) {
    await this.assertManager(userId, venueId);
    return this.prisma.priceOverride.findMany({
      where: { court: { venueId } },
      orderBy: { date: 'asc' },
      include: { court: { select: { id: true, name: true } } },
    });
  }

  async createOverride(userId: string, dto: CreateOverrideDto) {
    const court = await this.prisma.court.findUnique({
      where: { id: dto.courtId },
      select: { id: true, venueId: true },
    });
    if (!court) throw new NotFoundException('Court not found');

    await this.assertManager(userId, court.venueId);

    return this.prisma.priceOverride.create({
      data: {
        courtId: dto.courtId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        price: dto.price,
        reason: dto.reason,
      },
    });
  }

  async deleteOverride(userId: string, overrideId: string) {
    const o = await this.prisma.priceOverride.findUnique({
      where: { id: overrideId },
      include: { court: { select: { venueId: true } } },
    });
    if (!o) throw new NotFoundException();
    await this.assertManager(userId, o.court.venueId);
    await this.prisma.priceOverride.delete({ where: { id: overrideId } });
    return { ok: true };
  }

  // ─────────────────── Manager: team ───────────────────

  async team(userId: string, venueId?: string) {
    // Manager chỉ xem được team của venue mà họ là Manager.
    const managedVenues = await this.prisma.venueMember.findMany({
      where: {
        userId,
        inviteStatus: VenueMemberStatus.ACTIVE,
        role: VenueMemberRole.MANAGER,
      },
      select: { venueId: true },
    });
    if (managedVenues.length === 0) throw new ForbiddenException('Manager role required');

    let venueIds = managedVenues.map((m) => m.venueId);
    if (venueId) {
      if (!venueIds.includes(venueId)) throw new ForbiddenException();
      venueIds = [venueId];
    }

    return this.prisma.venueMember.findMany({
      where: {
        venueId: { in: venueIds },
        inviteStatus: { not: VenueMemberStatus.REMOVED },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        venue: { select: { id: true, name: true } },
        user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
      },
    });
  }

  // ─────────────────── Invite accept ───────────────────

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
}
