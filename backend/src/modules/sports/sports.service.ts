import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SportsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.sport.findMany({ where: { isActive: true }, orderBy: { nameVi: 'asc' } });
  }

  bySlug(slug: string) {
    return this.prisma.sport.findUniqueOrThrow({ where: { slug } });
  }
}
