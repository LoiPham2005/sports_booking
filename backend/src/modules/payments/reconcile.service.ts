import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentsService } from './payments.service';

@Injectable()
export class PaymentsReconcileService {
  private readonly logger = new Logger(PaymentsReconcileService.name);

  constructor(private payments: PaymentsService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async run(): Promise<void> {
    try {
      const n = await this.payments.reconcilePending();
      if (n > 0) this.logger.log(`Reconciled ${n} payments to SUCCESS`);
    } catch (e) {
      this.logger.error('reconcile failed', e as Error);
    }
  }
}
