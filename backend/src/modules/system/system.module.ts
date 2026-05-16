import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { PermissionsService } from './permissions.service';

@Module({
  controllers: [SystemController],
  providers: [SystemService, PermissionsService],
  exports: [PermissionsService],
})
export class SystemModule {}
