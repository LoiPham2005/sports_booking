import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemService } from './system.service';
import { PermissionsService } from './permissions.service';
import {
  SetRoleDto,
  UpdateFeatureFlagDto,
  UpdateSettingsDto,
} from './dto/system.dto';
import { UpdateRolePermissionsDto } from './dto/permissions.dto';

@ApiBearerAuth()
@ApiTags('system')
@Roles(Role.SUPER_ADMIN)
@Controller('system')
export class SystemController {
  constructor(
    private system: SystemService,
    private permissions: PermissionsService,
  ) {}

  // Settings
  @Get('settings')
  getSettings() {
    return this.system.getSettings();
  }

  @Patch('settings')
  updateSettings(@CurrentUser() user: JwtUser, @Body() dto: UpdateSettingsDto) {
    return this.system.updateSettings(user.sub, dto);
  }

  // Roles (admin list + promote/demote)
  @Get('admins')
  admins() {
    return this.system.listAdmins();
  }

  @Patch('users/:id/role')
  setRole(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: SetRoleDto,
  ) {
    return this.system.setUserRole(user.sub, id, dto.role);
  }

  // Feature flags
  @Get('feature-flags')
  flags() {
    return this.system.listFeatureFlags();
  }

  @Patch('feature-flags/:key')
  setFlag(
    @CurrentUser() user: JwtUser,
    @Param('key') key: string,
    @Body() dto: UpdateFeatureFlagDto,
  ) {
    return this.system.updateFeatureFlag(user.sub, key, dto);
  }

  // ─────────────────── Permissions ───────────────────

  @Get('permissions')
  listPermissions() {
    return this.permissions.listPermissions();
  }

  @Get('permissions/matrix')
  getMatrix() {
    return this.permissions.getMatrix();
  }

  @Put('permissions/:role')
  updateRolePermissions(
    @CurrentUser() user: JwtUser,
    @Param('role') role: Role,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.permissions.updateRolePermissions(user.sub, role, dto.keys);
  }
}
