import { apiGet, apiPost } from '../client';
import { toUiBooking, type UiBooking } from '../adapters/booking';
import type { BookingDto } from '../types';

/**
 * QuoteResponse từ POST /bookings/quote.
 * Backend (bookings.service.ts:quote) trả về:
 *   { courtId, startsAt, endsAt, slots, subtotal, discount, total, voucherCode?, holdToken }
 * Decimal đã được convert → number bởi DecimalSerializerInterceptor.
 */
export interface QuoteResponse {
  courtId: string;
  startsAt: string;
  endsAt: string;
  slots: Array<{ startsAt: string; endsAt: string; price: number }>;
  subtotal: number;
  discount: number;
  total: number;
  voucherCode?: string;
  holdToken: string;
}

export interface QuoteInput {
  courtId: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  voucherCode?: string;
}

export interface CreateBookingInput {
  holdToken: string;
  notes?: string;
}

export const bookingsApi = {
  /** Báo giá + giữ slot 10 phút trong Redis. */
  quote: (body: QuoteInput) => apiPost<QuoteResponse>('/bookings/quote', body),

  /** Tạo booking PENDING_PAYMENT từ holdToken. */
  create: (body: CreateBookingInput) => apiPost<BookingDto>('/bookings', body),

  /** Chi tiết booking — cần JWT, scope theo user/owner/admin. */
  detail: async (id: string): Promise<UiBooking> => {
    const dto = await apiGet<BookingDto>(`/bookings/${encodeURIComponent(id)}`);
    return toUiBooking(dto);
  },

  /** Danh sách booking của user hiện tại. */
  mine: async (): Promise<UiBooking[]> => {
    const list = await apiGet<BookingDto[]>('/bookings/mine');
    return list.map(toUiBooking);
  },

  /** Khách huỷ booking. Backend tự tính refund theo cancel policy. */
  cancel: (id: string, reason?: string) =>
    apiPost<BookingDto>(`/bookings/${encodeURIComponent(id)}/cancel`, { reason }),
};
