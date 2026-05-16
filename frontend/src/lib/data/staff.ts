/**
 * Data layer cho Staff/Manager — wrapper mock/API.
 */
import { USE_MOCK } from '@/lib/api/config';
import {
  staffApi,
  type CreateOverrideInput,
  type MembershipDto,
  type PriceOverrideDto,
  type RevenueResponse,
  type StaffMemberDto,
} from '@/lib/api/endpoints/staff';
import type { UiBooking } from '@/lib/api/adapters/booking';
import type { UiBookingStatus } from '@/lib/api/adapters/status';
import { BOOKINGS } from '@/lib/mock-data';

function mockBookingToUi(b: (typeof BOOKINGS)[number]): UiBooking {
  return {
    id: b.id,
    code: b.code,
    venue: {
      id: b.venue.id,
      name: b.venue.name,
      slug: b.venue.slug,
      address: b.venue.address,
      city: b.venue.city,
      district: b.venue.district,
      sports: b.venue.sports,
      priceFrom: b.venue.priceFrom,
      rating: b.venue.rating,
      reviewCount: b.venue.reviewCount,
      distance: b.venue.distance,
      image: b.venue.image,
      amenities: b.venue.amenities,
    },
    courtName: b.courtName,
    startsAt: b.startsAt,
    endsAt: b.endsAt,
    total: b.total,
    status: b.status as UiBookingStatus,
  };
}

const MOCK_MEMBERSHIPS: MembershipDto[] = [
  { id: 'm1', venueId: 'v1', role: 'STAFF', venue: { id: 'v1', name: 'Sân bóng đá Phú Mỹ Hưng' } },
];

const MOCK_REVENUE: RevenueResponse = {
  date: new Date().toISOString(),
  revenue: 4_350_000,
  bookings: 12,
  totalSlots: 18,
  byHour: [
    { hour: 6, total: 0, count: 0 },
    { hour: 7, total: 700_000, count: 2 },
    { hour: 8, total: 350_000, count: 1 },
    { hour: 16, total: 1_000_000, count: 1 },
    { hour: 17, total: 350_000, count: 1 },
    { hour: 18, total: 1_400_000, count: 4 },
    { hour: 19, total: 350_000, count: 1 },
    { hour: 20, total: 200_000, count: 2 },
  ],
  byCourt: [
    { courtId: 'c1', courtName: 'Sân 1', total: 1_750_000, count: 5 },
    { courtId: 'c2', courtName: 'Sân 2', total: 1_400_000, count: 4 },
    { courtId: 'c3', courtName: 'Sân VIP', total: 1_200_000, count: 3 },
  ],
};

const MOCK_OVERRIDES: PriceOverrideDto[] = [
  {
    id: 'o1',
    courtId: 'c3',
    date: new Date().toISOString().split('T')[0],
    startTime: '17:00',
    endTime: '19:00',
    price: 600_000,
    reason: 'Khung giờ cao điểm',
    court: { id: 'c3', name: 'Sân VIP' },
  },
];
const mockOverrideState = [...MOCK_OVERRIDES];

// ─────── Public ───────

export async function getMyMemberships(): Promise<MembershipDto[]> {
  if (USE_MOCK) return MOCK_MEMBERSHIPS;
  return staffApi.memberships();
}

export async function getStaffToday(): Promise<UiBooking[]> {
  if (USE_MOCK) {
    return BOOKINGS.map(mockBookingToUi);
  }
  return staffApi.today();
}

export async function getStaffSchedule(params: { date?: string; days?: number } = {}): Promise<UiBooking[]> {
  if (USE_MOCK) {
    return BOOKINGS.map(mockBookingToUi);
  }
  return staffApi.schedule(params);
}

export async function checkInBooking(token: string) {
  if (USE_MOCK) return;
  return staffApi.checkIn(token);
}

export async function getRevenue(params: { date?: string; venueId?: string } = {}): Promise<RevenueResponse> {
  if (USE_MOCK) return MOCK_REVENUE;
  return staffApi.revenue(params);
}

export async function getTeam(venueId?: string): Promise<StaffMemberDto[]> {
  if (USE_MOCK) {
    return [
      {
        id: 's1',
        venueId: 'v1',
        userId: 'u1',
        email: 'staff@example.com',
        role: 'STAFF',
        inviteStatus: 'ACTIVE',
        inviteToken: null,
        inviteExpiresAt: null,
        createdAt: new Date(Date.now() - 90 * 24 * 3600_000).toISOString(),
        acceptedAt: new Date(Date.now() - 90 * 24 * 3600_000).toISOString(),
        venue: { id: 'v1', name: 'Sân bóng đá Phú Mỹ Hưng' },
        user: { id: 'u1', fullName: 'Nguyễn Văn Staff', email: 'staff@example.com', phone: '+84 901', avatarUrl: null },
      },
      {
        id: 's2',
        venueId: 'v1',
        userId: 'u2',
        email: 'manager@example.com',
        role: 'MANAGER',
        inviteStatus: 'ACTIVE',
        inviteToken: null,
        inviteExpiresAt: null,
        createdAt: new Date(Date.now() - 200 * 24 * 3600_000).toISOString(),
        acceptedAt: new Date(Date.now() - 200 * 24 * 3600_000).toISOString(),
        venue: { id: 'v1', name: 'Sân bóng đá Phú Mỹ Hưng' },
        user: { id: 'u2', fullName: 'Trần Văn Manager', email: 'manager@example.com', phone: '+84 909', avatarUrl: null },
      },
    ];
  }
  return staffApi.team(venueId);
}

export async function listMyOverrides(venueId: string): Promise<PriceOverrideDto[]> {
  if (USE_MOCK) return mockOverrideState;
  return staffApi.listOverrides(venueId);
}

export async function createOverride(body: CreateOverrideInput): Promise<PriceOverrideDto> {
  if (USE_MOCK) {
    const newOne: PriceOverrideDto = {
      id: 'o' + Date.now(),
      courtId: body.courtId,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      price: body.price,
      reason: body.reason ?? null,
      court: { id: body.courtId, name: body.courtId },
    };
    mockOverrideState.unshift(newOne);
    return newOne;
  }
  return staffApi.createOverride(body);
}

export async function deleteOverride(id: string) {
  if (USE_MOCK) {
    const idx = mockOverrideState.findIndex((o) => o.id === id);
    if (idx >= 0) mockOverrideState.splice(idx, 1);
    return;
  }
  await staffApi.deleteOverride(id);
}
