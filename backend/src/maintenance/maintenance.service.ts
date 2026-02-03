import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  CreateMaintenanceDto,
  TriageMaintenanceDto,
  CompleteMaintenanceDto,
  MaintenanceFilterDto,
} from './dto';
import {
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenanceType,
  CarStatus,
  Prisma,
} from '@prisma/client';

export interface MaintenanceWithRelations extends MaintenanceRequest {
  car: {
    id: string;
    model: string;
    licensePlate: string;
    type: string;
  };
  createdBy: {
    id: string;
    fullName: string;
    department: string;
  };
  triagedBy?: {
    id: string;
    fullName: string;
  } | null;
  approvedBy?: {
    id: string;
    fullName: string;
  } | null;
}

// Valid state transitions for maintenance requests
const STATE_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  [MaintenanceStatus.PENDING]: [MaintenanceStatus.PENDING_APPROVAL],
  [MaintenanceStatus.PENDING_APPROVAL]: [MaintenanceStatus.APPROVED, MaintenanceStatus.REJECTED],
  [MaintenanceStatus.APPROVED]: [MaintenanceStatus.IN_PROGRESS],
  [MaintenanceStatus.REJECTED]: [],
  [MaintenanceStatus.IN_PROGRESS]: [MaintenanceStatus.COMPLETED],
  [MaintenanceStatus.COMPLETED]: [],
};

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: MaintenanceFilterDto): Promise<MaintenanceWithRelations[]> {
    const where: Prisma.MaintenanceRequestWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.maintenanceType) {
      where.maintenanceType = filters.maintenanceType;
    }

    if (filters?.carId) {
      where.carId = filters.carId;
    }

    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};
      if (filters?.fromDate) {
        where.createdAt.gte = new Date(filters.fromDate);
      }
      if (filters?.toDate) {
        where.createdAt.lte = new Date(filters.toDate);
      }
    }

    return this.prisma.maintenanceRequest.findMany({
      where,
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<MaintenanceWithRelations> {
    const maintenance = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: this.getIncludeOptions(),
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance request with ID ${id} not found`);
    }

    return maintenance;
  }

  async create(dto: CreateMaintenanceDto, userId: string): Promise<MaintenanceRequest> {
    // Verify car exists and is not deleted
    const car = await this.prisma.car.findUnique({
      where: { id: dto.carId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${dto.carId} not found`);
    }

    if (car.status === CarStatus.DELETED) {
      throw new BadRequestException('Cannot create maintenance for deleted car');
    }

    // Check if car already has active maintenance
    const activeMaintenanceStatuses: MaintenanceStatus[] = [
      MaintenanceStatus.PENDING,
      MaintenanceStatus.PENDING_APPROVAL,
      MaintenanceStatus.APPROVED,
      MaintenanceStatus.IN_PROGRESS,
    ];

    const existingMaintenance = await this.prisma.maintenanceRequest.findFirst({
      where: {
        carId: dto.carId,
        status: { in: activeMaintenanceStatuses },
      },
    });

    if (existingMaintenance) {
      throw new BadRequestException('Car already has an active maintenance request');
    }

    return this.prisma.maintenanceRequest.create({
      data: {
        carId: dto.carId,
        description: dto.description,
        createdById: userId,
      },
    });
  }

  async triage(id: string, dto: TriageMaintenanceDto, userId: string): Promise<MaintenanceRequest> {
    const maintenance = await this.findOne(id);

    this.validateStateTransition(maintenance.status, MaintenanceStatus.PENDING_APPROVAL);

    // Validate external maintenance requirements
    if (dto.maintenanceType === MaintenanceType.EXTERNAL) {
      if (!dto.externalVendor) {
        throw new BadRequestException('External vendor is required for external maintenance');
      }
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: MaintenanceStatus.PENDING_APPROVAL,
        maintenanceType: dto.maintenanceType,
        externalVendor: dto.externalVendor,
        triagedById: userId,
      },
    });
  }

  async approve(id: string, userId: string): Promise<MaintenanceRequest> {
    const maintenance = await this.findOne(id);

    this.validateStateTransition(maintenance.status, MaintenanceStatus.APPROVED);

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: MaintenanceStatus.APPROVED,
        approvedById: userId,
      },
    });
  }

  async reject(id: string, userId: string): Promise<MaintenanceRequest> {
    const maintenance = await this.findOne(id);

    this.validateStateTransition(maintenance.status, MaintenanceStatus.REJECTED);

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: MaintenanceStatus.REJECTED,
        approvedById: userId,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async startWork(id: string, _userId: string): Promise<MaintenanceRequest> {
    const maintenance = await this.findOne(id);

    this.validateStateTransition(maintenance.status, MaintenanceStatus.IN_PROGRESS);

    // Update car status to UNDER_MAINTENANCE
    await this.prisma.car.update({
      where: { id: maintenance.carId },
      data: { status: CarStatus.UNDER_MAINTENANCE },
    });

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: MaintenanceStatus.IN_PROGRESS,
      },
    });
  }

  async complete(
    id: string,
    dto: CompleteMaintenanceDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId: string,
  ): Promise<MaintenanceRequest> {
    const maintenance = await this.findOne(id);

    this.validateStateTransition(maintenance.status, MaintenanceStatus.COMPLETED);

    // Update car status back to AVAILABLE
    const car = await this.prisma.car.findUnique({
      where: { id: maintenance.carId },
    });

    if (car) {
      // Calculate next maintenance date if car has maintenance interval
      const updateData: Prisma.CarUpdateInput = {
        status: CarStatus.AVAILABLE,
      };

      if (car.maintenanceIntervalMonths) {
        const nextMaintenanceDate = new Date();
        nextMaintenanceDate.setMonth(
          nextMaintenanceDate.getMonth() + car.maintenanceIntervalMonths,
        );
        updateData.nextMaintenanceDate = nextMaintenanceDate;
      }

      await this.prisma.car.update({
        where: { id: maintenance.carId },
        data: updateData,
      });
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: MaintenanceStatus.COMPLETED,
        externalCost: dto.externalCost ? new Prisma.Decimal(dto.externalCost) : undefined,
      },
    });
  }

  async getPendingRequests(): Promise<MaintenanceWithRelations[]> {
    return this.prisma.maintenanceRequest.findMany({
      where: { status: MaintenanceStatus.PENDING },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'asc' },
    });
  }

  async getPendingApprovalRequests(): Promise<MaintenanceWithRelations[]> {
    return this.prisma.maintenanceRequest.findMany({
      where: { status: MaintenanceStatus.PENDING_APPROVAL },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'asc' },
    });
  }

  async getActiveMaintenanceForCar(carId: string): Promise<MaintenanceRequest | null> {
    const activeMaintenanceStatuses: MaintenanceStatus[] = [
      MaintenanceStatus.PENDING,
      MaintenanceStatus.PENDING_APPROVAL,
      MaintenanceStatus.APPROVED,
      MaintenanceStatus.IN_PROGRESS,
    ];

    return this.prisma.maintenanceRequest.findFirst({
      where: {
        carId,
        status: { in: activeMaintenanceStatuses },
      },
    });
  }

  async getMaintenanceHistory(carId: string): Promise<MaintenanceWithRelations[]> {
    return this.prisma.maintenanceRequest.findMany({
      where: { carId },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMaintenanceSchedule(carId: string): Promise<{
    car: { id: string; model: string; licensePlate: string };
    nextMaintenanceDate: Date | null;
    maintenanceIntervalMonths: number | null;
    lastMaintenance: MaintenanceWithRelations | null;
    maintenanceHistory: MaintenanceWithRelations[];
  }> {
    const car = await this.prisma.car.findUnique({
      where: { id: carId },
      select: {
        id: true,
        model: true,
        licensePlate: true,
        nextMaintenanceDate: true,
        maintenanceIntervalMonths: true,
      },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }

    const maintenanceHistory = await this.getMaintenanceHistory(carId);
    const lastMaintenance =
      maintenanceHistory.find((m) => m.status === MaintenanceStatus.COMPLETED) || null;

    return {
      car: {
        id: car.id,
        model: car.model,
        licensePlate: car.licensePlate,
      },
      nextMaintenanceDate: car.nextMaintenanceDate,
      maintenanceIntervalMonths: car.maintenanceIntervalMonths,
      lastMaintenance,
      maintenanceHistory,
    };
  }

  async getCarsNeedingMaintenance(): Promise<
    {
      id: string;
      model: string;
      licensePlate: string;
      nextMaintenanceDate: Date;
      daysUntilDue: number;
    }[]
  > {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const cars = await this.prisma.car.findMany({
      where: {
        status: { not: CarStatus.DELETED },
        nextMaintenanceDate: {
          lte: thirtyDaysFromNow,
        },
      },
      select: {
        id: true,
        model: true,
        licensePlate: true,
        nextMaintenanceDate: true,
      },
      orderBy: { nextMaintenanceDate: 'asc' },
    });

    return cars
      .filter((car) => car.nextMaintenanceDate !== null)
      .map((car) => ({
        id: car.id,
        model: car.model,
        licensePlate: car.licensePlate,
        nextMaintenanceDate: car.nextMaintenanceDate!,
        daysUntilDue: Math.ceil(
          (car.nextMaintenanceDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        ),
      }));
  }

  private validateStateTransition(
    currentStatus: MaintenanceStatus,
    targetStatus: MaintenanceStatus,
  ): void {
    const allowedTransitions = STATE_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(targetStatus)) {
      throw new BadRequestException(`Cannot transition from ${currentStatus} to ${targetStatus}`);
    }
  }

  private getIncludeOptions() {
    return {
      car: {
        select: {
          id: true,
          model: true,
          licensePlate: true,
          type: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          fullName: true,
          department: true,
        },
      },
      triagedBy: {
        select: {
          id: true,
          fullName: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          fullName: true,
        },
      },
    };
  }
}
