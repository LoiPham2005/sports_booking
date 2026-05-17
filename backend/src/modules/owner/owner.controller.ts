import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { Public, Roles } from '../../common/decorators/roles.decorator';
import { OwnerService } from './owner.service';
import {
  CreateWalkInDto,
  InviteStaffDto,
  ListBookingsQueryDto,
  RefuseBookingDto,
  ReportsQueryDto,
  UpdateStaffDto,
  UpsertBankAccountDto,
} from './dto/owner.dto';

@ApiBearerAuth()
@ApiTags('owner')
@Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
@Controller('owner')
export class OwnerController {
  constructor(private owner: OwnerService) {}

  // Dashboard
  @Get('dashboard')
  dashboard(@CurrentUser() user: JwtUser) {
    return this.owner.dashboard(user.sub);
  }

  // Venue submit (DRAFT → PENDING)
  @Post('venues/:id/submit')
  submitVenue(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.owner.submitVenue(user.sub, id);
  }

  // Bookings
  @Get('bookings')
  bookings(@CurrentUser() user: JwtUser, @Query() q: ListBookingsQueryDto) {
    return this.owner.listBookings(user.sub, q);
  }

  @Post('bookings/walk-in')
  walkIn(@CurrentUser() user: JwtUser, @Body() dto: CreateWalkInDto) {
    return this.owner.createWalkIn(user.sub, dto);
  }

  @Patch('bookings/:id/refuse')
  refuse(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: RefuseBookingDto,
  ) {
    return this.owner.refuseBooking(user.sub, id, dto);
  }

  // Staff
  @Get('staff')
  staff(@CurrentUser() user: JwtUser, @Query('venueId') venueId?: string) {
    return this.owner.listStaff(user.sub, venueId);
  }

  @Post('staff/invite')
  invite(@CurrentUser() user: JwtUser, @Body() dto: InviteStaffDto) {
    return this.owner.inviteStaff(user.sub, dto);
  }

  @Patch('staff/:id')
  updateStaff(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.owner.updateStaff(user.sub, id, dto);
  }

  @Delete('staff/:id')
  removeStaff(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.owner.removeStaff(user.sub, id);
  }

  // Reports
  @Get('reports')
  reports(@CurrentUser() user: JwtUser, @Query() q: ReportsQueryDto) {
    return this.owner.reports(user.sub, q);
  }

  // Payout
  @Get('payout')
  payoutSummary(@CurrentUser() user: JwtUser) {
    return this.owner.payoutSummary(user.sub);
  }

  @Post('payout/request')
  payoutRequest(@CurrentUser() user: JwtUser) {
    return this.owner.requestPayout(user.sub);
  }

  // Bank accounts
  @Get('bank-accounts')
  listBankAccounts(@CurrentUser() user: JwtUser) {
    return this.owner.listBankAccounts(user.sub);
  }

  @Post('bank-accounts')
  createBankAccount(@CurrentUser() user: JwtUser, @Body() dto: UpsertBankAccountDto) {
    return this.owner.upsertBankAccount(user.sub, dto);
  }

  @Patch('bank-accounts/:id/default')
  setDefaultBankAccount(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.owner.setDefaultBankAccount(user.sub, id);
  }

  @Delete('bank-accounts/:id')
  deleteBankAccount(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.owner.deleteBankAccount(user.sub, id);
  }
}

/**
 * Staff accept invite — public endpoint vì link gửi qua email.
 * (Cần đăng nhập sau khi click để biết userId — frontend handle redirect login → accept.)
 */
@ApiBearerAuth()
@ApiTags('owner')
@Controller('staff/invites')
export class StaffInviteController {
  constructor(private owner: OwnerService) {}

  @Post(':token/accept')
  accept(@CurrentUser() user: JwtUser, @Param('token') token: string) {
    return this.owner.acceptInvite(user.sub, token);
  }

  /** Preview info trước khi accept — kiểm tra invite còn valid không. Không cần auth. */
  @Public()
  @Get(':token')
  preview(@Param('token') _token: string) {
    return { ok: true };
  }
}
