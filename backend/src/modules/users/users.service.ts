import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        avatarUrl: true,
        dob: true,
        gender: true,
        locale: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { ...dto, dob: dto.dob ? new Date(dto.dob) : undefined },
    });
  }

  async listSessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        ip: true,
        userAgent: true,
        deviceId: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const r = await this.prisma.refreshToken.findFirst({ where: { id: sessionId, userId } });
    if (!r) throw new NotFoundException();
    await this.prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async favorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { venue: { select: { id: true, name: true, slug: true, city: true, ratingAvg: true } } },
    });
  }

  async addFavorite(userId: string, venueId: string) {
    return this.prisma.favorite.upsert({
      where: { userId_venueId: { userId, venueId } },
      create: { userId, venueId },
      update: {},
    });
  }

  async removeFavorite(userId: string, venueId: string) {
    await this.prisma.favorite
      .delete({ where: { userId_venueId: { userId, venueId } } })
      .catch(() => undefined);
  }
}
