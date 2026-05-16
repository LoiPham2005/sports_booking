import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, VenueStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVenueDto, SearchVenuesDto, UpdateVenueDto } from './dto/venue.dto';

/**
 * Tham số include chuẩn cho venue card (search list + featured).
 * Trả về đủ data UI mà không cần fetch lại nested.
 */
const venueCardInclude = {
  images: { orderBy: { sort: 'asc' as const } },
  amenities: { include: { amenity: true } },
  courts: {
    where: { isActive: true, deletedAt: null },
    select: {
      id: true,
      sport: { select: { id: true, slug: true, nameVi: true, nameEn: true, icon: true } },
      priceRules: { select: { pricePerSlot: true } },
    },
  },
};

/**
 * Tham số include cho venue detail page (đầy đủ courts + reviews + hours).
 */
const venueDetailInclude = {
  images: { orderBy: { sort: 'asc' as const } },
  amenities: { include: { amenity: true } },
  hours: { orderBy: { dayOfWeek: 'asc' as const } },
  courts: {
    where: { isActive: true, deletedAt: null },
    include: {
      sport: true,
      priceRules: true,
    },
  },
  owner: { select: { id: true, fullName: true, avatarUrl: true } },
  reviews: {
    where: { status: 'VISIBLE' as const },
    orderBy: { createdAt: 'desc' as const },
    take: 5,
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  },
  _count: { select: { reviews: { where: { status: 'VISIBLE' as const } } } },
};

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
      orderBy: this.orderByFor(dto.sortBy),
      include: venueCardInclude,
    });

    const hasMore = items.length > limit;
    const data = items.slice(0, limit).map((v) => this.enrichCard(v, dto));
    return {
      data,
      nextCursor: hasMore ? data[data.length - 1].id : null,
    };
  }

  async detail(idOrSlug: string) {
    // Hỗ trợ tra cứu cả id (cuid) lẫn slug. cuid bắt đầu bằng 'c' + dài 25 ký tự.
    const isLikelyId = /^c[a-z0-9]{20,}$/i.test(idOrSlug);
    const where = isLikelyId ? { id: idOrSlug } : { slug: idOrSlug };
    const v = await this.prisma.venue.findUnique({ where, include: venueDetailInclude });
    if (!v) throw new NotFoundException('Venue not found');
    return this.enrichDetail(v);
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
        newCity: dto.newCity,
        newWard: dto.newWard,
        provinceCode: dto.provinceCode,
        wardCode: dto.wardCode,
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
        newCity: dto.newCity,
        newWard: dto.newWard,
        provinceCode: dto.provinceCode,
        wardCode: dto.wardCode,
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

  // ─────────── Hours ───────────

  async listHours(venueId: string) {
    return this.prisma.venueHour.findMany({
      where: { venueId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  /**
   * Replace toàn bộ giờ mở cửa của venue (xoá hết rồi tạo lại).
   * Mỗi ngày có thể có nhiều slot (vd nghỉ trưa: 6-12 + 13-22).
   */
  async upsertHours(
    venueId: string,
    ownerId: string,
    hours: { dayOfWeek: number; openTime: string; closeTime: string }[],
  ) {
    await this.assertOwner(venueId, ownerId);
    await this.prisma.$transaction([
      this.prisma.venueHour.deleteMany({ where: { venueId } }),
      this.prisma.venueHour.createMany({
        data: hours.map((h) => ({
          venueId,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
        })),
      }),
    ]);
    return this.listHours(venueId);
  }

  // ─────────── Images ───────────

  async listImages(venueId: string) {
    return this.prisma.venueImage.findMany({
      where: { venueId },
      orderBy: [{ isPrimary: 'desc' }, { sort: 'asc' }],
    });
  }

  async addImage(
    venueId: string,
    ownerId: string,
    dto: { url: string; key?: string; sort?: number; isPrimary?: boolean },
  ) {
    await this.assertOwner(venueId, ownerId);
    // Nếu set isPrimary=true → un-set primary của các ảnh khác cùng venue
    if (dto.isPrimary) {
      await this.prisma.venueImage.updateMany({
        where: { venueId, isPrimary: true },
        data: { isPrimary: false },
      });
    }
    const current = await this.prisma.venueImage.count({ where: { venueId } });
    return this.prisma.venueImage.create({
      data: {
        venueId,
        url: dto.url,
        sort: dto.sort ?? current,
        isPrimary: dto.isPrimary ?? current === 0, // ảnh đầu auto-primary
      },
    });
  }

  async deleteImage(venueId: string, ownerId: string, imageId: string) {
    await this.assertOwner(venueId, ownerId);
    const img = await this.prisma.venueImage.findFirst({ where: { id: imageId, venueId } });
    if (!img) return { ok: true };
    await this.prisma.venueImage.delete({ where: { id: imageId } });
    return { ok: true };
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

  // ─────────────────── Enrich helpers ───────────────────

  /**
   * Denormalize sports[], priceFrom, distance, flatten amenities cho venue card.
   */
  private enrichCard(
    v: Prisma.VenueGetPayload<{ include: typeof venueCardInclude }>,
    dto: SearchVenuesDto,
  ) {
    const sportMap = new Map<string, { id: string; slug: string; nameVi: string; nameEn: string; icon: string | null }>();
    let minPrice: number | null = null;
    for (const court of v.courts) {
      if (court.sport) sportMap.set(court.sport.id, court.sport);
      for (const rule of court.priceRules) {
        const p = Number(rule.pricePerSlot);
        if (minPrice === null || p < minPrice) minPrice = p;
      }
    }
    const amenities = v.amenities.map((a) => a.amenity);
    const distance =
      dto.lat != null && dto.lng != null && v.lat != null && v.lng != null
        ? haversineKm(dto.lat, dto.lng, Number(v.lat), Number(v.lng))
        : undefined;

    const { courts: _c, amenities: _a, ...rest } = v;
    return {
      ...rest,
      sports: Array.from(sportMap.values()),
      amenities,
      priceFrom: minPrice ?? 0,
      distance,
    };
  }

  private enrichDetail(v: Prisma.VenueGetPayload<{ include: typeof venueDetailInclude }>) {
    const sportMap = new Map<string, { id: string; slug: string; nameVi: string; nameEn: string; icon: string | null; defaultSlotMinutes: number; isActive: boolean }>();
    let minPrice: number | null = null;
    for (const court of v.courts) {
      if (court.sport) sportMap.set(court.sport.id, court.sport);
      for (const rule of court.priceRules) {
        const p = Number(rule.pricePerSlot);
        if (minPrice === null || p < minPrice) minPrice = p;
      }
    }
    const amenities = v.amenities.map((a) => a.amenity);
    const { amenities: _a, _count, ...rest } = v;
    return {
      ...rest,
      amenities,
      sports: Array.from(sportMap.values()),
      priceFrom: minPrice ?? 0,
      reviewsCount: _count.reviews,
    };
  }

  private orderByFor(sortBy: SearchVenuesDto['sortBy']): Prisma.VenueOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'rating':
        return [{ ratingAvg: 'desc' }, { id: 'asc' }];
      case 'newest':
        return [{ createdAt: 'desc' }, { id: 'asc' }];
      default:
        return [{ ratingAvg: 'desc' }, { id: 'asc' }];
    }
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

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
