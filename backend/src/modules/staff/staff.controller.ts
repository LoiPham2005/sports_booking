import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { StaffService } from './staff.service';
import {
  CheckInDto,
  CreateOverrideDto,
  RevenueQueryDto,
  ScheduleQueryDto,
} from './dto/staff.dto';

/**
 * Tất cả endpoints ở đây yêu cầu user là **VenueMember** đã active của ít nhất 1 venue.
 * Không dùng `@Roles()` decorator vì role-level CUSTOMER có thể là VenueMember (sub-role).
 * Authorization thực tế làm trong service qua `venueIdsForUser` + `assertManager`.
 */
@ApiBearerAuth()
@ApiTags('staff')
@Controller('staff')
export class StaffController {
  constructor(private staff: StaffService) {}

  /** Tóm tắt memberships của user — frontend dùng để biết có phải Staff/Manager không. */
  @Get('memberships')
  memberships(@CurrentUser() user: JwtUser) {
    return this.staff.memberships(user.sub);
  }

  // Common
  @Get('today')
  today(@CurrentUser() user: JwtUser) {
    return this.staff.today(user.sub);
  }

  @Get('schedule')
  schedule(@CurrentUser() user: JwtUser, @Query() q: ScheduleQueryDto) {
    return this.staff.schedule(user.sub, q);
  }

  @Post('check-in')
  checkIn(@CurrentUser() user: JwtUser, @Body() dto: CheckInDto) {
    return this.staff.checkIn(user.sub, dto);
  }

  // Manager-only
  @Get('revenue')
  revenue(@CurrentUser() user: JwtUser, @Query() q: RevenueQueryDto) {
    return this.staff.revenue(user.sub, q);
  }

  @Get('team')
  team(@CurrentUser() user: JwtUser, @Query('venueId') venueId?: string) {
    return this.staff.team(user.sub, venueId);
  }

  @Get('pricing/overrides')
  listOverrides(@CurrentUser() user: JwtUser, @Query('venueId') venueId: string) {
    return this.staff.listOverrides(user.sub, venueId);
  }

  @Post('pricing/overrides')
  createOverride(@CurrentUser() user: JwtUser, @Body() dto: CreateOverrideDto) {
    return this.staff.createOverride(user.sub, dto);
  }

  @Delete('pricing/overrides/:id')
  deleteOverride(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.staff.deleteOverride(user.sub, id);
  }
}
