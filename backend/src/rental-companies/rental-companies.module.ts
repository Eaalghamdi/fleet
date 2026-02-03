import { Module } from '@nestjs/common';
import { RentalCompaniesService } from './rental-companies.service';
import { RentalCompaniesController } from './rental-companies.controller';

@Module({
  controllers: [RentalCompaniesController],
  providers: [RentalCompaniesService],
  exports: [RentalCompaniesService],
})
export class RentalCompaniesModule {}
