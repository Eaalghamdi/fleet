import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    // Disconnect after each test
    await service.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    // PrismaService extends PrismaClient, so it should have $connect method
    expect(typeof service.$connect).toBe('function');
  });

  it('should have onModuleInit method', () => {
    const hasOnModuleInit = 'onModuleInit' in service;
    expect(hasOnModuleInit).toBe(true);
  });

  it('should have onModuleDestroy method', () => {
    const hasOnModuleDestroy = 'onModuleDestroy' in service;
    expect(hasOnModuleDestroy).toBe(true);
  });

  it('should have cleanDatabase method', () => {
    const hasCleanDatabase = 'cleanDatabase' in service;
    expect(hasCleanDatabase).toBe(true);
  });

  it('should have user model accessor', () => {
    expect(service.user).toBeDefined();
  });

  it('should have car model accessor', () => {
    expect(service.car).toBeDefined();
  });

  it('should have carRequest model accessor', () => {
    expect(service.carRequest).toBeDefined();
  });

  it('should have maintenanceRequest model accessor', () => {
    expect(service.maintenanceRequest).toBeDefined();
  });

  it('should have part model accessor', () => {
    expect(service.part).toBeDefined();
  });

  it('should have purchaseRequest model accessor', () => {
    expect(service.purchaseRequest).toBeDefined();
  });

  it('should have carInventoryRequest model accessor', () => {
    expect(service.carInventoryRequest).toBeDefined();
  });

  it('should have auditLog model accessor', () => {
    expect(service.auditLog).toBeDefined();
  });

  it('should have notification model accessor', () => {
    expect(service.notification).toBeDefined();
  });

  it('should have rentalCompany model accessor', () => {
    expect(service.rentalCompany).toBeDefined();
  });

  describe('cleanDatabase', () => {
    it('should throw error in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await expect(service.cleanDatabase()).rejects.toThrow(
        'cleanDatabase is not allowed in production',
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
});
