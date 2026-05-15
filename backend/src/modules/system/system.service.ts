import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateFeatureFlagDto, UpdateSettingsDto } from './dto/system.dto';

/**
 * Hệ thống setting & feature flag — chỉ SUPER_ADMIN truy cập.
 *
 * Pattern: ENV là default, DB row override runtime.
 */
@Injectable()
export class SystemService {
  constructor(
    private prisma: PrismaService,
    private cfg: ConfigService,
  ) {}

  // ─────────────────── Settings ───────────────────

  /**
   * Đọc settings. Defaults từ env config, các giá trị nào có trong DB sẽ override.
   */
  async getSettings() {
    const rows = await this.prisma.systemSetting.findMany();
    const overrides: Record<string, unknown> = {};
    for (const r of rows) overrides[r.key] = r.value;

    return {
      commissionPercent:
        (overrides.commissionPercent as number | undefined) ??
        this.cfg.get<number>('commission.percent', 10),
      bookingHoldMinutes:
        (overrides.bookingHoldMinutes as number | undefined) ??
        this.cfg.get<number>('booking.holdMinutes', 10),
      paymentTimeoutMinutes:
        (overrides.paymentTimeoutMinutes as number | undefined) ??
        this.cfg.get<number>('booking.paymentTimeoutMinutes', 15),
      defaultCancelPolicy:
        (overrides.defaultCancelPolicy as unknown) ?? {
          hours24Refund: 100,
          hours12Refund: 50,
          under12Refund: 0,
        },
      payoutSchedule: (overrides.payoutSchedule as string | undefined) ?? 'WEEKLY_MON',
      vatPercent: (overrides.vatPercent as number | undefined) ?? 0,
    };
  }

  async updateSettings(actorId: string, dto: UpdateSettingsDto) {
    const updates: Prisma.PrismaPromise<unknown>[] = [];
    for (const [key, value] of Object.entries(dto)) {
      if (value === undefined) continue;
      updates.push(
        this.prisma.systemSetting.upsert({
          where: { key },
          create: { key, value: value as Prisma.InputJsonValue, updatedBy: actorId },
          update: { value: value as Prisma.InputJsonValue, updatedBy: actorId },
        }),
      );
    }
    await this.prisma.$transaction(updates);
    return this.getSettings();
  }

  // ─────────────────── Admins / Roles ───────────────────

  async listAdmins() {
    return this.prisma.user.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
        status: { not: UserStatus.DELETED },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  /**
   * Promote/demote user. Chỉ SUPER_ADMIN gọi được (controller enforce).
   * Không cho phép demote SUPER_ADMIN cuối cùng để tránh khoá hệ thống.
   */
  async setUserRole(actorId: string, userId: string, role: Role) {
    if (actorId === userId && role !== Role.SUPER_ADMIN) {
      throw new BadRequestException('Cannot demote yourself');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();

    if (user.role === Role.SUPER_ADMIN && role !== Role.SUPER_ADMIN) {
      const remaining = await this.prisma.user.count({
        where: { role: Role.SUPER_ADMIN, status: UserStatus.ACTIVE, id: { not: userId } },
      });
      if (remaining === 0) {
        throw new BadRequestException(
          'Cannot demote the last SUPER_ADMIN — system would have no super-admin',
        );
      }
    }

    const before = user;
    const after = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId,
        actorRole: 'SUPER_ADMIN',
        action: 'ROLE_CHANGE',
        resourceType: 'User',
        resourceId: userId,
        beforeJson: { role: before.role } as Prisma.InputJsonValue,
        afterJson: { role: after.role } as Prisma.InputJsonValue,
      },
    });

    return after;
  }

  // ─────────────────── Feature flags ───────────────────

  async listFeatureFlags() {
    const flags = await this.prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });
    if (flags.length === 0) {
      // Seed defaults
      const defaults = [
        { key: 'recurring_bookings', description: 'Đặt sân định kỳ' },
        { key: 'voucher_apply_customer', description: 'Customer áp dụng voucher khi checkout' },
        { key: 'realtime_calendar', description: 'WebSocket update lịch booking realtime' },
        { key: 'fcm_push', description: 'Push notification qua FCM' },
        { key: 'dark_mode_ui', description: 'Toggle dark mode trên web/mobile' },
      ];
      await this.prisma.featureFlag.createMany({ data: defaults, skipDuplicates: true });
      return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
    }
    return flags;
  }

  async updateFeatureFlag(actorId: string, key: string, dto: UpdateFeatureFlagDto) {
    const before = await this.prisma.featureFlag.findUnique({ where: { key } });

    const after = await this.prisma.featureFlag.upsert({
      where: { key },
      create: {
        key,
        enabled: dto.enabled ?? false,
        description: dto.description,
        updatedBy: actorId,
      },
      update: {
        enabled: dto.enabled,
        description: dto.description,
        updatedBy: actorId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId,
        actorRole: 'SUPER_ADMIN',
        action: 'FEATURE_FLAG_UPDATE',
        resourceType: 'FeatureFlag',
        resourceId: key,
        beforeJson: before ? ({ enabled: before.enabled } as Prisma.InputJsonValue) : undefined,
        afterJson: { enabled: after.enabled } as Prisma.InputJsonValue,
      },
    });

    return after;
  }
}
