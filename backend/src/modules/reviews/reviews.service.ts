import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto, OwnerReplyDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async listByVenue(venueId: string, sort: 'recent' | 'rating' = 'recent') {
    return this.prisma.review.findMany({
      where: { venueId, status: 'VISIBLE' },
      orderBy: sort === 'rating' ? { rating: 'desc' } : { createdAt: 'desc' },
      include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
    });
  }

  async create(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
    if (!booking) throw new NotFoundException();
    if (booking.userId !== userId) throw new ForbiddenException();
    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Only COMPLETED bookings can be reviewed');
    }

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId,
          venueId: booking.venueId,
          bookingId: booking.id,
          rating: dto.rating,
          content: dto.content,
        },
      });

      const agg = await tx.review.aggregate({
        where: { venueId: booking.venueId, status: 'VISIBLE' },
        _avg: { rating: true },
        _count: true,
      });
      await tx.venue.update({
        where: { id: booking.venueId },
        data: {
          ratingAvg: new Prisma.Decimal(agg._avg.rating ?? 0).toDecimalPlaces(1),
          ratingCount: agg._count,
        },
      });
      return review;
    });
  }

  async reply(reviewId: string, ownerUserId: string, dto: OwnerReplyDto) {
    const review = await this.prisma.review.findUniqueOrThrow({
      where: { id: reviewId },
      include: { venue: true },
    });
    if (review.venue.ownerId !== ownerUserId) throw new ForbiddenException();
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { ownerReply: dto.reply, ownerRepliedAt: new Date() },
    });
  }

  async hide(reviewId: string) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { status: 'HIDDEN' },
    });
  }
}
