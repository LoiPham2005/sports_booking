import { Module } from '@nestjs/common';
import { PricingModule } from '../pricing/pricing.module';
import { VenuesModule } from '../venues/venues.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { HoldService } from './hold.service';
import { BookingExpiryService } from './booking-expiry.service';

@Module({
  imports: [PricingModule, VenuesModule],
  controllers: [BookingsController],
  providers: [BookingsService, HoldService, BookingExpiryService],
  exports: [BookingsService],
})
export class BookingsModule {}
