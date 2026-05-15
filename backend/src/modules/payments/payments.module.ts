import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { VnpayProvider } from './providers/vnpay.provider';
import { MomoProvider } from './providers/momo.provider';
import { ZalopayProvider } from './providers/zalopay.provider';
import { PaymentProviderFactory } from './providers/provider.factory';
import { PaymentsReconcileService } from './reconcile.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    VnpayProvider,
    MomoProvider,
    ZalopayProvider,
    PaymentProviderFactory,
    PaymentsReconcileService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
