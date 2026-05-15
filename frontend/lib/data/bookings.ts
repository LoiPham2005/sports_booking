/**
 * Data layer cho bookings — chọn mock vs API qua `USE_MOCK`.
 */

import { USE_MOCK } from '@/lib/api/config';
import { bookingsApi } from '@/lib/api/endpoints/bookings';
import type { UiBooking } from '@/lib/api/adapters/booking';
import type { UiBookingStatus } from '@/lib/api/adapters/status';
import { BOOKINGS } from '@/lib/mock-data';
import type { UiVenue } from '@/lib/api/adapters/venue';

function mockBookingToUi(b: (typeof BOOKINGS)[number]): UiBooking {
  const venue: UiVenue = {
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
  };
  return {
    id: b.id,
    code: b.code,
    venue,
    courtName: b.courtName,
    startsAt: b.startsAt,
    endsAt: b.endsAt,
    total: b.total,
    status: b.status as UiBookingStatus,
  };
}

export async function listMyBookings(): Promise<UiBooking[]> {
  if (USE_MOCK) return BOOKINGS.map(mockBookingToUi);
  return bookingsApi.mine();
}

export async function getMyBooking(id: string): Promise<UiBooking | null> {
  if (USE_MOCK) {
    const b = BOOKINGS.find((x) => x.id === id);
    return b ? mockBookingToUi(b) : null;
  }
  try {
    return await bookingsApi.detail(id);
  } catch {
    return null;
  }
}

export async function cancelBooking(id: string, reason?: string): Promise<void> {
  if (USE_MOCK) {
    // Mock: chỉ giả lập (không persist).
    return;
  }
  await bookingsApi.cancel(id, reason);
}
