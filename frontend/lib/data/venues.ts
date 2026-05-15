/**
 * Data layer cho venue/sport — chọn mock vs API tuỳ `USE_MOCK`.
 * Dùng được ở **server component** (SSR) — không gọi cookie phía client.
 *
 * Khi page bạn cần dữ liệu này, import từ đây thay vì gọi thẳng `venuesApi`
 * hoặc `VENUES` để code biết về `USE_MOCK` ở 1 chỗ duy nhất.
 */

import { USE_MOCK } from '@/lib/api/config';
import { venuesApi, type UiVenueDetail, type VenueSearchParams } from '@/lib/api/endpoints/venues';
import { sportsApi } from '@/lib/api/endpoints/sports';
import { toUiVenue, toUiSport, type UiVenue, type UiSport } from '@/lib/api/adapters/venue';
import { VENUES, SPORTS, COURTS, SURFACES } from '@/lib/mock-data';

// ─────────── Mock → UI adapters ───────────

function mockVenueToUi(v: (typeof VENUES)[number]): UiVenue {
  return {
    id: v.id,
    name: v.name,
    slug: v.slug,
    address: v.address,
    city: v.city,
    district: v.district,
    sports: v.sports,
    priceFrom: v.priceFrom,
    rating: v.rating,
    reviewCount: v.reviewCount,
    distance: v.distance,
    image: v.image,
    amenities: v.amenities,
  };
}

function mockSportToUi(s: (typeof SPORTS)[number]): UiSport {
  return { slug: s.slug, name: s.name, icon: s.icon, count: s.count };
}

// ─────────── Public API ───────────

export async function listVenues(params: VenueSearchParams = {}): Promise<UiVenue[]> {
  if (USE_MOCK) {
    let list = VENUES.map(mockVenueToUi);
    if (params.sportSlug) list = list.filter((v) => v.sports.includes(params.sportSlug!));
    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.district.toLowerCase().includes(q) ||
          v.address.toLowerCase().includes(q),
      );
    }
    if (params.limit) list = list.slice(0, params.limit);
    return list;
  }
  const res = await venuesApi.list(params);
  return res.data;
}

export async function getVenue(idOrSlug: string): Promise<UiVenueDetail | null> {
  if (USE_MOCK) {
    const v = VENUES.find((x) => x.id === idOrSlug || x.slug === idOrSlug);
    if (!v) return null;
    // Mock không có nested courts — return COURTS hardcoded.
    return {
      ...mockVenueToUi(v),
      courts: COURTS.map((c) => ({
        id: c.id,
        name: c.name,
        surface: SURFACES[c.surface] ?? c.surface,
        indoor: c.indoor,
        capacity: c.capacity,
      })),
      reviewsCount: v.reviewCount,
    };
  }
  try {
    return await venuesApi.detail(idOrSlug);
  } catch {
    return null;
  }
}

export async function listSports(): Promise<UiSport[]> {
  if (USE_MOCK) return SPORTS.map(mockSportToUi);
  // sportsApi.list đã map sang UiSport.
  return await sportsApi.list();
}

// Re-export UI types để page khỏi import nhiều chỗ.
export type { UiVenue, UiSport, UiVenueDetail };
