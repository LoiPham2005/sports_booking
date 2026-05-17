import { apiDelete, apiGet, apiPatch, apiPost } from '../client';
import type {
  PaymentProvider,
  Role,
  UserStatus,
  VenueStatus,
} from '../types';

// ─────────── Dashboard ───────────

export interface AdminDashboard {
  totalUsers: number;
  newUsersMonth: number;
  totalVenues: number;
  pendingVenues: number;
  gmvMonth: number;
  gmvDelta: number;
  bookingsMonth: number;
  pendingDisputes: number;
  topVenues: Array<{ id?: string; name?: string; city?: string; total: number; bookings: number }>;
  paymentSplit: Array<{ provider: PaymentProvider; total: number; count: number }>;
}

// ─────────── Venues ───────────

export interface AdminVenueDto {
  id: string;
  name: string;
  slug: string;
  addressLine: string;
  city: string;
  district: string | null;
  status: VenueStatus;
  ratingAvg: number;
  createdAt: string;
  owner: { id: string; fullName: string; email: string | null };
  _count: { courts: number; bookings: number };
}

// ─────────── Users ───────────

export interface AdminUserDto {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  _count: { bookings: number; ownedVenues: number };
}

// ─────────── Disputes ───────────

export interface AdminDisputeDto {
  id: string;
  paymentId: string;
  amount: number;
  reason: string | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
  payment: {
    id: string;
    provider: PaymentProvider;
    amount: number;
    booking: {
      id: string;
      code: string;
      total: number;
      status: string;
    } | null;
    user: { id: string; fullName: string; email: string | null };
  };
}

// ─────────── Audit ───────────

export interface AuditLogDto {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  beforeJson: unknown;
  afterJson: unknown;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: { id: string; fullName: string; email: string | null } | null;
}

// ─────────── Reports ───────────

export interface AdminReportsResponse {
  from: string;
  to: string;
  series: Array<{ day: string; gmv: number; bookings: number }>;
  bySport: Array<{ sport: string; slug: string; total: number; count: number }>;
}

// ─────────── API ───────────

export const adminApi = {
  dashboard: () => apiGet<AdminDashboard>('/admin/dashboard'),

  listVenues: (params: { status?: VenueStatus; q?: string; limit?: number } = {}) =>
    apiGet<AdminVenueDto[]>('/admin/venues', {
      query: params as Record<string, string | number | undefined>,
    }),
  approveVenue: (id: string) =>
    apiPost<AdminVenueDto>(`/admin/venues/${encodeURIComponent(id)}/approve`),
  rejectVenue: (id: string, reason?: string) =>
    apiPost<AdminVenueDto>(`/admin/venues/${encodeURIComponent(id)}/reject`, { reason }),
  suspendVenue: (id: string) =>
    apiPost<AdminVenueDto>(`/admin/venues/${encodeURIComponent(id)}/suspend`),

  listUsers: (params: { role?: Role; status?: UserStatus; q?: string; limit?: number } = {}) =>
    apiGet<{ data: AdminUserDto[]; total: number }>('/admin/users', {
      query: params as Record<string, string | number | undefined>,
    }),
  updateUser: (id: string, body: { role?: Role; status?: UserStatus }) =>
    apiPatch<AdminUserDto>(`/admin/users/${encodeURIComponent(id)}`, body),

  listDisputes: (params?: { status?: 'PENDING' | 'SUCCESS' | 'FAILED' }) =>
    apiGet<AdminDisputeDto[]>('/admin/disputes', {
      query: params as Record<string, string | undefined> | undefined,
    }),
  resolveDispute: (id: string, body: { approve: boolean; amount?: number; note?: string }) =>
    apiPost<AdminDisputeDto>(`/admin/disputes/${encodeURIComponent(id)}/resolve`, body),

  reports: (params: { from?: string; to?: string } = {}) =>
    apiGet<AdminReportsResponse>('/admin/reports', {
      query: params as Record<string, string | undefined>,
    }),

  audit: (params: {
    actorId?: string;
    action?: string;
    resourceType?: string;
    from?: string;
    to?: string;
    limit?: number;
  } = {}) =>
    apiGet<AuditLogDto[]>('/admin/audit', {
      query: params as Record<string, string | number | undefined>,
    }),

  // Vouchers
  listVouchers: (params: { scope?: string; active?: boolean; q?: string; limit?: number } = {}) =>
    apiGet<VoucherDto[]>('/admin/vouchers', {
      query: params as Record<string, string | number | boolean | undefined>,
    }),
  createVoucher: (body: CreateVoucherInput) => apiPost<VoucherDto>('/admin/vouchers', body),
  updateVoucher: (id: string, body: UpdateVoucherInput) =>
    apiPatch<VoucherDto>(`/admin/vouchers/${encodeURIComponent(id)}`, body),
  deleteVoucher: (id: string) =>
    apiDelete<VoucherDto>(`/admin/vouchers/${encodeURIComponent(id)}`),
};

// ─────────── Voucher types ───────────

export interface VoucherDto {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  maxDiscount: number | null;
  minOrder: number | null;
  validFrom: string;
  validTo: string;
  usageLimit: number | null;
  perUserLimit: number | null;
  scope: 'GLOBAL' | 'VENUE' | 'SPORT';
  scopeRefId: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { redemptions: number };
}

export interface CreateVoucherInput {
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  maxDiscount?: number;
  minOrder?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  perUserLimit?: number;
  scope?: 'GLOBAL' | 'VENUE' | 'SPORT';
  scopeRefId?: string;
  isActive?: boolean;
}

export interface UpdateVoucherInput {
  value?: number;
  maxDiscount?: number;
  minOrder?: number;
  validFrom?: string;
  validTo?: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
}
