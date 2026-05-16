import type { BookingStatus } from '../types';

/**
 * UI status — gom 9 status DB thành các nhóm UI dùng (xem
 * docs/API_INTEGRATION.md § 6).
 *
 * - `CANCELLED` = gom 3 variant CANCELLED_BY_USER / CANCELLED_BY_OWNER / CANCELLED_TIMEOUT
 * - `NO_SHOW` và `REFUNDED` giữ riêng (UI mock cũ chưa có — cần thêm label)
 */
export type UiBookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'REFUNDED';

export function toUiStatus(s: BookingStatus): UiBookingStatus {
  if (s === 'CANCELLED_BY_USER' || s === 'CANCELLED_BY_OWNER' || s === 'CANCELLED_TIMEOUT') {
    return 'CANCELLED';
  }
  return s;
}

export const STATUS_LABEL: Record<UiBookingStatus, { text: string; tone: string }> = {
  PENDING_PAYMENT: { text: 'Chờ thanh toán', tone: 'warning' },
  CONFIRMED: { text: 'Đã xác nhận', tone: 'success' },
  CHECKED_IN: { text: 'Đã check-in', tone: 'default' },
  COMPLETED: { text: 'Hoàn thành', tone: 'muted' },
  CANCELLED: { text: 'Đã huỷ', tone: 'destructive' },
  NO_SHOW: { text: 'Không đến', tone: 'destructive' },
  REFUNDED: { text: 'Đã hoàn tiền', tone: 'muted' },
};
