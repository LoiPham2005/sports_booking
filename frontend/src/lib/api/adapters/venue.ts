import type { VenueDto, CourtDto, SportDto, AmenityDto } from '../types';

/**
 * UI venue — shape ổn định mà mọi component đang dùng (mirror gần `Venue` trong
 * `lib/mock-data.ts`). Khi DB schema đổi, chỉ sửa adapter — UI không phải biết.
 */
export interface UiVenue {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  district: string;
  sports: string[]; // slug list
  priceFrom: number;
  rating: number;
  reviewCount: number;
  distance: number;
  image: string; // primary image URL
  /** Tất cả ảnh + video của venue (chỉ có ở detail). */
  images: { id: string; url: string; isPrimary: boolean }[];
  amenities: string[]; // slug list
  description?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

export function toUiVenue(dto: VenueDto): UiVenue {
  const primaryImage =
    dto.images?.find((i) => i.isPrimary)?.url ??
    dto.images?.[0]?.url ??
    '';
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    address: dto.addressLine,
    city: dto.city,
    district: dto.district ?? '',
    sports: (dto.sports ?? []).map((s) => s.slug),
    priceFrom: dto.priceFrom ?? 0,
    rating: dto.ratingAvg,
    reviewCount: dto.ratingCount,
    distance: dto.distance ?? 0,
    image: primaryImage,
    images: (dto.images ?? []).map((i) => ({ id: i.id, url: i.url, isPrimary: i.isPrimary })),
    amenities: (dto.amenities ?? []).map((a) => a.slug),
    description: dto.description ?? undefined,
    phone: dto.phone ?? undefined,
    lat: dto.lat ?? undefined,
    lng: dto.lng ?? undefined,
  };
}

export interface UiCourt {
  id: string;
  name: string;
  surface: string;
  indoor: boolean;
  capacity: number;
  sportSlug?: string;
}

export function toUiCourt(dto: CourtDto): UiCourt {
  return {
    id: dto.id,
    name: dto.name,
    surface: dto.surface,
    indoor: dto.indoor,
    capacity: dto.capacity,
    sportSlug: dto.sport?.slug,
  };
}

export interface UiSport {
  id: string;
  slug: string;
  name: string;
  icon: string;
  count: number;
}

export function toUiSport(dto: SportDto): UiSport {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.nameVi,
    icon: dto.icon ?? '🏟️',
    count: dto.count ?? 0,
  };
}

export interface UiAmenity {
  slug: string;
  name: string;
  icon: string;
}

export function toUiAmenity(dto: AmenityDto): UiAmenity {
  return {
    slug: dto.slug,
    name: dto.nameVi,
    icon: dto.icon ?? '✨',
  };
}
