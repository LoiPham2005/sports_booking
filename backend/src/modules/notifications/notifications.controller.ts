import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

class RegisterDeviceDto {
  @IsString() fcmToken!: string;
  @IsEnum(['IOS', 'ANDROID', 'WEB'] as const) platform!: 'IOS' | 'ANDROID' | 'WEB';
}

@ApiBearerAuth()
@ApiTags('notifications')
@Controller()
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get('me/notifications')
  list(@CurrentUser() user: JwtUser) {
    return this.notifications.list(user.sub);
  }

  @Post('me/notifications/:id/read')
  read(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.notifications.markRead(user.sub, id);
  }

  @Post('devices')
  register(@CurrentUser() user: JwtUser, @Body() dto: RegisterDeviceDto) {
    return this.notifications.registerDevice(user.sub, dto.platform, dto.fcmToken);
  }

  @Delete('devices/:id')
  unregister(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.notifications.unregisterDevice(user.sub, id);
  }
}
