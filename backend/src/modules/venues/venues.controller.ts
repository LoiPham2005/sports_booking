import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { Public, Roles } from '../../common/decorators/roles.decorator';
import { CreateVenueDto, SearchVenuesDto, UpdateVenueDto } from './dto/venue.dto';
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
}
