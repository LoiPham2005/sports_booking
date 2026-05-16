import { apiGet, apiPost, apiPatch, apiDelete } from '../client';
import { toUiVenue, toUiCourt, type UiVenue, type UiCourt } from '../adapters/venue';
import type { VenueDto, CourtDto } from '../types';
import type { CreateVenueInput } from './owner';

export interface UpdateVenueInput extends Partial<CreateVenueInput> {}

export type SurfaceType =
  | 'NATURAL_GRASS'
  | 'ARTIFICIAL_GRASS'
  | 'WOOD'
  | 'EPOXY'
  | 'CLAY'
  | 'RUBBER'
  | 'CONCRETE';

export interface CreateCourtInput {
  name: string;
  sportId: string;
  surface: SurfaceType;
  indoor?: boolean;
  capacity?: number;
  slotDurationMinutes?: number;
}

export interface UpdateCourtInput {
  name?: string;
  surface?: SurfaceType;
  indoor?: boolean;
  capacity?: number;
  slotDurationMinutes?: number;
  isActive?: boolean;
}

export interface VenueSearchParams {
  q?: string;
  city?: string;
  district?: string;
  sportSlug?: string;
  lat?: number;
  lng?: number;
  cursor?: string;
  limit?: number;
  sortBy?: 'rating' | 'newest';
}

interface VenueListResponse {
  data: VenueDto[];
  nextCursor: string | null;
}

export interface UiVenueDetail extends UiVenue {
  /** Courts đầy đủ cho venue detail page. */
  courts: UiCourt[];
  /** Review count tổng (visible only). */
  reviewsCount: number;
}

export const venuesApi = {
  /** GET /venues — search + filter. */
  list: async (params: VenueSearchParams = {}): Promise<{ data: UiVenue[]; nextCursor: string | null }> => {
    const res = await apiGet<VenueListResponse>('/venues', { query: params as Record<string, string | number | undefined> });
    return {
      data: res.data.map(toUiVenue),
      nextCursor: res.nextCursor,
    };
  },

  /**
   * GET /venues/:idOrSlug — detail page.
   * Backend resolve cả cuid và slug.
   */
  detail: async (idOrSlug: string): Promise<UiVenueDetail> => {
    const dto = await apiGet<VenueDto & { courts: CourtDto[]; reviewsCount: number }>(
      `/venues/${encodeURIComponent(idOrSlug)}`,
    );
    return {
      ...toUiVenue(dto),
      courts: dto.courts.map(toUiCourt),
      reviewsCount: dto.reviewsCount,
    };
  },

  /** PATCH /venues/owner/:id — update venue thông tin chung. */
  updateOwner: async (id: string, body: UpdateVenueInput): Promise<UiVenue> => {
    const dto = await apiPatch<VenueDto>(`/venues/owner/${encodeURIComponent(id)}`, body);
    return toUiVenue(dto);
  },

  // ─── Courts ───
  listCourts: async (venueId: string): Promise<UiCourt[]> => {
    const list = await apiGet<CourtDto[]>(`/venues/${encodeURIComponent(venueId)}/courts`);
    return list.map(toUiCourt);
  },

  createCourt: async (venueId: string, body: CreateCourtInput): Promise<UiCourt> => {
    const dto = await apiPost<CourtDto>(
      `/owner/venues/${encodeURIComponent(venueId)}/courts`,
      body,
    );
    return toUiCourt(dto);
  },

  updateCourt: async (id: string, body: UpdateCourtInput): Promise<UiCourt> => {
    const dto = await apiPatch<CourtDto>(`/owner/courts/${encodeURIComponent(id)}`, body);
    return toUiCourt(dto);
  },

  deleteCourt: async (id: string): Promise<void> => {
    await apiDelete(`/owner/courts/${encodeURIComponent(id)}`);
  },

  // ─── Hours ───
  listHours: (venueId: string) =>
    apiGet<VenueHourDto[]>(`/venues/${encodeURIComponent(venueId)}/hours`),

  upsertHours: (venueId: string, hours: VenueHourInput[]) =>
    apiPut<VenueHourDto[]>(`/venues/owner/${encodeURIComponent(venueId)}/hours`, { hours }),

  // ─── Images ───
  listImages: (venueId: string) =>
    apiGet<VenueImageDto[]>(`/venues/${encodeURIComponent(venueId)}/images`),

  addImage: (venueId: string, body: AddVenueImageInput) =>
    apiPost<VenueImageDto>(`/venues/owner/${encodeURIComponent(venueId)}/images`, body),

  deleteImage: (venueId: string, imageId: string) =>
    apiDelete<{ ok: boolean }>(
      `/venues/owner/${encodeURIComponent(venueId)}/images/${encodeURIComponent(imageId)}`,
    ),

  // ─── Price rules ───
  listPriceRules: (courtId: string) =>
    apiGet<PriceRuleDto[]>(`/courts/${encodeURIComponent(courtId)}/price-rules`),

  addPriceRule: (courtId: string, body: PriceRuleInput) =>
    apiPost<PriceRuleDto>(`/owner/courts/${encodeURIComponent(courtId)}/price-rules`, body),

  updatePriceRule: (id: string, body: PriceRuleInput) =>
    apiPatch<PriceRuleDto>(`/owner/price-rules/${encodeURIComponent(id)}`, body),

  deletePriceRule: (id: string) =>
    apiDelete<{ ok: boolean }>(`/owner/price-rules/${encodeURIComponent(id)}`),

  // ─── Uploads (Supabase Storage qua backend) ───
  signUpload: (body: { kind: 'venue' | 'court' | 'avatar' | 'review'; contentType: string; sizeBytes: number }) =>
    apiPost<UploadSignResponse>('/uploads/sign', body),
};

export interface VenueHourDto {
  id: string;
  venueId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface VenueHourInput {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface VenueImageDto {
  id: string;
  venueId: string;
  url: string;
  sort: number;
  isPrimary: boolean;
}

export interface AddVenueImageInput {
  url: string;
  key?: string;
  sort?: number;
  isPrimary?: boolean;
}

export interface PriceRuleDto {
  id: string;
  courtId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  pricePerSlot: number;
}

export interface PriceRuleInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  pricePerSlot: number;
}

export interface UploadSignResponse {
  uploadUrl: string;
  token: string;
  fileKey: string;
  publicUrl: string;
  expiresIn: number;
}
