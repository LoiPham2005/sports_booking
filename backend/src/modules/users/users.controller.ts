import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { UpdateMeDto } from './dto/update-me.dto';
import { UsersService } from './users.service';
import { PermissionsService } from '../system/permissions.service';

@ApiBearerAuth()
@ApiTags('me')
@Controller('me')
export class UsersController {
  constructor(
    private users: UsersService,
    private permissions: PermissionsService,
  ) {}

  @Get()
  me(@CurrentUser() user: JwtUser) {
    return this.users.me(user.sub);
  }

  /** Trả về list permission keys mà role hiện tại của user có. */
  @Get('permissions')
  async myPermissions(@CurrentUser() user: JwtUser) {
    const keys = await this.permissions.listKeysForRole(user.role);
    return { role: user.role, keys };
  }

  @Patch()
  update(@CurrentUser() user: JwtUser, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(user.sub, dto);
  }

  @Get('sessions')
  sessions(@CurrentUser() user: JwtUser) {
    return this.users.listSessions(user.sub);
  }

  @Delete('sessions/:id')
  async revoke(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    await this.users.revokeSession(user.sub, id);
    return { ok: true };
  }

  @Get('favorites')
  favorites(@CurrentUser() user: JwtUser) {
    return this.users.favorites(user.sub);
  }

  @Post('favorites/:venueId')
  addFavorite(@CurrentUser() user: JwtUser, @Param('venueId') venueId: string) {
    return this.users.addFavorite(user.sub, venueId);
  }

  @Delete('favorites/:venueId')
  async removeFavorite(@CurrentUser() user: JwtUser, @Param('venueId') venueId: string) {
    await this.users.removeFavorite(user.sub, venueId);
    return { ok: true };
  }
}
