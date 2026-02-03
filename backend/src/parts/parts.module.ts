import { Module } from '@nestjs/common';
import { PartsController } from './parts.controller';
import { PartsService } from './parts.service';
import { PurchaseRequestsService } from './purchase-requests.service';
import { MaintenancePartsService } from './maintenance-parts.service';

@Module({
  controllers: [PartsController],
  providers: [PartsService, PurchaseRequestsService, MaintenancePartsService],
  exports: [PartsService, PurchaseRequestsService, MaintenancePartsService],
})
export class PartsModule {}
