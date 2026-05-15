import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { Public, Roles } from '../../common/decorators/roles.decorator';
import { CourtsService } from './courts.service';
import { CreateClosureDto, CreateCourtDto, UpdateCourtDto } from './dto/court.dto';

@ApiTags('courts')
@Controller()
export class CourtsController {
  constructor(private courts: CourtsService) {}

  @Public()
  @Get('venues/:venueId/courts')
  byVenue(@Param('venueId') venueId: string) {
    return this.courts.listByVenue(venueId);
  }

  @Public()
  @Get('courts/:id')
  detail(@Param('id') id: string) {
    return this.courts.detail(id);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('owner/venues/:venueId/courts')
  create(
    @Param('venueId') venueId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateCourtDto,
  ) {
    return this.courts.create(venueId, user.sub, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('owner/courts/:id')
  update(@Param('id') id: string, @CurrentUser() user: JwtUser, @Body() dto: UpdateCourtDto) {
    return this.courts.update(id, user.sub, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('owner/courts/:id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    await this.courts.softDelete(id, user.sub);
    return { ok: true };
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('owner/courts/:id/closures')
  closure(@Param('id') id: string, @CurrentUser() user: JwtUser, @Body() dto: CreateClosureDto) {
    return this.courts.addClosure(id, user.sub, dto);
  }
}
