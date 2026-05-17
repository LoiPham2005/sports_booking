import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider as PaymentProviderEnum, PaymentStatus } from '@prisma/client';
import axios from 'axios';
import { createHmac } from 'crypto';
import {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  QueryStatusResult,
  RefundInput,
  RefundResult,
  VerifyCallbackResult,
} from '../interfaces/payment-provider.interface';

/**
 * VNPay sandbox docs:
 *   https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 * Quy trình:
 *   1. Build URL với các tham số vnp_*, sắp xếp alphabet, ký HMAC-SHA512 bằng hash_secret.
 *   2. Redirect user tới VNPAY_PAY_URL?....&vnp_SecureHash=...
 *   3. VNPay callback IPN (server-to-server) và Return URL (browser) — đều có vnp_SecureHash để verify.
 *   4. Response: vnp_ResponseCode = '00' & vnp_TransactionStatus = '00' ⇒ SUCCESS.
 */
@Injectable()
export class VnpayProvider implements PaymentProvider {
  readonly key = PaymentProviderEnum.VNPAY;
  private readonly logger = new Logger(VnpayProvider.name);

  constructor(private cfg: ConfigService) {}

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const tmnCode = this.cfg.get<string>('payments.vnpay.tmnCode', '');
    const hashSecret = this.cfg.get<string>('payments.vnpay.hashSecret', '');
    if (!tmnCode || !hashSecret) {
      throw new ServiceUnavailableException(
        'Cổng thanh toán VNPay chưa được cấu hình trên server (VNPAY_TMN_CODE / VNPAY_HASH_SECRET rỗng). Vui lòng chọn cổng khác hoặc liên hệ admin.',
      );
    }
    const payUrl = this.cfg.getOrThrow<string>('payments.vnpay.payUrl');
    const returnUrl = this.cfg.getOrThrow<string>('payments.vnpay.returnUrl');

    const now = new Date();
    const createDate = this.formatVnpDate(now);
    const expireDate = this.formatVnpDate(new Date(now.getTime() + 15 * 60_000));

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: String(input.amount * 100), // VNPay yêu cầu nhân 100
      vnp_CurrCode: 'VND',
      vnp_TxnRef: input.providerOrderId,
      vnp_OrderInfo: input.description,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: input.ip || '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    const sorted = this.sortAndEncode(params);
    const secureHash = createHmac('sha512', hashSecret).update(sorted, 'utf-8').digest('hex');
    const redirectUrl = `${payUrl}?${sorted}&vnp_SecureHash=${secureHash}`;

    return { redirectUrl, raw: params };
  }

  async verifyCallback(payload: unknown): Promise<VerifyCallbackResult> {
    const params = { ...(payload as Record<string, string>) };
    const receivedHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const hashSecret = this.cfg.getOrThrow<string>('payments.vnpay.hashSecret');
    const signed = createHmac('sha512', hashSecret)
      .update(this.sortAndEncode(params), 'utf-8')
      .digest('hex');

    const signatureValid = signed.toLowerCase() === (receivedHash ?? '').toLowerCase();
    const responseCode = params.vnp_ResponseCode;
    const txnStatus = params.vnp_TransactionStatus;

    let status: PaymentStatus = PaymentStatus.FAILED;
    if (signatureValid && responseCode === '00' && txnStatus === '00') {
      status = PaymentStatus.SUCCESS;
    } else if (responseCode === '24') {
      status = PaymentStatus.CANCELLED;
    }

    return {
      externalEventId: `${params.vnp_TxnRef}:${params.vnp_TransactionNo ?? ''}`,
      providerOrderId: params.vnp_TxnRef,
      providerRef: params.vnp_TransactionNo,
      amount: params.vnp_Amount ? Number(params.vnp_Amount) / 100 : undefined,
      signatureValid,
      status,
      rawPayload: payload,
      // IPN ack format VNPay yêu cầu
      ack: signatureValid
        ? { RspCode: '00', Message: 'Confirm Success' }
        : { RspCode: '97', Message: 'Invalid Checksum' },
    };
  }

  async queryStatus(providerOrderId: string): Promise<QueryStatusResult> {
    const tmnCode = this.cfg.getOrThrow<string>('payments.vnpay.tmnCode');
    const hashSecret = this.cfg.getOrThrow<string>('payments.vnpay.hashSecret');
    const apiUrl = this.cfg.getOrThrow<string>('payments.vnpay.apiUrl');

    const now = new Date();
    const requestId = Date.now().toString();
    const createDate = this.formatVnpDate(now);

    const body: Record<string, string> = {
      vnp_RequestId: requestId,
      vnp_Version: '2.1.0',
      vnp_Command: 'querydr',
      vnp_TmnCode: tmnCode,
      vnp_TxnRef: providerOrderId,
      vnp_OrderInfo: `Query ${providerOrderId}`,
      vnp_TransactionDate: createDate,
      vnp_CreateDate: createDate,
      vnp_IpAddr: '127.0.0.1',
    };

    const data = [
      body.vnp_RequestId,
      body.vnp_Version,
      body.vnp_Command,
      body.vnp_TmnCode,
      body.vnp_TxnRef,
      body.vnp_TransactionDate,
      body.vnp_CreateDate,
      body.vnp_IpAddr,
      body.vnp_OrderInfo,
    ].join('|');
    body.vnp_SecureHash = createHmac('sha512', hashSecret).update(data, 'utf-8').digest('hex');

    const res = await axios.post(apiUrl, body, { timeout: 10_000 });
    const responseCode = res.data?.vnp_ResponseCode;
    const txnStatus = res.data?.vnp_TransactionStatus;
    let status: PaymentStatus = PaymentStatus.PENDING;
    if (responseCode === '00' && txnStatus === '00') status = PaymentStatus.SUCCESS;
    else if (txnStatus === '02') status = PaymentStatus.FAILED;
    return { status, providerRef: res.data?.vnp_TransactionNo, raw: res.data };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    this.logger.warn(`VNPay refund called for ${input.paymentId} — implement per merchant agreement`);
    return { status: 'PENDING' };
  }

  private sortAndEncode(params: Record<string, string>): string {
    return Object.keys(params)
      .filter((k) => params[k] !== undefined && params[k] !== '')
      .sort()
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`)
      .join('&');
  }

  private formatVnpDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }
}
