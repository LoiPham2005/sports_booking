import { apiDelete, apiGet, apiPost } from '../client';
import { toUiBooking, type UiBooking } from '../adapters/booking';
import type { BookingDto } from '../types';
import type { StaffMemberDto, StaffRole } from './owner';

export type { StaffMemberDto, StaffRole };

export interface MembershipDto {
  id: string;
  venueId: string;
  role: StaffRole;
  venue: { id: string; name: string };
}

export interface RevenueResponse {
  date: string;
  revenue: number;
  bookings: number;
  totalSlots: number;
  byHour: Array<{ hour: number; total: number; count: number }>;
  byCourt: Array<{ courtId: string; courtName: string; total: number; count: number }>;
}

export interface PriceOverrideDto {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  reason: string | null;
  court: { id: string; name: string };
}

export interface CreateOverrideInput {
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  reason?: string;
}

export const staffApi = {
  memberships: () => apiGet<MembershipDto[]>('/staff/memberships'),

  today: async (): Promise<UiBooking[]> => {
    const list = await apiGet<BookingDto[]>('/staff/today');
    return list.map(toUiBooking);
  },

  schedule: async (params: { date?: string; days?: number } = {}): Promise<UiBooking[]> => {
    const list = await apiGet<BookingDto[]>('/staff/schedule', {
      query: params as Record<string, string | number | undefined>,
    });
    return list.map(toUiBooking);
  },

  checkIn: (token: string) => apiPost<BookingDto>('/staff/check-in', { token }),

  // Manager-only
  revenue: (params: { date?: string; venueId?: string } = {}) =>
    apiGet<RevenueResponse>('/staff/revenue', {
      query: params as Record<string, string | undefined>,
    }),

  team: (venueId?: string) =>
    apiGet<StaffMemberDto[]>('/staff/team', { query: venueId ? { venueId } : undefined }),

  listOverrides: (venueId: string) =>
    apiGet<PriceOverrideDto[]>('/staff/pricing/overrides', { query: { venueId } }),

  createOverride: (body: CreateOverrideInput) =>
    apiPost<PriceOverrideDto>('/staff/pricing/overrides', body),

  deleteOverride: (id: string) =>
    apiDelete<{ ok: boolean }>(`/staff/pricing/overrides/${encodeURIComponent(id)}`),
};
