import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { JwtUser } from '../decorators/current-user.decorator';
import { PermissionsService } from '../../modules/system/permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissions: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as JwtUser | undefined;
    if (!user) throw new ForbiddenException('Unauthorized');

    if (user.role === Role.SUPER_ADMIN) return true;

    for (const key of required) {
      const ok = await this.permissions.hasPermission(user.role, key);
      if (!ok) throw new ForbiddenException(`Missing permission: ${key}`);
    }
    return true;
  }
}
