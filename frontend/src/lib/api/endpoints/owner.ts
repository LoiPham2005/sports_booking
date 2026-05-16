import { apiDelete, apiGet, apiPatch, apiPost } from '../client';
import type { BookingStatus, PaymentProvider, VenueDto } from '../types';
import { toUiBooking, type UiBooking } from '../adapters/booking';
import type { BookingDto } from '../types';
import { toUiVenue, type UiVenue } from '../adapters/venue';

// ─────────── Dashboard ───────────

export interface OwnerDashboard {
  venueCount: number;
  revenueToday: number;
  bookingsToday: number;
  revenueMonth: number;
  revenueMonthDelta: number;
  occupancyToday: number;
  ratingAvg: number;
  recentBookings: BookingDto[];
  revenueLast7Days: number[];
  topCustomers: Array<{ name: string; bookings: number; total: number }>;
}

// ─────────── Walk-in ───────────

export interface CreateWalkInInput {
  courtId: string;
  startsAt: string;
  endsAt: string;
  total: number;
  customerName?: string;
  customerPhone?: string;
}

// ─────────── Staff ───────────

export type StaffStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
export type StaffRole = 'MANAGER' | 'STAFF';

export interface CreateVenueInput {
  name: string;
  addressLine: string;
  /** Tỉnh/TP user nhập gốc (cũ hoặc mới — tuỳ format). */
  city: string;
  /** Quận/Huyện (chỉ format cũ trước 7/2025). */
  district?: string;
  /** Phường/Xã user nhập gốc. */
  ward?: string;
  /** Tỉnh sau cải cách hành chính 7/2025 — luôn gửi nếu chọn qua dropdown. */
  newCity?: string;
  /** Xã/phường sau cải cách 7/2025. */
  newWard?: string;
  /** Mã hành chính chính thức (theo openapi.vn) — vd "79". */
  provinceCode?: string;
  /** Mã xã/phường mới — vd "79100". */
  wardCode?: string;
  description?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

export interface StaffMemberDto {
  id: string;
  venueId: string;
  userId: string | null;
  email: string | null;
  role: StaffRole;
  inviteStatus: StaffStatus;
  inviteToken: string | null;
  inviteExpiresAt: string | null;
  createdAt: string;
  acceptedAt: string | null;
  venue: { id: string; name: string };
  user: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
  } | null;
}

export interface InviteStaffInput {
  venueId: string;
  email: string;
  role?: StaffRole;
}

// ─────────── Reports ───────────

export interface ReportsResponse {
  from: string;
  to: string;
  groupBy: 'day' | 'week' | 'month';
  series: Array<{ bucket: string; total: number; count: number }>;
  paymentBreakdown: Array<{ provider: PaymentProvider; total: number; count: number }>;
}

// ─────────── Payout ───────────

export interface PayoutSummary {
  pendingAmount: number;
  pendingCount: number;
  paidTotal: number;
  bankAccount: {
    id: string;
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
  } | null;
  history: Array<{
    id: string;
    periodFrom: string;
    periodTo: string;
    amount: number;
    status: string;
    paidAt: string | null;
    createdAt: string;
  }>;
}

// ─────────── API ───────────

export const ownerApi = {
  dashboard: () => apiGet<OwnerDashboard>('/owner/dashboard'),

  submitVenue: (venueId: string) =>
    apiPost<VenueDto>(`/owner/venues/${encodeURIComponent(venueId)}/submit`),

  bookings: async (params: { date?: string; status?: BookingStatus; venueId?: string } = {}): Promise<
    UiBooking[]
  > => {
    const list = await apiGet<BookingDto[]>('/owner/bookings', {
      query: params as Record<string, string | undefined>,
    });
    return list.map(toUiBooking);
  },

  walkIn: (body: CreateWalkInInput) => apiPost<BookingDto>('/owner/bookings/walk-in', body),

  refuseBooking: (id: string, reason?: string) =>
    apiPatch<BookingDto>(`/owner/bookings/${encodeURIComponent(id)}/refuse`, { reason }),

  listVenues: async (): Promise<UiVenue[]> => {
    const list = await apiGet<VenueDto[]>('/venues/owner/list');
    return list.map(toUiVenue);
  },

  createVenue: async (body: CreateVenueInput): Promise<UiVenue> => {
    const dto = await apiPost<VenueDto>('/venues/owner', body);
    return toUiVenue(dto);
  },

  staff: (venueId?: string) =>
    apiGet<StaffMemberDto[]>('/owner/staff', { query: venueId ? { venueId } : undefined }),

  inviteStaff: (body: InviteStaffInput) => apiPost<StaffMemberDto>('/owner/staff/invite', body),

  updateStaff: (
    id: string,
    body: { role?: StaffRole; inviteStatus?: StaffStatus },
  ) => apiPatch<StaffMemberDto>(`/owner/staff/${encodeURIComponent(id)}`, body),

  removeStaff: (id: string) =>
    apiDelete<StaffMemberDto>(`/owner/staff/${encodeURIComponent(id)}`),

  reports: (params: { from?: string; to?: string; groupBy?: 'day' | 'week' | 'month' } = {}) =>
    apiGet<ReportsResponse>('/owner/reports', {
      query: params as Record<string, string | undefined>,
    }),

  payoutSummary: () => apiGet<PayoutSummary>('/owner/payout'),

  requestPayout: () => apiPost<unknown>('/owner/payout/request'),
};
