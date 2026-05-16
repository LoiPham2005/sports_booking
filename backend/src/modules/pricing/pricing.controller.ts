import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { Public, Roles } from '../../common/decorators/roles.decorator';
import { CreatePriceOverrideDto, CreatePriceRuleDto } from './dto/price.dto';
import { PricingService } from './pricing.service';

@ApiTags('pricing')
@Controller()
export class PricingController {
  constructor(private pricing: PricingService) {}

  @Public()
  @Get('courts/:id/price')
  quote(
    @Param('id') courtId: string,
    @Query('startsAt') startsAt: string,
    @Query('endsAt') endsAt: string,
  ) {
    return this.pricing.quote({
      courtId,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
    });
  }

  @Public()
  @Get('courts/:id/price-rules')
  rules(@Param('id') courtId: string) {
    return this.pricing.listRules(courtId);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('owner/courts/:id/price-rules')
  addRule(
    @Param('id') courtId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreatePriceRuleDto,
  ) {
    return this.pricing.addRule(courtId, user.sub, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('owner/courts/:id/price-overrides')
  addOverride(
    @Param('id') courtId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreatePriceOverrideDto,
  ) {
    return this.pricing.addOverride(courtId, user.sub, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('owner/price-rules/:id')
  updateRule(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreatePriceRuleDto,
  ) {
    return this.pricing.updateRule(id, user.sub, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('owner/price-rules/:id')
  deleteRule(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.pricing.deleteRule(id, user.sub);
  }
}
