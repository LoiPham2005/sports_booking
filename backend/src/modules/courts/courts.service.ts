import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClosureDto, CreateCourtDto, UpdateCourtDto } from './dto/court.dto';
import { VenuesService } from '../venues/venues.service';

@Injectable()
export class CourtsService {
  constructor(private prisma: PrismaService, private venues: VenuesService) {}

  detail(id: string) {
    return this.prisma.court.findUniqueOrThrow({
      where: { id },
      include: { sport: true, venue: true, priceRules: true },
    });
  }

  async create(venueId: string, ownerId: string, dto: CreateCourtDto) {
    await this.venues.assertOwner(venueId, ownerId);
    return this.prisma.court.create({
      data: {
        venueId,
        sportId: dto.sportId,
        name: dto.name,
        surface: dto.surface,
        indoor: dto.indoor ?? false,
        capacity: dto.capacity ?? 10,
        slotDurationMinutes: dto.slotDurationMinutes ?? 60,
      },
    });
  }

  async update(id: string, ownerId: string, dto: UpdateCourtDto) {
    const court = await this.prisma.court.findUnique({ where: { id } });
    if (!court) throw new NotFoundException();
    await this.venues.assertOwner(court.venueId, ownerId);
    return this.prisma.court.update({ where: { id }, data: dto });
  }

  async softDelete(id: string, ownerId: string) {
    const court = await this.prisma.court.findUnique({ where: { id } });
    if (!court) throw new NotFoundException();
    await this.venues.assertOwner(court.venueId, ownerId);
    await this.prisma.court.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async addClosure(courtId: string, ownerId: string, dto: CreateClosureDto) {
    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    if (!court) throw new NotFoundException();
    await this.venues.assertOwner(court.venueId, ownerId);
    return this.prisma.courtClosure.create({
      data: {
        courtId,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        reason: dto.reason,
      },
    });
  }

  async listByVenue(venueId: string) {
    return this.prisma.court.findMany({
      where: { venueId, deletedAt: null },
      include: { sport: true },
      orderBy: { name: 'asc' },
    });
  }
}
