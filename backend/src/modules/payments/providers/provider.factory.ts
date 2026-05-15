import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentProvider as PaymentProviderEnum } from '@prisma/client';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { VnpayProvider } from './vnpay.provider';
import { MomoProvider } from './momo.provider';
import { ZalopayProvider } from './zalopay.provider';

@Injectable()
export class PaymentProviderFactory {
  private map: Record<string, PaymentProvider>;

  constructor(vnpay: VnpayProvider, momo: MomoProvider, zalopay: ZalopayProvider) {
    this.map = {
      [PaymentProviderEnum.VNPAY]: vnpay,
      [PaymentProviderEnum.MOMO]: momo,
      [PaymentProviderEnum.ZALOPAY]: zalopay,
    };
  }

  get(provider: PaymentProviderEnum): PaymentProvider {
    const p = this.map[provider];
    if (!p) throw new BadRequestException(`Provider ${provider} not supported`);
    return p;
  }
}
