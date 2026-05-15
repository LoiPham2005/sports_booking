import { Module } from '@nestjs/common';
import { OwnerController, StaffInviteController } from './owner.controller';
import { OwnerService } from './owner.service';

@Module({
  controllers: [OwnerController, StaffInviteController],
  providers: [OwnerService],
})
export class OwnerModule {}
