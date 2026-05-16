import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLE_GRANTS } from './permissions.seed';

export interface PermissionMatrix {
  roles: Role[];
  permissions: {
    id: string;
    key: string;
    category: string;
    description: string;
  }[];
  /** Grant theo role: { ADMIN: ['venue.approve', ...], ... } */
  grants: Record<Role, string[]>;
}

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Đảm bảo các permission mặc định tồn tại trong DB. Không xóa permission cũ.
   * Lần đầu cũng seed grant mặc định cho ADMIN và SUPER_ADMIN.
   */
  private async ensureSeeded(): Promise<void> {
    const count = await this.prisma.permission.count();
    const isFirstTime = count === 0;

    await this.prisma.permission.createMany({
      data: DEFAULT_PERMISSIONS,
      skipDuplicates: true,
    });

    if (isFirstTime) {
      const all = await this.prisma.permission.findMany();
      const byKey = new Map(all.map((p) => [p.key, p.id]));
      const grants: Prisma.RolePermissionCreateManyInput[] = [];

      // SUPER_ADMIN có tất cả
      for (const p of all) {
        grants.push({ role: Role.SUPER_ADMIN, permissionId: p.id });
      }

      // Các role khác lấy theo DEFAULT_ROLE_GRANTS
      for (const [role, keys] of Object.entries(DEFAULT_ROLE_GRANTS) as [Role, string[]][]) {
        if (role === Role.SUPER_ADMIN) continue;
        for (const k of keys) {
          const pid = byKey.get(k);
          if (pid) grants.push({ role, permissionId: pid });
        }
      }

      if (grants.length > 0) {
        await this.prisma.rolePermission.createMany({ data: grants, skipDuplicates: true });
      }
      this.logger.log(`Seeded ${all.length} permissions and ${grants.length} role grants`);
    }
  }

  async listPermissions() {
    await this.ensureSeeded();
    return this.prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }

  /**
   * Trả về matrix: roles × permissions với grant hiện tại.
   * Frontend dùng để render bảng checkbox.
   */
  async getMatrix(): Promise<PermissionMatrix> {
    await this.ensureSeeded();
    const [permissions, rolePerms] = await Promise.all([
      this.prisma.permission.findMany({ orderBy: [{ category: 'asc' }, { key: 'asc' }] }),
      this.prisma.rolePermission.findMany({ include: { permission: { select: { key: true } } } }),
    ]);

    const grants: Record<Role, string[]> = {
      CUSTOMER: [],
      OWNER: [],
      STAFF: [],
      ADMIN: [],
      SUPER_ADMIN: [],
    };
    for (const rp of rolePerms) {
      grants[rp.role].push(rp.permission.key);
    }

    return {
      roles: [Role.CUSTOMER, Role.OWNER, Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN],
      permissions: permissions.map((p) => ({
        id: p.id,
        key: p.key,
        category: p.category,
        description: p.description,
      })),
      grants,
    };
  }

  /**
   * Replace toàn bộ permission của một role.
   * - Không cho phép sửa SUPER_ADMIN (luôn có full quyền) để tránh tự khóa.
   * - Validate mọi key đều tồn tại trong DB.
   */
  async updateRolePermissions(actorId: string, role: Role, keys: string[]) {
    if (role === Role.SUPER_ADMIN) {
      throw new BadRequestException('Cannot modify SUPER_ADMIN permissions — always full access');
    }

    const uniqueKeys = Array.from(new Set(keys));
    const perms = await this.prisma.permission.findMany({
      where: { key: { in: uniqueKeys } },
      select: { id: true, key: true },
    });
    if (perms.length !== uniqueKeys.length) {
      const found = new Set(perms.map((p) => p.key));
      const missing = uniqueKeys.filter((k) => !found.has(k));
      throw new BadRequestException(`Unknown permission keys: ${missing.join(', ')}`);
    }

    const before = await this.prisma.rolePermission.findMany({
      where: { role },
      include: { permission: { select: { key: true } } },
    });

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { role } }),
      this.prisma.rolePermission.createMany({
        data: perms.map((p) => ({ role, permissionId: p.id, grantedBy: actorId })),
      }),
    ]);

    await this.prisma.auditLog.create({
      data: {
        actorId,
        actorRole: 'SUPER_ADMIN',
        action: 'ROLE_PERMISSIONS_UPDATE',
        resourceType: 'Role',
        resourceId: role,
        beforeJson: { keys: before.map((b) => b.permission.key) } as Prisma.InputJsonValue,
        afterJson: { keys: uniqueKeys } as Prisma.InputJsonValue,
      },
    });

    return this.getMatrix();
  }

  /**
   * Helper cho guard/decorator: kiểm tra role có quyền không.
   * SUPER_ADMIN luôn true.
   */
  async hasPermission(role: Role, key: string): Promise<boolean> {
    if (role === Role.SUPER_ADMIN) return true;
    const found = await this.prisma.rolePermission.findFirst({
      where: { role, permission: { key } },
      select: { role: true },
    });
    return !!found;
  }
}
