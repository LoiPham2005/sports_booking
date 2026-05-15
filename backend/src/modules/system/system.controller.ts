import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemService } from './system.service';
import {
  SetRoleDto,
  UpdateFeatureFlagDto,
  UpdateSettingsDto,
} from './dto/system.dto';

@ApiBearerAuth()
@ApiTags('system')
@Roles(Role.SUPER_ADMIN)
@Controller('system')
export class SystemController {
  constructor(private system: SystemService) {}

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
}
