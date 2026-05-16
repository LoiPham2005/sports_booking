import { apiGet } from '../client';
import { toUiVenue, toUiCourt, type UiVenue, type UiCourt } from '../adapters/venue';
import type { VenueDto, CourtDto } from '../types';

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
};
