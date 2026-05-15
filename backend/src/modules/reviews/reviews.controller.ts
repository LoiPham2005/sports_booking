import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { Public, Roles } from '../../common/decorators/roles.decorator';
import { CreateReviewDto, OwnerReplyDto } from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Public()
  @Get('venues/:id/reviews')
  list(@Param('id') venueId: string, @Query('sort') sort?: 'recent' | 'rating') {
    return this.reviews.listByVenue(venueId, sort);
  }

  @ApiBearerAuth()
  @Post('reviews')
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.sub, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('owner/reviews/:id/reply')
  reply(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: OwnerReplyDto) {
    return this.reviews.reply(id, user.sub, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('admin/reviews/:id/hide')
  hide(@Param('id') id: string) {
    return this.reviews.hide(id);
  }
}
