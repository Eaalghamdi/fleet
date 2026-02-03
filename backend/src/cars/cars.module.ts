import { Module } from '@nestjs/common';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { CarInventoryRequestsService } from './car-inventory-requests.service';

@Module({
  controllers: [CarsController],
  providers: [CarsService, CarInventoryRequestsService],
  exports: [CarsService, CarInventoryRequestsService],
})
export class CarsModule {}
