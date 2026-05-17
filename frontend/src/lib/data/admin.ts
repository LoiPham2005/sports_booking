/**
 * Data layer cho Admin / SuperAdmin.
 */
import { USE_MOCK } from '@/lib/api/config';
import {
  adminApi,
  type AdminDashboard,
  type AdminDisputeDto,
  type AdminReportsResponse,
  type AdminUserDto,
  type AdminVenueDto,
  type AuditLogDto,
  type CreateVoucherInput,
  type UpdateVoucherInput,
  type VoucherDto,
} from '@/lib/api/endpoints/admin';
import type { Role, UserStatus, VenueStatus } from '@/lib/api/types';

// ─────── Mock data ───────

const MOCK_DASHBOARD: AdminDashboard = {
  totalUsers: 12_480,
  newUsersMonth: 348,
  totalVenues: 142,
  pendingVenues: 6,
  gmvMonth: 2_300_000_000,
  gmvDelta: 12.4,
  bookingsMonth: 1_248,
  pendingDisputes: 4,
  topVenues: [
    { id: 'v1', name: 'Sân bóng đá Phú Mỹ Hưng', city: 'TP.HCM', total: 124_800_000, bookings: 78 },
    { id: 'v4', name: 'Pickleball Saigon SC', city: 'TP.HCM', total: 98_200_000, bookings: 62 },
    { id: 'v2', name: 'CLB cầu lông Vinhomes', city: 'TP.HCM', total: 76_400_000, bookings: 54 },
  ],
  paymentSplit: [
    { provider: 'VNPAY', total: 1_196_000_000, count: 612 },
    { provider: 'MOMO', total: 690_000_000, count: 425 },
    { provider: 'ZALOPAY', total: 414_000_000, count: 211 },
  ],
};

const MOCK_VENUES: AdminVenueDto[] = [
  {
    id: 'v7',
    name: 'Sân tennis Hoàng Mai',
    slug: 'tennis-hoang-mai',
    addressLine: '12 Lê Văn Lương',
    city: 'Hà Nội',
    district: 'Thanh Xuân',
    status: 'PENDING',
    ratingAvg: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString(),
    owner: { id: 'u3', fullName: 'Trần Quốc Bình', email: 'binh@example.com' },
    _count: { courts: 4, bookings: 0 },
  },
  {
    id: 'v8',
    name: 'Bóng rổ Tân Bình',
    slug: 'bong-ro-tan-binh',
    addressLine: '45 Cộng Hoà',
    city: 'TP.HCM',
    district: 'Tân Bình',
    status: 'PENDING',
    ratingAvg: 0,
    createdAt: new Date(Date.now() - 1 * 24 * 3600_000).toISOString(),
    owner: { id: 'u4', fullName: 'Lê Thị Hoa', email: 'hoa@example.com' },
    _count: { courts: 2, bookings: 0 },
  },
];

const MOCK_USERS: AdminUserDto[] = [
  {
    id: 'u1',
    email: 'admin@sportsbooking.local',
    phone: null,
    fullName: 'Admin Demo',
    avatarUrl: null,
    role: 'ADMIN',
    status: 'ACTIVE',
    emailVerified: true,
    phoneVerified: false,
    createdAt: new Date(Date.now() - 365 * 24 * 3600_000).toISOString(),
    _count: { bookings: 0, ownedVenues: 0 },
  },
  {
    id: 'u2',
    email: 'owner@sportsbooking.local',
    phone: '+84 901',
    fullName: 'Owner Demo',
    avatarUrl: null,
    role: 'OWNER',
    status: 'ACTIVE',
    emailVerified: true,
    phoneVerified: true,
    createdAt: new Date(Date.now() - 240 * 24 * 3600_000).toISOString(),
    _count: { bookings: 12, ownedVenues: 2 },
  },
];

const MOCK_DISPUTES: AdminDisputeDto[] = [
  {
    id: 'r1',
    paymentId: 'p1',
    amount: 700_000,
    reason: 'Sân không như mô tả, ngập nước',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString(),
    payment: {
      id: 'p1',
      provider: 'VNPAY',
      amount: 700_000,
      booking: { id: 'b1', code: '20260547', total: 700_000, status: 'COMPLETED' },
      user: { id: 'u5', fullName: 'Trần Khách', email: 'khach@example.com' },
    },
  },
];

const MOCK_VOUCHERS: VoucherDto[] = [
  {
    id: 'vc1',
    code: 'WELCOME10',
    type: 'PERCENT',
    value: 10,
    maxDiscount: 100_000,
    minOrder: 200_000,
    validFrom: new Date(Date.now() - 30 * 24 * 3600_000).toISOString(),
    validTo: new Date(Date.now() + 60 * 24 * 3600_000).toISOString(),
    usageLimit: 1000,
    perUserLimit: 1,
    scope: 'GLOBAL',
    scopeRefId: null,
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 3600_000).toISOString(),
    _count: { redemptions: 348 },
  },
];
const mockVouchersState = [...MOCK_VOUCHERS];

const MOCK_AUDIT: AuditLogDto[] = [
  {
    id: 'a1',
    actorId: 'u1',
    actorRole: 'ADMIN',
    action: 'VENUE_APPROVE',
    resourceType: 'Venue',
    resourceId: 'v6',
    beforeJson: { status: 'PENDING' },
    afterJson: { status: 'APPROVED' },
    ip: '113.161.x.x',
    userAgent: 'Chrome',
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    actor: { id: 'u1', fullName: 'Admin Demo', email: 'admin@sportsbooking.local' },
  },
];

// ─────── Public API ───────

export async function getAdminDashboard(): Promise<AdminDashboard> {
  if (USE_MOCK) return MOCK_DASHBOARD;
  return adminApi.dashboard();
}

export async function listAdminVenues(params: { status?: VenueStatus; q?: string } = {}): Promise<
  AdminVenueDto[]
> {
  if (USE_MOCK) {
    let list = [...MOCK_VENUES];
    if (params.status) list = list.filter((v) => v.status === params.status);
    return list;
  }
  return adminApi.listVenues(params);
}

export async function approveVenue(id: string): Promise<AdminVenueDto> {
  if (USE_MOCK) {
    const v = MOCK_VENUES.find((x) => x.id === id);
    if (v) v.status = 'APPROVED';
    return v as AdminVenueDto;
  }
  return adminApi.approveVenue(id);
}

export async function rejectVenue(id: string, reason?: string): Promise<AdminVenueDto> {
  if (USE_MOCK) {
    const v = MOCK_VENUES.find((x) => x.id === id);
    if (v) v.status = 'SUSPENDED';
    return v as AdminVenueDto;
  }
  return adminApi.rejectVenue(id, reason);
}

export async function suspendVenue(id: string): Promise<AdminVenueDto> {
  if (USE_MOCK) {
    const v = MOCK_VENUES.find((x) => x.id === id);
    if (v) v.status = 'SUSPENDED';
    return v as AdminVenueDto;
  }
  return adminApi.suspendVenue(id);
}

export async function listAdminUsers(params: {
  role?: Role;
  status?: UserStatus;
  q?: string;
} = {}): Promise<{ data: AdminUserDto[]; total: number }> {
  if (USE_MOCK) {
    let data = [...MOCK_USERS];
    if (params.role) data = data.filter((u) => u.role === params.role);
    if (params.status) data = data.filter((u) => u.status === params.status);
    if (params.q) {
      const q = params.q.toLowerCase();
      data = data.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q),
      );
    }
    return { data, total: data.length };
  }
  return adminApi.listUsers(params);
}

export async function updateAdminUser(
  id: string,
  body: { role?: Role; status?: UserStatus },
): Promise<AdminUserDto> {
  if (USE_MOCK) {
    const u = MOCK_USERS.find((x) => x.id === id);
    if (u) {
      if (body.role) u.role = body.role;
      if (body.status) u.status = body.status;
    }
    return u as AdminUserDto;
  }
  return adminApi.updateUser(id, body);
}

export async function listDisputes(
  params: { status?: 'PENDING' | 'SUCCESS' | 'FAILED' } = {},
): Promise<AdminDisputeDto[]> {
  if (USE_MOCK) {
    if (!params.status) return MOCK_DISPUTES;
    return MOCK_DISPUTES.filter((d) => d.status === params.status);
  }
  return adminApi.listDisputes(params);
}

export async function resolveDispute(
  id: string,
  body: { approve: boolean; amount?: number; note?: string },
): Promise<void> {
  if (USE_MOCK) {
    const d = MOCK_DISPUTES.find((x) => x.id === id);
    if (d) d.status = body.approve ? 'SUCCESS' : 'FAILED';
    return;
  }
  await adminApi.resolveDispute(id, body);
}

export async function getAdminReports(params?: { from?: string; to?: string }): Promise<AdminReportsResponse> {
  if (USE_MOCK) {
    const today = new Date();
    return {
      from: new Date(today.getTime() - 30 * 24 * 3600_000).toISOString(),
      to: today.toISOString(),
      series: Array.from({ length: 30 }).map((_, i) => ({
        day: new Date(today.getTime() - (29 - i) * 24 * 3600_000).toISOString(),
        gmv: 50_000_000 + Math.random() * 50_000_000,
        bookings: 30 + Math.floor(Math.random() * 30),
      })),
      bySport: [
        { sport: 'Bóng đá 5', slug: 'football_5', total: 950_000_000, count: 480 },
        { sport: 'Cầu lông', slug: 'badminton', total: 620_000_000, count: 410 },
        { sport: 'Tennis', slug: 'tennis', total: 380_000_000, count: 180 },
        { sport: 'Pickleball', slug: 'pickleball', total: 350_000_000, count: 178 },
      ],
    };
  }
  return adminApi.reports(params);
}

export async function listAuditLog(params?: {
  actorId?: string;
  action?: string;
  from?: string;
  to?: string;
}): Promise<AuditLogDto[]> {
  if (USE_MOCK) return MOCK_AUDIT;
  return adminApi.audit(params ?? {});
}

// ─────── Vouchers ───────

export async function listAdminVouchers(): Promise<VoucherDto[]> {
  if (USE_MOCK) return mockVouchersState;
  return adminApi.listVouchers();
}

export async function createAdminVoucher(body: CreateVoucherInput): Promise<VoucherDto> {
  if (USE_MOCK) {
    const newOne: VoucherDto = {
      id: 'vc' + Date.now(),
      code: body.code.toUpperCase(),
      type: body.type,
      value: body.value,
      maxDiscount: body.maxDiscount ?? null,
      minOrder: body.minOrder ?? null,
      validFrom: body.validFrom,
      validTo: body.validTo,
      usageLimit: body.usageLimit ?? null,
      perUserLimit: body.perUserLimit ?? null,
      scope: body.scope ?? 'GLOBAL',
      scopeRefId: body.scopeRefId ?? null,
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
      _count: { redemptions: 0 },
    };
    mockVouchersState.unshift(newOne);
    return newOne;
  }
  return adminApi.createVoucher(body);
}

export async function updateAdminVoucher(id: string, body: UpdateVoucherInput): Promise<void> {
  if (USE_MOCK) {
    const v = mockVouchersState.find((x) => x.id === id);
    if (v) Object.assign(v, body);
    return;
  }
  await adminApi.updateVoucher(id, body);
}

export async function deleteAdminVoucher(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = mockVouchersState.findIndex((x) => x.id === id);
    if (idx >= 0) mockVouchersState[idx].isActive = false;
    return;
  }
  await adminApi.deleteVoucher(id);
}
