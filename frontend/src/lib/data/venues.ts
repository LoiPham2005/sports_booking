/**
 * Data layer cho venue/sport — chọn mock vs API tuỳ `USE_MOCK`.
 * Dùng được ở **server component** (SSR) — không gọi cookie phía client.
 *
 * Khi page bạn cần dữ liệu này, import từ đây thay vì gọi thẳng `venuesApi`
 * hoặc `VENUES` để code biết về `USE_MOCK` ở 1 chỗ duy nhất.
 */

import { USE_MOCK } from '@/lib/api/config';
import {
  venuesApi,
  type UiVenueDetail,
  type VenueSearchParams,
  type UpdateVenueInput,
  type CreateCourtInput,
  type UpdateCourtInput,
  type VenueHourDto,
  type VenueHourInput,
  type VenueImageDto,
  type AddVenueImageInput,
  type PriceRuleDto,
  type PriceRuleInput,
} from '@/lib/api/endpoints/venues';
import { sportsApi } from '@/lib/api/endpoints/sports';
import { toUiVenue, toUiSport, type UiVenue, type UiSport, type UiCourt } from '@/lib/api/adapters/venue';
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
    lat: v.lat,
    lng: v.lng,
  };
}

function mockSportToUi(s: (typeof SPORTS)[number]): UiSport {
  return { id: `mock-sport-${s.slug}`, slug: s.slug, name: s.name, icon: s.icon, count: s.count };
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

// ─────── Update venue + Courts CRUD ───────

// Mock state cho courts theo venue
const mockCourtsByVenue = new Map<string, UiCourt[]>();

function ensureMockCourts(venueId: string): UiCourt[] {
  if (!mockCourtsByVenue.has(venueId)) {
    // Khởi tạo từ COURTS mock
    mockCourtsByVenue.set(
      venueId,
      COURTS.map((c) => ({
        id: `${venueId}-${c.id}`,
        name: c.name,
        surface: c.surface,
        indoor: c.indoor,
        capacity: c.capacity,
        sportSlug: 'football_5',
      })),
    );
  }
  return mockCourtsByVenue.get(venueId)!;
}

export async function updateOwnerVenue(id: string, body: UpdateVenueInput): Promise<UiVenue> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 250));
    // Tìm trong mock state nếu có
    const mock = VENUES.find((v) => v.id === id);
    if (!mock) throw new Error('Venue not found');
    return {
      ...toUiVenue({
        id: mock.id,
        ownerId: 'mock-owner',
        name: body.name ?? mock.name,
        slug: mock.slug,
        description: body.description ?? null,
        addressLine: body.addressLine ?? mock.address,
        ward: body.ward ?? null,
        district: body.district ?? mock.district,
        city: body.city ?? mock.city,
        country: 'VN',
        lat: body.lat ?? mock.lat ?? null,
        lng: body.lng ?? mock.lng ?? null,
        phone: body.phone ?? null,
        status: 'APPROVED',
        ratingAvg: mock.rating,
        ratingCount: mock.reviewCount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    };
  }
  return venuesApi.updateOwner(id, body);
}

export async function listCourts(venueId: string): Promise<UiCourt[]> {
  if (USE_MOCK) return ensureMockCourts(venueId);
  return venuesApi.listCourts(venueId);
}

export async function createCourt(venueId: string, body: CreateCourtInput): Promise<UiCourt> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const list = ensureMockCourts(venueId);
    // body.sportId từ form là UiSport.id = "mock-sport-<slug>" trong mock mode → trích slug
    const sportSlug = body.sportId.startsWith('mock-sport-')
      ? body.sportId.replace('mock-sport-', '')
      : SPORTS.find((s) => s.slug === body.sportId)?.slug ?? body.sportId;
    const created: UiCourt = {
      id: `${venueId}-c-${Date.now()}`,
      name: body.name,
      surface: SURFACES[body.surface] ?? body.surface,
      indoor: body.indoor ?? false,
      capacity: body.capacity ?? 10,
      sportSlug,
    };
    mockCourtsByVenue.set(venueId, [...list, created]);
    return created;
  }
  return venuesApi.createCourt(venueId, body);
}

export async function updateCourt(
  venueId: string,
  id: string,
  body: UpdateCourtInput,
): Promise<UiCourt> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150));
    const list = ensureMockCourts(venueId);
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Court not found');
    const updated: UiCourt = {
      ...list[idx],
      name: body.name ?? list[idx].name,
      surface: body.surface ? SURFACES[body.surface] ?? body.surface : list[idx].surface,
      indoor: body.indoor ?? list[idx].indoor,
      capacity: body.capacity ?? list[idx].capacity,
    };
    list[idx] = updated;
    mockCourtsByVenue.set(venueId, [...list]);
    return updated;
  }
  return venuesApi.updateCourt(id, body);
}

export async function deleteCourt(venueId: string, id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150));
    const list = ensureMockCourts(venueId).filter((c) => c.id !== id);
    mockCourtsByVenue.set(venueId, list);
    return;
  }
  await venuesApi.deleteCourt(id);
}

// ─────── Hours / Images / Price rules / Upload ───────

// Mock state
const mockHoursByVenue = new Map<string, VenueHourDto[]>();
const mockImagesByVenue = new Map<string, VenueImageDto[]>();
const mockPriceRulesByCourt = new Map<string, PriceRuleDto[]>();

function defaultHours(venueId: string): VenueHourDto[] {
  return Array.from({ length: 7 }, (_, dow) => ({
    id: `${venueId}-h-${dow}`,
    venueId,
    dayOfWeek: dow,
    openTime: '06:00',
    closeTime: '22:00',
  }));
}

export async function listHours(venueId: string): Promise<VenueHourDto[]> {
  if (USE_MOCK) {
    if (!mockHoursByVenue.has(venueId)) mockHoursByVenue.set(venueId, defaultHours(venueId));
    return mockHoursByVenue.get(venueId)!;
  }
  return venuesApi.listHours(venueId);
}

export async function upsertHours(
  venueId: string,
  hours: VenueHourInput[],
): Promise<VenueHourDto[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const list: VenueHourDto[] = hours.map((h, i) => ({
      id: `${venueId}-h-${i}`,
      venueId,
      ...h,
    }));
    mockHoursByVenue.set(venueId, list);
    return list;
  }
  return venuesApi.upsertHours(venueId, hours);
}

export async function listImages(venueId: string): Promise<VenueImageDto[]> {
  if (USE_MOCK) {
    if (!mockImagesByVenue.has(venueId)) mockImagesByVenue.set(venueId, []);
    return mockImagesByVenue.get(venueId)!;
  }
  return venuesApi.listImages(venueId);
}

export async function addVenueImage(
  venueId: string,
  body: AddVenueImageInput,
): Promise<VenueImageDto> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150));
    const list = mockImagesByVenue.get(venueId) ?? [];
    const created: VenueImageDto = {
      id: `mock-img-${Date.now()}`,
      venueId,
      url: body.url,
      sort: body.sort ?? list.length,
      isPrimary: body.isPrimary ?? list.length === 0,
    };
    mockImagesByVenue.set(venueId, [...list, created]);
    return created;
  }
  return venuesApi.addImage(venueId, body);
}

export async function deleteVenueImage(venueId: string, imageId: string): Promise<void> {
  if (USE_MOCK) {
    const list = (mockImagesByVenue.get(venueId) ?? []).filter((i) => i.id !== imageId);
    mockImagesByVenue.set(venueId, list);
    return;
  }
  await venuesApi.deleteImage(venueId, imageId);
}

export async function listPriceRules(courtId: string): Promise<PriceRuleDto[]> {
  if (USE_MOCK) {
    if (!mockPriceRulesByCourt.has(courtId)) {
      // Seed 4 rule mặc định cho demo
      const seed: PriceRuleDto[] = [];
      for (let d = 1; d <= 5; d++) {
        seed.push({ id: `${courtId}-r-${d}-1`, courtId, dayOfWeek: d, startTime: '06:00', endTime: '17:00', pricePerSlot: 80_000 });
        seed.push({ id: `${courtId}-r-${d}-2`, courtId, dayOfWeek: d, startTime: '17:00', endTime: '22:00', pricePerSlot: 150_000 });
      }
      for (const d of [0, 6]) {
        seed.push({ id: `${courtId}-r-${d}-1`, courtId, dayOfWeek: d, startTime: '06:00', endTime: '17:00', pricePerSlot: 120_000 });
        seed.push({ id: `${courtId}-r-${d}-2`, courtId, dayOfWeek: d, startTime: '17:00', endTime: '22:00', pricePerSlot: 180_000 });
      }
      mockPriceRulesByCourt.set(courtId, seed);
    }
    return mockPriceRulesByCourt.get(courtId)!;
  }
  return venuesApi.listPriceRules(courtId);
}

export async function addPriceRule(courtId: string, body: PriceRuleInput): Promise<PriceRuleDto> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150));
    const list = (await listPriceRules(courtId)).slice();
    const created: PriceRuleDto = { id: `${courtId}-r-${Date.now()}`, courtId, ...body };
    list.push(created);
    mockPriceRulesByCourt.set(courtId, list);
    return created;
  }
  return venuesApi.addPriceRule(courtId, body);
}

export async function updatePriceRule(
  courtId: string,
  id: string,
  body: PriceRuleInput,
): Promise<PriceRuleDto> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150));
    const list = (await listPriceRules(courtId)).slice();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Price rule not found');
    list[idx] = { ...list[idx], ...body };
    mockPriceRulesByCourt.set(courtId, list);
    return list[idx];
  }
  return venuesApi.updatePriceRule(id, body);
}

export async function deletePriceRule(courtId: string, id: string): Promise<void> {
  if (USE_MOCK) {
    const list = (await listPriceRules(courtId)).filter((r) => r.id !== id);
    mockPriceRulesByCourt.set(courtId, list);
    return;
  }
  await venuesApi.deletePriceRule(id);
}

/**
 * Upload ảnh/video lên Supabase Storage qua signed URL backend cấp.
 * - Mock: trả URL data:// để preview, không upload thật
 * - API: 1) Xin signed URL từ backend 2) PUT file lên Supabase 3) Trả publicUrl
 */
export async function uploadMedia(
  file: File,
  kind: 'venue' | 'court' | 'avatar' | 'review' = 'venue',
): Promise<{ url: string; key: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    return { url: dataUrl, key: `mock-${Date.now()}-${file.name}` };
  }
  // 1. Xin signed upload URL
  const signed = await venuesApi.signUpload({
    kind,
    contentType: file.type,
    sizeBytes: file.size,
  });
  // 2. PUT file thẳng lên Supabase
  const putRes = await fetch(signed.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type, 'x-upsert': 'false' },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error(`Upload failed: ${putRes.status} ${await putRes.text().catch(() => '')}`);
  }
  return { url: signed.publicUrl, key: signed.fileKey };
}

// Re-export UI types để page khỏi import nhiều chỗ.
export type { UiVenue, UiSport, UiVenueDetail };
