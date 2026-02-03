import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { AuthModule, JwtAuthGuard, RolesGuard, DepartmentsGuard } from './auth';
import { UsersModule } from './users';
import { CarsModule } from './cars';
import { CarRequestsModule } from './car-requests';
import { UploadsModule } from './uploads';
import { MaintenanceModule } from './maintenance';
import { PartsModule } from './parts';
import { NotificationsModule } from './notifications';
import { AuditModule } from './audit';
import { ReportsModule } from './reports';
import { RentalCompaniesModule } from './rental-companies';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CarsModule,
    CarRequestsModule,
    UploadsModule,
    MaintenanceModule,
    PartsModule,
    NotificationsModule,
    AuditModule,
    ReportsModule,
    RentalCompaniesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: DepartmentsGuard,
    },
  ],
})
export class AppModule {}
