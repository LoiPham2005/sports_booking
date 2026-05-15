import { Injectable, Logger } from '@nestjs/common';
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
 * ZaloPay sandbox.
 * Docs: https://docs.zalopay.vn/v2/general/overview.html
 *
 * Create order:
 *   data = app_id|app_trans_id|app_user|amount|app_time|embed_data|item
 *   mac  = HMAC-SHA256(key1, data)
 *
 * Callback (server → merchant):
 *   {
 *     data: "<json string>",
 *     mac:  "...",
 *     type: 1
 *   }
 *   verify: HMAC-SHA256(key2, data) === mac
 */
@Injectable()
export class ZalopayProvider implements PaymentProvider {
  readonly key = PaymentProviderEnum.ZALOPAY;
  private readonly logger = new Logger(ZalopayProvider.name);

  constructor(private cfg: ConfigService) {}

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const appId = Number(this.cfg.getOrThrow<string>('payments.zalopay.appId'));
    const key1 = this.cfg.getOrThrow<string>('payments.zalopay.key1');
    const endpoint = this.cfg.getOrThrow<string>('payments.zalopay.createEndpoint');
    const callbackUrl = this.cfg.getOrThrow<string>('payments.zalopay.callbackUrl');
    const redirectUrl =
      input.returnUrl ?? this.cfg.getOrThrow<string>('payments.zalopay.redirectUrl');

    const appTime = Date.now();
    // ZaloPay yêu cầu app_trans_id: yymmdd_<unique>
    const yymmdd = new Date(appTime)
      .toISOString()
      .slice(2, 10)
      .replace(/-/g, '');
    const appTransId = `${yymmdd}_${input.providerOrderId}`.slice(0, 40);
    const appUser = 'sports_booking_user';
    const embedData = JSON.stringify({ redirecturl: redirectUrl });
    const item = '[]';

    const dataStr = `${appId}|${appTransId}|${appUser}|${input.amount}|${appTime}|${embedData}|${item}`;
    const mac = createHmac('sha256', key1).update(dataStr).digest('hex');

    const body: Record<string, string | number> = {
      app_id: appId,
      app_trans_id: appTransId,
      app_user: appUser,
      app_time: appTime,
      amount: input.amount,
      description: input.description,
      bank_code: '',
      item,
      embed_data: embedData,
      callback_url: callbackUrl,
      mac,
    };

    const res = await axios.post(endpoint, body, {
      timeout: 10_000,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: [(data) => new URLSearchParams(data as Record<string, string>).toString()],
    });

    if (Number(res.data?.return_code) !== 1) {
      throw new Error(`ZaloPay create failed: ${res.data?.return_message}`);
    }

    return {
      redirectUrl: res.data.order_url,
      qrData: res.data.qr_code,
      providerRef: res.data.zp_trans_token,
      raw: { ...res.data, app_trans_id: appTransId },
    };
  }

  async verifyCallback(payload: unknown): Promise<VerifyCallbackResult> {
    const p = payload as { data?: string; mac?: string; type?: number };
    const key2 = this.cfg.getOrThrow<string>('payments.zalopay.key2');
    const data = p.data ?? '';
    const expected = createHmac('sha256', key2).update(data).digest('hex');
    const signatureValid = expected === p.mac;

    let parsed: Record<string, any> = {};
    try {
      parsed = JSON.parse(data);
    } catch {
      // invalid json
    }

    const status: PaymentStatus =
      signatureValid && Number(p.type) === 1 ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

    return {
      externalEventId: `${parsed.app_trans_id}:${parsed.zp_trans_id}`,
      providerOrderId: this.extractProviderOrderId(parsed.app_trans_id),
      providerRef: parsed.zp_trans_id?.toString(),
      amount: Number(parsed.amount),
      signatureValid,
      status,
      rawPayload: payload,
      // ZaloPay yêu cầu trả {"return_code":1,"return_message":"success"} khi xử lý ok.
      ack: signatureValid
        ? { return_code: 1, return_message: 'success' }
        : { return_code: -1, return_message: 'mac not equal' },
    };
  }

  async queryStatus(providerOrderId: string): Promise<QueryStatusResult> {
    const appId = this.cfg.getOrThrow<string>('payments.zalopay.appId');
    const key1 = this.cfg.getOrThrow<string>('payments.zalopay.key1');
    const endpoint = this.cfg.getOrThrow<string>('payments.zalopay.queryEndpoint');

    // Cần app_trans_id full (yymmdd_xxx). Ta lưu trong metadata khi tạo.
    const appTransId = providerOrderId; // caller phải truyền đúng app_trans_id (lưu metadata).
    const data = `${appId}|${appTransId}|${key1}`;
    const mac = createHmac('sha256', key1).update(data).digest('hex');

    const res = await axios.post(
      endpoint,
      { app_id: appId, app_trans_id: appTransId, mac },
      {
        timeout: 10_000,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        transformRequest: [(d) => new URLSearchParams(d as Record<string, string>).toString()],
      },
    );

    const code = Number(res.data?.return_code);
    let status: PaymentStatus = PaymentStatus.PENDING;
    if (code === 1) status = PaymentStatus.SUCCESS;
    else if (code === 2) status = PaymentStatus.FAILED;
    return { status, providerRef: res.data?.zp_trans_id?.toString(), raw: res.data };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const appId = Number(this.cfg.getOrThrow<string>('payments.zalopay.appId'));
    const key1 = this.cfg.getOrThrow<string>('payments.zalopay.key1');
    const endpoint = this.cfg.getOrThrow<string>('payments.zalopay.refundEndpoint');

    if (!input.providerRef) throw new Error('Missing providerRef (zp_trans_id)');

    const timestamp = Date.now();
    const uid = `${timestamp}${Math.floor(111 + Math.random() * 888)}`;
    const yymmdd = new Date(timestamp).toISOString().slice(2, 10).replace(/-/g, '');
    const mRefundId = `${yymmdd}_${appId}_${uid}`;
    const dataStr = `${appId}|${input.providerRef}|${input.amount}|${input.reason ?? 'refund'}|${timestamp}`;
    const mac = createHmac('sha256', key1).update(dataStr).digest('hex');

    const res = await axios.post(
      endpoint,
      {
        m_refund_id: mRefundId,
        app_id: appId,
        zp_trans_id: input.providerRef,
        amount: input.amount,
        timestamp,
        description: input.reason ?? 'refund',
        mac,
      },
      {
        timeout: 15_000,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        transformRequest: [(d) => new URLSearchParams(d as Record<string, string>).toString()],
      },
    );

    const code = Number(res.data?.return_code);
    const status = code === 1 ? 'SUCCESS' : code === 3 ? 'PENDING' : 'FAILED';
    this.logger.log(`ZaloPay refund result: ${code} - ${res.data?.return_message}`);
    return { providerRefundRef: mRefundId, status, raw: res.data };
  }

  private extractProviderOrderId(appTransId: string | undefined): string {
    if (!appTransId) return '';
    const idx = appTransId.indexOf('_');
    return idx >= 0 ? appTransId.substring(idx + 1) : appTransId;
  }
}
