import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingsService } from './bookings.service';

@Injectable()
export class BookingExpiryService {
  private readonly logger = new Logger(BookingExpiryService.name);

  constructor(private bookings: BookingsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async expireUnpaid(): Promise<void> {
    try {
      const n = await this.bookings.cancelTimedOut();
      if (n > 0) this.logger.log(`Cancelled ${n} unpaid bookings`);
    } catch (e) {
      this.logger.error('expireUnpaid failed', e as Error);
    }
  }
}
