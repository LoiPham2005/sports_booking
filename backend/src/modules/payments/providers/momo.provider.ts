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
 * MoMo AIO v2.
 * Docs: https://developers.momo.vn/v3/docs/payment/api/payment-method/onetime
 * Tạo signature theo thứ tự field cố định:
 *   accessKey=...&amount=...&extraData=...&ipnUrl=...&orderId=...&orderInfo=...
 *   &partnerCode=...&redirectUrl=...&requestId=...&requestType=...
 * Ký HMAC-SHA256 bằng secretKey.
 *
 * Callback IPN trả JSON kèm `signature`. resultCode = 0 ⇒ SUCCESS.
 */
@Injectable()
export class MomoProvider implements PaymentProvider {
  readonly key = PaymentProviderEnum.MOMO;
  private readonly logger = new Logger(MomoProvider.name);

  constructor(private cfg: ConfigService) {}

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const partnerCode = this.cfg.getOrThrow<string>('payments.momo.partnerCode');
    const accessKey = this.cfg.getOrThrow<string>('payments.momo.accessKey');
    const secretKey = this.cfg.getOrThrow<string>('payments.momo.secretKey');
    const endpoint = this.cfg.getOrThrow<string>('payments.momo.endpoint');
    const redirectUrl = input.returnUrl ?? this.cfg.getOrThrow<string>('payments.momo.returnUrl');
    const ipnUrl = this.cfg.getOrThrow<string>('payments.momo.notifyUrl');

    const requestId = `${input.providerOrderId}-${Date.now()}`;
    const orderId = input.providerOrderId;
    const orderInfo = input.description;
    const extraData = '';
    const requestType = 'captureWallet';
    const amount = String(input.amount);

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;
    const signature = createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const body = {
      partnerCode,
      partnerName: 'SportsBooking',
      storeId: 'SportsBooking',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      extraData,
      requestType,
      signature,
    };

    const res = await axios.post(endpoint, body, { timeout: 10_000 });
    if (res.data?.resultCode !== 0) {
      throw new Error(`MoMo create failed: ${res.data?.message ?? 'unknown'}`);
    }

    return {
      redirectUrl: res.data.payUrl,
      qrData: res.data.qrCodeUrl,
      providerRef: res.data.requestId,
      raw: res.data,
    };
  }

  async verifyCallback(payload: unknown): Promise<VerifyCallbackResult> {
    const p = payload as Record<string, any>;
    const accessKey = this.cfg.getOrThrow<string>('payments.momo.accessKey');
    const secretKey = this.cfg.getOrThrow<string>('payments.momo.secretKey');

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${p.amount}` +
      `&extraData=${p.extraData}` +
      `&message=${p.message}` +
      `&orderId=${p.orderId}` +
      `&orderInfo=${p.orderInfo}` +
      `&orderType=${p.orderType}` +
      `&partnerCode=${p.partnerCode}` +
      `&payType=${p.payType}` +
      `&requestId=${p.requestId}` +
      `&responseTime=${p.responseTime}` +
      `&resultCode=${p.resultCode}` +
      `&transId=${p.transId}`;
    const expected = createHmac('sha256', secretKey).update(rawSignature).digest('hex');
    const signatureValid = expected === p.signature;

    const status: PaymentStatus =
      signatureValid && Number(p.resultCode) === 0 ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

    return {
      externalEventId: `${p.orderId}:${p.transId}`,
      providerOrderId: p.orderId,
      providerRef: String(p.transId),
      amount: Number(p.amount),
      signatureValid,
      status,
      rawPayload: payload,
      ack: { status: signatureValid ? 0 : 1 },
    };
  }

  async queryStatus(providerOrderId: string): Promise<QueryStatusResult> {
    const partnerCode = this.cfg.getOrThrow<string>('payments.momo.partnerCode');
    const accessKey = this.cfg.getOrThrow<string>('payments.momo.accessKey');
    const secretKey = this.cfg.getOrThrow<string>('payments.momo.secretKey');
    const endpoint = this.cfg.getOrThrow<string>('payments.momo.queryEndpoint');

    const requestId = `${providerOrderId}-q-${Date.now()}`;
    const rawSignature = `accessKey=${accessKey}&orderId=${providerOrderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
    const signature = createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const res = await axios.post(
      endpoint,
      { partnerCode, requestId, orderId: providerOrderId, signature, lang: 'vi' },
      { timeout: 10_000 },
    );
    const code = Number(res.data?.resultCode);
    let status: PaymentStatus = PaymentStatus.PENDING;
    if (code === 0) status = PaymentStatus.SUCCESS;
    else if ([1006, 1080, 1081].includes(code)) status = PaymentStatus.FAILED;
    return { status, providerRef: res.data?.transId?.toString(), raw: res.data };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const partnerCode = this.cfg.getOrThrow<string>('payments.momo.partnerCode');
    const accessKey = this.cfg.getOrThrow<string>('payments.momo.accessKey');
    const secretKey = this.cfg.getOrThrow<string>('payments.momo.secretKey');
    const endpoint = this.cfg.getOrThrow<string>('payments.momo.refundEndpoint');

    if (!input.providerRef) throw new Error('Missing providerRef (transId) for MoMo refund');

    const requestId = `${input.paymentId}-r-${Date.now()}`;
    const orderId = `${input.paymentId}-r-${Date.now()}`;
    const amount = String(input.amount);
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&description=${input.reason ?? ''}` +
      `&orderId=${orderId}` +
      `&partnerCode=${partnerCode}` +
      `&requestId=${requestId}` +
      `&transId=${input.providerRef}`;
    const signature = createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const res = await axios.post(
      endpoint,
      {
        partnerCode,
        orderId,
        requestId,
        amount,
        transId: Number(input.providerRef),
        lang: 'vi',
        description: input.reason ?? 'Refund',
        signature,
      },
      { timeout: 15_000 },
    );

    const code = Number(res.data?.resultCode);
    const status = code === 0 ? 'SUCCESS' : code === 9000 ? 'PENDING' : 'FAILED';
    this.logger.log(`MoMo refund result: ${code} - ${res.data?.message}`);
    return { providerRefundRef: res.data?.transId?.toString(), status, raw: res.data };
  }
}
