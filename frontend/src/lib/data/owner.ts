/**
 * Data layer cho Owner — wrapper mock/API.
 */
import { USE_MOCK } from '@/lib/api/config';
import {
  ownerApi,
  type CreateVenueInput,
  type CreateWalkInInput,
  type InviteStaffInput,
  type OwnerDashboard,
  type PayoutSummary,
  type ReportsResponse,
  type StaffMemberDto,
  type StaffStatus,
  type StaffRole,
} from '@/lib/api/endpoints/owner';
import type { UiBooking } from '@/lib/api/adapters/booking';
import type { UiVenue } from '@/lib/api/adapters/venue';
import { VENUES, BOOKINGS } from '@/lib/mock-data';
import type { UiBookingStatus } from '@/lib/api/adapters/status';

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

function mockBookingToUi(b: (typeof BOOKINGS)[number]): UiBooking {
  return {
    id: b.id,
    code: b.code,
    venue: mockVenueToUi(b.venue),
    courtName: b.courtName,
    startsAt: b.startsAt,
    endsAt: b.endsAt,
    total: b.total,
    status: b.status as UiBookingStatus,
  };
}

// ─────── Mock data ───────

// Mock owner venues — start với 2 venue đầu trong VENUES, có thể thêm vào runtime
let mockOwnerVenuesState: UiVenue[] = VENUES.slice(0, 2).map(mockVenueToUi);

const MOCK_DASHBOARD: OwnerDashboard = {
  venueCount: 2,
  revenueToday: 4_350_000,
  bookingsToday: 18,
  revenueMonth: 82_500_000,
  revenueMonthDelta: 8.3,
  occupancyToday: 76,
  ratingAvg: 4.7,
  recentBookings: [],
  revenueLast7Days: [2_800_000, 3_100_000, 4_200_000, 3_500_000, 5_100_000, 4_800_000, 4_350_000],
  topCustomers: [
    { name: 'Trần Minh', bookings: 8, total: 2_400_000 },
    { name: 'Lê Hà', bookings: 6, total: 1_800_000 },
    { name: 'Đức Phạm', bookings: 5, total: 1_500_000 },
    { name: 'Nguyễn An', bookings: 4, total: 1_200_000 },
  ],
};

const MOCK_STAFF: StaffMemberDto[] = [
  {
    id: 's1',
    venueId: 'v1',
    userId: 'u1',
    email: 'truc@example.com',
    role: 'MANAGER',
    inviteStatus: 'ACTIVE',
    inviteToken: null,
    inviteExpiresAt: null,
    createdAt: new Date(Date.now() - 240 * 24 * 3600_000).toISOString(),
    acceptedAt: new Date(Date.now() - 240 * 24 * 3600_000).toISOString(),
    venue: { id: 'v1', name: 'Sân bóng đá Phú Mỹ Hưng' },
    user: { id: 'u1', fullName: 'Trần Văn Trực', email: 'truc@example.com', phone: '+84 901 234 567', avatarUrl: null },
  },
  {
    id: 's2',
    venueId: 'v1',
    userId: 'u2',
    email: 'mai@example.com',
    role: 'STAFF',
    inviteStatus: 'ACTIVE',
    inviteToken: null,
    inviteExpiresAt: null,
    createdAt: new Date(Date.now() - 120 * 24 * 3600_000).toISOString(),
    acceptedAt: new Date(Date.now() - 120 * 24 * 3600_000).toISOString(),
    venue: { id: 'v1', name: 'Sân bóng đá Phú Mỹ Hưng' },
    user: { id: 'u2', fullName: 'Lê Thị Mai', email: 'mai@example.com', phone: '+84 909 876 543', avatarUrl: null },
  },
  {
    id: 's3',
    venueId: 'v2',
    userId: null,
    email: 'long@example.com',
    role: 'STAFF',
    inviteStatus: 'PENDING',
    inviteToken: 'demo-token',
    inviteExpiresAt: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString(),
    acceptedAt: null,
    venue: { id: 'v2', name: 'CLB cầu lông Vinhomes Central' },
    user: null,
  },
];
const mockStaffState = [...MOCK_STAFF];

const MOCK_PAYOUT: PayoutSummary = {
  pendingAmount: 18_450_000,
  pendingCount: 24,
  paidTotal: 80_800_000,
  bankAccount: {
    id: 'b1',
    bankCode: 'VCB',
    accountNumber: '0123456789012345',
    accountHolder: 'NGUYEN VAN A',
  },
  history: [
    { id: 'p1', periodFrom: new Date(Date.now() - 7 * 24 * 3600_000).toISOString(), periodTo: new Date(Date.now() - 24 * 3600_000).toISOString(), amount: 22_300_000, status: 'PAID', paidAt: new Date(Date.now() - 24 * 3600_000).toISOString(), createdAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString() },
    { id: 'p2', periodFrom: new Date(Date.now() - 14 * 24 * 3600_000).toISOString(), periodTo: new Date(Date.now() - 8 * 24 * 3600_000).toISOString(), amount: 19_800_000, status: 'PAID', paidAt: new Date(Date.now() - 8 * 24 * 3600_000).toISOString(), createdAt: new Date(Date.now() - 9 * 24 * 3600_000).toISOString() },
  ],
};

// ─────── Public API ───────

export async function getOwnerDashboard(): Promise<OwnerDashboard> {
  if (USE_MOCK) return MOCK_DASHBOARD;
  return ownerApi.dashboard();
}

export async function listOwnerVenues(): Promise<UiVenue[]> {
  if (USE_MOCK) return mockOwnerVenuesState;
  return ownerApi.listVenues();
}

export async function createOwnerVenue(body: CreateVenueInput): Promise<UiVenue> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const id = `mock-v-${Date.now()}`;
    const ui: UiVenue = {
      id,
      name: body.name,
      slug: body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || id,
      address: body.addressLine,
      city: body.newCity ?? body.city,
      district: body.district ?? '',
      sports: [],
      priceFrom: 0,
      rating: 0,
      reviewCount: 0,
      distance: 0,
      image:
        'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop',
      amenities: [],
      description: body.description,
      phone: body.phone,
      lat: body.lat,
      lng: body.lng,
    };
    mockOwnerVenuesState = [ui, ...mockOwnerVenuesState];
    return ui;
  }
  return ownerApi.createVenue(body);
}

export async function listOwnerBookings(params: {
  date?: string;
  status?: string;
  venueId?: string;
} = {}): Promise<UiBooking[]> {
  if (USE_MOCK) return BOOKINGS.map(mockBookingToUi);
  return ownerApi.bookings(params as never);
}

export async function createWalkIn(body: CreateWalkInInput) {
  if (USE_MOCK) return { id: 'mock-walkin', code: '20269999' };
  return ownerApi.walkIn(body);
}

export async function refuseBooking(id: string, reason?: string) {
  if (USE_MOCK) return;
  await ownerApi.refuseBooking(id, reason);
}

export async function listStaff(): Promise<StaffMemberDto[]> {
  if (USE_MOCK) return mockStaffState;
  return ownerApi.staff();
}

export async function inviteStaff(body: InviteStaffInput): Promise<StaffMemberDto> {
  if (USE_MOCK) {
    const newOne: StaffMemberDto = {
      id: 's' + (mockStaffState.length + 1),
      venueId: body.venueId,
      userId: null,
      email: body.email,
      role: body.role ?? 'STAFF',
      inviteStatus: 'PENDING',
      inviteToken: 'demo-token-' + Date.now(),
      inviteExpiresAt: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      venue: { id: body.venueId, name: VENUES.find((v) => v.id === body.venueId)?.name ?? '—' },
      user: null,
    };
    mockStaffState.push(newOne);
    return newOne;
  }
  return ownerApi.inviteStaff(body);
}

export async function updateStaff(id: string, body: { role?: StaffRole; inviteStatus?: StaffStatus }) {
  if (USE_MOCK) {
    const idx = mockStaffState.findIndex((s) => s.id === id);
    if (idx >= 0) {
      mockStaffState[idx] = { ...mockStaffState[idx], ...body };
    }
    return;
  }
  await ownerApi.updateStaff(id, body);
}

export async function removeStaff(id: string) {
  if (USE_MOCK) {
    const idx = mockStaffState.findIndex((s) => s.id === id);
    if (idx >= 0) mockStaffState.splice(idx, 1);
    return;
  }
  await ownerApi.removeStaff(id);
}

export async function getOwnerReports(params?: { from?: string; to?: string; groupBy?: 'day' | 'week' | 'month' }): Promise<ReportsResponse> {
  if (USE_MOCK) {
    const today = new Date();
    const series = Array.from({ length: 7 }).map((_, i) => ({
      bucket: new Date(today.getTime() - (6 - i) * 24 * 3600_000).toISOString(),
      total: [2_800_000, 3_100_000, 4_200_000, 3_500_000, 5_100_000, 4_800_000, 4_350_000][i],
      count: [12, 15, 18, 14, 22, 20, 18][i],
    }));
    return {
      from: new Date(today.getTime() - 7 * 24 * 3600_000).toISOString(),
      to: today.toISOString(),
      groupBy: params?.groupBy ?? 'day',
      series,
      paymentBreakdown: [
        { provider: 'VNPAY', total: 12_400_000, count: 35 },
        { provider: 'MOMO', total: 8_200_000, count: 22 },
        { provider: 'ZALOPAY', total: 6_300_000, count: 15 },
      ],
    };
  }
  return ownerApi.reports(params);
}

export async function getPayoutSummary(): Promise<PayoutSummary> {
  if (USE_MOCK) return MOCK_PAYOUT;
  return ownerApi.payoutSummary();
}

export async function requestPayout() {
  if (USE_MOCK) return;
  await ownerApi.requestPayout();
}

export async function createBankAccount(body: {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  isDefault?: boolean;
}) {
  if (USE_MOCK) {
    // Cập nhật mock state để UI reflect ngay
    MOCK_PAYOUT.bankAccount = {
      id: 'ba-mock',
      bankCode: body.bankCode,
      accountNumber: body.accountNumber,
      accountHolder: body.accountHolder,
    };
    return;
  }
  await ownerApi.createBankAccount(body);
}

export async function listBankAccounts() {
  if (USE_MOCK) return [];
  return ownerApi.listBankAccounts();
}

export async function setDefaultBankAccount(id: string) {
  if (USE_MOCK) return;
  await ownerApi.setDefaultBankAccount(id);
}

export async function deleteBankAccount(id: string) {
  if (USE_MOCK) {
    MOCK_PAYOUT.bankAccount = null;
    void id;
    return;
  }
  await ownerApi.deleteBankAccount(id);
}
