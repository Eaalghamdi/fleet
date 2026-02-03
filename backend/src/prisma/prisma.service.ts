import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }

    // Delete in order respecting foreign key constraints
    await this.notification.deleteMany();
    await this.auditLog.deleteMany();
    await this.maintenancePartUsage.deleteMany();
    await this.carRequestImage.deleteMany();
    await this.carRequest.deleteMany();
    await this.maintenanceRequest.deleteMany();
    await this.part.deleteMany();
    await this.purchaseRequest.deleteMany();
    await this.carInventoryRequest.deleteMany();
    await this.car.deleteMany();
    await this.rentalCompany.deleteMany();
    await this.user.deleteMany();
  }
}
