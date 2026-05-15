import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * List sports + `count` = số venue APPROVED có court của môn này.
   * Dùng cho home sport categories + filter chips.
   */
  async list() {
    const sports = await this.prisma.sport.findMany({
      where: { isActive: true },
      orderBy: { nameVi: 'asc' },
    });
    if (sports.length === 0) return [];

    const rows = await this.prisma.$queryRaw<Array<{ sportId: string; count: bigint }>>`
      SELECT c."sportId" AS "sportId", COUNT(DISTINCT c."venueId")::bigint AS "count"
      FROM "Court" c
      INNER JOIN "Venue" v ON v.id = c."venueId"
      WHERE c."isActive" = true
        AND c."deletedAt" IS NULL
        AND v.status = 'APPROVED'
        AND v."deletedAt" IS NULL
      GROUP BY c."sportId"
    `;
    const counts = new Map(rows.map((r) => [r.sportId, Number(r.count)]));
    return sports.map((s) => ({ ...s, count: counts.get(s.id) ?? 0 }));
  }

  bySlug(slug: string) {
    return this.prisma.sport.findUniqueOrThrow({ where: { slug } });
  }
}
