import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { UpdateMeDto } from './dto/update-me.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@ApiTags('me')
@Controller('me')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  me(@CurrentUser() user: JwtUser) {
    return this.users.me(user.sub);
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
