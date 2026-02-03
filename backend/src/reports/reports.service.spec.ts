import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma';
import { ReportType } from './dto';
import { CarStatus, CarType, MaintenanceStatus, TrackingMode } from '@prisma/client';

// Mock puppeteer
jest.mock('puppeteer', () => ({
  __esModule: true,
  default: {
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        setContent: jest.fn().mockResolvedValue(undefined),
        pdf: jest.fn().mockResolvedValue(Buffer.from('pdf')),
      }),
      close: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

describe('ReportsService', () => {
  let service: ReportsService;

  const mockCar = {
    id: 'car-123',
    model: 'Toyota Camry',
    type: CarType.SEDAN,
    licensePlate: 'ABC-123',
    status: CarStatus.AVAILABLE,
    nextMaintenanceDate: new Date('2024-02-15'),
  };

  const mockCarRequest = {
    id: 'request-123',
    requestedCarType: CarType.SEDAN,
    destination: 'Airport',
    status: 'APPROVED',
    departureDatetime: new Date(),
    createdAt: new Date(),
    createdBy: { fullName: 'John Doe' },
  };

  const mockMaintenanceRequest = {
    id: 'maintenance-123',
    description: 'Oil change',
    maintenanceType: 'INTERNAL',
    status: MaintenanceStatus.COMPLETED,
    externalCost: null,
    createdAt: new Date(),
    car: { model: 'Toyota Camry', licensePlate: 'ABC-123' },
  };

  const mockPart = {
    id: 'part-123',
    name: 'Oil Filter',
    carType: CarType.SEDAN,
    carModel: 'Toyota Camry',
    trackingMode: TrackingMode.QUANTITY,
    quantity: 10,
    serialNumber: null,
    isDeleted: false,
  };

  const mockPurchaseRequest = {
    id: 'purchase-123',
    partName: 'Brake Pads',
    quantity: 5,
    estimatedCost: 500,
    vendor: 'AutoParts Inc',
    status: 'APPROVED',
    createdAt: new Date(),
  };

  const mockPrismaService = {
    car: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    carRequest: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    maintenanceRequest: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    part: {
      findMany: jest.fn(),
    },
    purchaseRequest: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    beforeEach(() => {
      // Setup default mocks for all report types
      mockPrismaService.car.count.mockResolvedValue(10);
      mockPrismaService.car.groupBy.mockResolvedValue([
        { type: CarType.SEDAN, _count: { type: 5 } },
        { type: CarType.SUV, _count: { type: 3 } },
      ]);
      mockPrismaService.car.findMany.mockResolvedValue([mockCar]);
      mockPrismaService.carRequest.findMany.mockResolvedValue([mockCarRequest]);
      mockPrismaService.carRequest.groupBy.mockResolvedValue([
        { status: 'APPROVED', _count: { status: 5 } },
      ]);
      mockPrismaService.maintenanceRequest.findMany.mockResolvedValue([mockMaintenanceRequest]);
      mockPrismaService.maintenanceRequest.groupBy.mockResolvedValue([
        { status: MaintenanceStatus.COMPLETED, _count: { status: 3 } },
      ]);
      mockPrismaService.part.findMany.mockResolvedValue([mockPart]);
      mockPrismaService.purchaseRequest.findMany.mockResolvedValue([mockPurchaseRequest]);
    });

    it('should generate fleet overview report', async () => {
      const result = await service.generate({ type: ReportType.FLEET_OVERVIEW });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('type', ReportType.FLEET_OVERVIEW);
      expect(result).toHaveProperty('filePath');
      expect(result).toHaveProperty('generatedAt');
    });

    it('should generate car requests summary report', async () => {
      const result = await service.generate({
        type: ReportType.CAR_REQUESTS_SUMMARY,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('type', ReportType.CAR_REQUESTS_SUMMARY);
    });

    it('should generate maintenance summary report', async () => {
      const result = await service.generate({
        type: ReportType.MAINTENANCE_SUMMARY,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('type', ReportType.MAINTENANCE_SUMMARY);
    });

    it('should generate parts inventory report', async () => {
      const result = await service.generate({ type: ReportType.PARTS_INVENTORY });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('type', ReportType.PARTS_INVENTORY);
    });

    it('should use default date range when not provided', async () => {
      const result = await service.generate({ type: ReportType.CAR_REQUESTS_SUMMARY });

      expect(result).toHaveProperty('id');
      expect(mockPrismaService.carRequest.findMany).toHaveBeenCalled();
    });
  });

  describe('getReport', () => {
    it('should return a generated report', async () => {
      // First generate a report
      mockPrismaService.car.count.mockResolvedValue(10);
      mockPrismaService.car.groupBy.mockResolvedValue([]);
      mockPrismaService.car.findMany.mockResolvedValue([]);
      mockPrismaService.carRequest.findMany.mockResolvedValue([]);

      const generated = await service.generate({ type: ReportType.FLEET_OVERVIEW });
      const result = service.getReport(generated.id);

      expect(result).toEqual(generated);
    });

    it('should throw NotFoundException for non-existent report', () => {
      expect(() => service.getReport('nonexistent-id')).toThrow(NotFoundException);
    });
  });

  describe('getReportFilePath', () => {
    it('should return file path for existing report', async () => {
      // First generate a report
      mockPrismaService.car.count.mockResolvedValue(10);
      mockPrismaService.car.groupBy.mockResolvedValue([]);
      mockPrismaService.car.findMany.mockResolvedValue([]);
      mockPrismaService.carRequest.findMany.mockResolvedValue([]);

      const generated = await service.generate({ type: ReportType.FLEET_OVERVIEW });
      const filePath = service.getReportFilePath(generated.id);

      expect(filePath).toBe(generated.filePath);
    });

    it('should throw NotFoundException for non-existent report', () => {
      expect(() => service.getReportFilePath('nonexistent-id')).toThrow(NotFoundException);
    });
  });
});
