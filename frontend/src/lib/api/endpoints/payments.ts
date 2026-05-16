import { apiGet, apiPost } from '../client';
import type { PaymentProvider, PaymentStatus } from '../types';

/**
 * Payment shape backend trả về (sau khi create + sau khi GET).
 * Decimal đã convert → number.
 */
export interface PaymentDto {
  id: string;
  bookingId: string | null;
  userId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PaymentStatus;
  providerRef: string | null;
  providerOrderId: string;
  redirectUrl: string | null;
  qrData: string | null;
  paidAt: string | null;
  failedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  bookingId: string;
  provider: PaymentProvider;
  returnUrl?: string;
}

export const paymentsApi = {
  /**
   * Tạo Payment cho booking. Trả về Payment có redirectUrl (VNPay/MoMo) hoặc qrData (ZaloPay).
   * UI redirect/render QR tuỳ provider.
   */
  create: (body: CreatePaymentInput) => apiPost<PaymentDto>('/payments', body),

  /** Poll status. Dùng trong `/booking/result` để đợi webhook về. */
  detail: (id: string) => apiGet<PaymentDto>(`/payments/${encodeURIComponent(id)}`),
};
