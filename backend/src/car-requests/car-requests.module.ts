import { Module } from '@nestjs/common';
import { CarRequestsController } from './car-requests.controller';
import { CarRequestsService } from './car-requests.service';

@Module({
  controllers: [CarRequestsController],
  providers: [CarRequestsService],
  exports: [CarRequestsService],
})
export class CarRequestsModule {}
