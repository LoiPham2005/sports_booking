import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { Public, Roles } from '../../common/decorators/roles.decorator';
import {
  CreateVenueDto,
  SearchVenuesDto,
  UpdateVenueDto,
  UpsertHoursDto,
  AddVenueImageDto,
} from './dto/venue.dto';
import { VenuesService } from './venues.service';

@ApiTags('venues')
@Controller('venues')
export class VenuesController {
  constructor(private venues: VenuesService) {}

  @Public()
  @Get()
  search(@Query() dto: SearchVenuesDto) {
    return this.venues.search(dto);
  }

  @Public()
  @Get(':id')
  detail(@Param('id') id: string) {
    return this.venues.detail(id);
  }

  @Public()
  @Get(':id/availability')
  availability(@Param('id') id: string, @Query('date') date: string) {
    return this.venues.availability(id, date);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('/owner')
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateVenueDto) {
    return this.venues.create(user.sub, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Get('/owner/list')
  myVenues(@CurrentUser() user: JwtUser) {
    return this.venues.listOwned(user.sub);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('/owner/:id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: UpdateVenueDto) {
    return this.venues.update(id, user.sub, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('/admin/:id/approve')
  approve(@Param('id') id: string) {
    return this.venues.approve(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('/admin/:id/reject')
  reject(@Param('id') id: string) {
    return this.venues.reject(id);
  }

  // ─────────── Venue Hours (7 ngày trong tuần) ───────────

  @Public()
  @Get(':id/hours')
  listHours(@Param('id') id: string) {
    return this.venues.listHours(id);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Put('/owner/:id/hours')
  upsertHours(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpsertHoursDto,
  ) {
    return this.venues.upsertHours(id, user.sub, dto.hours);
  }

  // ─────────── Venue Images ───────────

  @Public()
  @Get(':id/images')
  listImages(@Param('id') id: string) {
    return this.venues.listImages(id);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('/owner/:id/images')
  addImage(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: AddVenueImageDto,
  ) {
    return this.venues.addImage(id, user.sub, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('/owner/:id/images/:imageId')
  deleteImage(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.venues.deleteImage(id, user.sub, imageId);
  }
}
