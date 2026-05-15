import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, VenueStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVenueDto, SearchVenuesDto, UpdateVenueDto } from './dto/venue.dto';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  async search(dto: SearchVenuesDto) {
    const where: Prisma.VenueWhereInput = {
      status: VenueStatus.APPROVED,
      deletedAt: null,
    };
    if (dto.city) where.city = dto.city;
    if (dto.district) where.district = dto.district;
    if (dto.q) {
      where.OR = [
        { name: { contains: dto.q, mode: 'insensitive' } },
        { description: { contains: dto.q, mode: 'insensitive' } },
        { addressLine: { contains: dto.q, mode: 'insensitive' } },
      ];
    }
    if (dto.sportSlug) {
      where.courts = { some: { sport: { slug: dto.sportSlug }, isActive: true } };
    }

    const limit = dto.limit ?? 20;
    const items = await this.prisma.venue.findMany({
      where,
      take: limit + 1,
      cursor: dto.cursor ? { id: dto.cursor } : undefined,
      skip: dto.cursor ? 1 : 0,
      orderBy: [{ ratingAvg: 'desc' }, { id: 'asc' }],
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { courts: true } },
      },
    });

    const hasMore = items.length > limit;
    const data = items.slice(0, limit);
    return {
      data,
      nextCursor: hasMore ? data[data.length - 1].id : null,
    };
  }

  detail(id: string) {
    return this.prisma.venue.findUniqueOrThrow({
      where: { id },
      include: {
        images: true,
        amenities: { include: { amenity: true } },
        hours: true,
        courts: { where: { isActive: true, deletedAt: null }, include: { sport: true } },
        owner: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });
  }

  async create(ownerId: string, dto: CreateVenueDto) {
    const slug = await this.uniqueSlug(dto.name);
    return this.prisma.venue.create({
      data: {
        ownerId,
        name: dto.name,
        slug,
        description: dto.description,
        addressLine: dto.addressLine,
        ward: dto.ward,
        district: dto.district,
        city: dto.city,
        phone: dto.phone,
        lat: dto.lat,
        lng: dto.lng,
        status: VenueStatus.PENDING,
      },
    });
  }

  async update(id: string, ownerId: string, dto: UpdateVenueDto) {
    await this.assertOwner(id, ownerId);
    return this.prisma.venue.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        addressLine: dto.addressLine,
        ward: dto.ward,
        district: dto.district,
        city: dto.city,
        phone: dto.phone,
        lat: dto.lat,
        lng: dto.lng,
      },
    });
  }

  async approve(id: string) {
    return this.prisma.venue.update({
      where: { id },
      data: { status: VenueStatus.APPROVED },
    });
  }

  async reject(id: string) {
    return this.prisma.venue.update({
      where: { id },
      data: { status: VenueStatus.SUSPENDED },
    });
  }

  async listOwned(ownerId: string) {
    return this.prisma.venue.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assertOwner(venueId: string, userId: string, allowStaff = false) {
    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
      include: { members: true },
    });
    if (!venue) throw new NotFoundException('Venue not found');
    if (venue.ownerId === userId) return venue;
    if (allowStaff && venue.members.some((m) => m.userId === userId)) return venue;
    throw new ForbiddenException('Not the owner of this venue');
  }

  async assertOwnerOrAdmin(venueId: string, userId: string, role: Role) {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      const v = await this.prisma.venue.findUnique({ where: { id: venueId } });
      if (!v) throw new NotFoundException();
      return v;
    }
    return this.assertOwner(venueId, userId);
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
    let slug = base || 'venue';
    let i = 1;
    while (await this.prisma.venue.findUnique({ where: { slug } })) {
      i += 1;
      slug = `${base}-${i}`;
    }
    return slug;
  }
}
