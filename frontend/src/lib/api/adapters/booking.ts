import type { BookingDto } from '../types';
import { toUiVenue, type UiVenue } from './venue';
import { toUiStatus, type UiBookingStatus } from './status';

/**
 * UI booking — flatten venue + court vào structure đơn giản UI đang dùng.
 * (xem docs/API_INTEGRATION.md § 5)
 */
export interface UiBooking {
  id: string;
  code: string;
  venue: UiVenue;
  courtName: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  total: number;
  status: UiBookingStatus;
  /** Token để render QR check-in (an toàn hơn `code`). */
  checkInToken?: string;
  checkedInAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  refundAmount?: number;
  notes?: string;
}

export function toUiBooking(dto: BookingDto): UiBooking {
  if (!dto.venue) {
    throw new Error('toUiBooking: dto.venue is required (API must include relation)');
  }
  return {
    id: dto.id,
    code: dto.code,
    venue: toUiVenue(dto.venue),
    courtName: dto.court?.name ?? '—',
    startsAt: dto.startsAt,
    endsAt: dto.endsAt,
    total: dto.total,
    status: toUiStatus(dto.status),
    checkInToken: dto.checkInToken ?? undefined,
    checkedInAt: dto.checkedInAt ?? undefined,
    cancelledAt: dto.cancelledAt ?? undefined,
    cancelReason: dto.cancelReason ?? undefined,
    refundAmount: dto.refundAmount ?? undefined,
    notes: dto.notes ?? undefined,
  };
}
