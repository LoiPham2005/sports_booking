import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import {
  AuditQueryDto,
  ListUsersDto,
  ListVenuesDto,
  RejectVenueDto,
  ReportsAdminQueryDto,
  ResolveDisputeDto,
  UpdateUserDto,
} from './dto/admin.dto';

@ApiBearerAuth()
@ApiTags('admin')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  // Venues
  @Get('venues')
  listVenues(@Query() q: ListVenuesDto) {
    return this.admin.listVenues(q);
  }

  @Post('venues/:id/approve')
  approve(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.admin.approveVenue(user.sub, user.role, id);
  }

  @Post('venues/:id/reject')
  reject(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: RejectVenueDto,
  ) {
    return this.admin.rejectVenue(user.sub, user.role, id, dto);
  }

  @Post('venues/:id/suspend')
  suspend(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.admin.suspendVenue(user.sub, user.role, id);
  }

  // Users
  @Get('users')
  listUsers(@Query() q: ListUsersDto) {
    return this.admin.listUsers(q);
  }

  @Patch('users/:id')
  updateUser(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.admin.updateUser(user.sub, user.role, id, dto);
  }

  // Disputes
  @Get('disputes')
  disputes() {
    return this.admin.listDisputes();
  }

  @Post('disputes/:id/resolve')
  resolve(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.admin.resolveDispute(user.sub, user.role, id, dto);
  }

  // Reports
  @Get('reports')
  reports(@Query() q: ReportsAdminQueryDto) {
    return this.admin.reports(q);
  }

  // Audit
  @Get('audit')
  audit(@Query() q: AuditQueryDto) {
    return this.admin.listAudit(q);
  }
}
