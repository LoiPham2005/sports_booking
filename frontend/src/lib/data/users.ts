/**
 * Data layer cho user profile + favorites + notifications.
 */
import { USE_MOCK } from '@/lib/api/config';
import { usersApi, type UpdateMeInput } from '@/lib/api/endpoints/users';
import {
  notificationsApi,
  toUiNotification,
  type UiNotification,
} from '@/lib/api/endpoints/notifications';
import type { UiUser } from '@/lib/api/adapters/user';
import type { UiVenue } from '@/lib/api/adapters/venue';
import { VENUES } from '@/lib/mock-data';

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

const mockUser: UiUser = {
  id: 'mock-user-1',
  email: 'demo@sportsbooking.local',
  phone: '+84 901 234 567',
  fullName: 'Khách Demo',
  role: 'CUSTOMER',
};

const mockNotifications: UiNotification[] = [
  {
    id: 'n1',
    type: 'payment_success',
    title: 'Thanh toán thành công',
    body: 'Booking #20250547 đã được xác nhận. Hẹn gặp bạn tại sân!',
    time: new Date(Date.now() - 2 * 3600_000).toISOString(),
    read: false,
  },
  {
    id: 'n2',
    type: 'promo',
    title: 'Khuyến mãi cuối tuần',
    body: 'Giảm 20% sân cầu lông T7-CN. Dùng mã SPORT20.',
    time: new Date(Date.now() - 6 * 3600_000).toISOString(),
    read: false,
  },
  {
    id: 'n3',
    type: 'reminder',
    title: 'Nhắc lịch chơi',
    body: 'Bạn có booking lúc 18:00 hôm nay tại Pickleball Saigon SC.',
    time: new Date(Date.now() - 24 * 3600_000).toISOString(),
    read: true,
  },
];

// ─────────────── Profile ───────────────

export async function getMe(): Promise<UiUser> {
  if (USE_MOCK) return mockUser;
  return usersApi.me();
}

export async function updateMe(body: UpdateMeInput): Promise<void> {
  if (USE_MOCK) return;
  await usersApi.updateMe(body);
}

// ─────────────── Favorites ───────────────

const mockFavoriteIds = new Set<string>(['v1', 'v4']);

export async function listFavorites(): Promise<UiVenue[]> {
  if (USE_MOCK) {
    return VENUES.filter((v) => mockFavoriteIds.has(v.id)).map(mockVenueToUi);
  }
  return usersApi.favorites();
}

export async function toggleFavorite(venueId: string, currentlyFavorited: boolean): Promise<void> {
  if (USE_MOCK) {
    if (currentlyFavorited) mockFavoriteIds.delete(venueId);
    else mockFavoriteIds.add(venueId);
    return;
  }
  if (currentlyFavorited) await usersApi.removeFavorite(venueId);
  else await usersApi.addFavorite(venueId);
}

/** Check 1 venue có nằm trong favorites của user hiện tại không. */
export async function isFavorite(venueId: string): Promise<boolean> {
  if (USE_MOCK) return mockFavoriteIds.has(venueId);
  try {
    const list = await usersApi.favorites();
    return list.some((v) => v.id === venueId);
  } catch {
    return false;
  }
}

// ─────────────── Notifications ───────────────

const mockNotifState = mockNotifications.map((n) => ({ ...n }));

export async function listNotifications(): Promise<UiNotification[]> {
  if (USE_MOCK) return mockNotifState;
  return notificationsApi.list();
}

export async function markNotificationRead(id: string): Promise<void> {
  if (USE_MOCK) {
    const n = mockNotifState.find((x) => x.id === id);
    if (n) n.read = true;
    return;
  }
  const dto = await notificationsApi.markRead(id);
  // Trả về raw NotificationDto từ backend; ta không cần consume, chỉ care side-effect.
  void toUiNotification(dto);
}
