import { PaymentProvider as PaymentProviderEnum, PaymentStatus } from '@prisma/client';

export interface CreatePaymentInput {
  paymentId: string;
  providerOrderId: string;
  amount: number; // VND đơn vị đồng
  currency: 'VND';
  description: string;
  ip?: string;
  /** Trang user sẽ được redirect về sau khi thanh toán (front-end). */
  returnUrl?: string;
}

export interface CreatePaymentResult {
  redirectUrl?: string;
  qrData?: string;
  providerRef?: string;
  raw?: unknown;
}

export interface VerifyCallbackResult {
  externalEventId: string;
  providerOrderId: string;
  providerRef?: string;
  status: PaymentStatus;
  amount?: number;
  signatureValid: boolean;
  rawPayload: unknown;
  /** Phản hồi gửi lại cho provider (vd response code). */
  ack?: unknown;
}

export interface QueryStatusResult {
  status: PaymentStatus;
  providerRef?: string;
  raw?: unknown;
}

export interface RefundInput {
  paymentId: string;
  amount: number;
  reason?: string;
  providerRef?: string;
}

export interface RefundResult {
  providerRefundRef?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  raw?: unknown;
}

export interface PaymentProvider {
  readonly key: PaymentProviderEnum;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyCallback(payload: unknown, headers: Record<string, string>): Promise<VerifyCallbackResult>;
  queryStatus(providerOrderId: string): Promise<QueryStatusResult>;
  refund(input: RefundInput): Promise<RefundResult>;
}
