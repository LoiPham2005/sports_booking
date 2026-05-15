import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { BookingsService } from './bookings.service';
import {
  CancelBookingDto,
  CreateBookingDto,
  QuoteBookingDto,
  RescheduleBookingDto,
} from './dto/booking.dto';

@ApiBearerAuth()
@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private bookings: BookingsService) {}

  @Post('quote')
  quote(@CurrentUser() user: JwtUser, @Body() dto: QuoteBookingDto) {
    return this.bookings.quote(user.sub, dto);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateBookingDto) {
    return this.bookings.createFromHold(user.sub, dto);
  }

  @Get('mine')
  mine(@CurrentUser() user: JwtUser) {
    return this.bookings.listMine(user.sub);
  }

  @Get(':id')
  detail(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.bookings.detail(id, user);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: CancelBookingDto) {
    return this.bookings.cancelByUser(id, user.sub, dto);
  }

  @Post(':id/reschedule')
  reschedule(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: RescheduleBookingDto,
  ) {
    return this.bookings.reschedule(id, user.sub, dto);
  }

  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post(':id/check-in')
  checkIn(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.bookings.checkIn(id, user.sub);
  }

  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post(':id/cancel-by-owner')
  cancelByOwner(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookings.cancelByOwner(id, user.sub, dto);
  }
}
