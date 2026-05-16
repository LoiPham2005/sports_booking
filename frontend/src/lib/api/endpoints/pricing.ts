import { apiGet } from '../client';

/**
 * Bảng giá theo slot trả về từ `GET /courts/:id/price?startsAt=&endsAt=`.
 * Đây là endpoint **public**, KHÔNG giữ chỗ — chỉ để hiển thị trước cho user.
 * Khi user xác nhận đặt → gọi `bookingsApi.quote()` để có holdToken.
 */
export interface PriceQuote {
  courtId: string;
  startsAt: string;
  endsAt: string;
  slots: Array<{ startsAt: string; endsAt: string; price: number }>;
  subtotal: number;
}

export const pricingApi = {
  /**
   * Báo giá nhanh (không hold). Dùng cho BookingMatrix preview giá cell.
   */
  quote: (params: { courtId: string; startsAt: string; endsAt: string }) =>
    apiGet<PriceQuote>(`/courts/${encodeURIComponent(params.courtId)}/price`, {
      query: { startsAt: params.startsAt, endsAt: params.endsAt },
    }),
};
