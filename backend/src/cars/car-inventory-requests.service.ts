import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateCarInventoryRequestDto } from './dto';
import {
  CarInventoryRequest,
  CarInventoryRequestStatus,
  CarInventoryRequestType,
  CarStatus,
} from '@prisma/client';

export interface CarInventoryRequestWithRelations extends CarInventoryRequest {
  car?: {
    id: string;
    model: string;
    licensePlate: string;
  } | null;
  createdBy: {
    id: string;
    fullName: string;
    department: string;
  };
  approvedBy?: {
    id: string;
    fullName: string;
  } | null;
}

@Injectable()
export class CarInventoryRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: CarInventoryRequestStatus): Promise<CarInventoryRequestWithRelations[]> {
    return this.prisma.carInventoryRequest.findMany({
      where: status ? { status } : undefined,
      include: {
        car: {
          select: {
            id: true,
            model: true,
            licensePlate: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            department: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPending(): Promise<CarInventoryRequestWithRelations[]> {
    return this.findAll(CarInventoryRequestStatus.PENDING_APPROVAL);
  }

  async findOne(id: string): Promise<CarInventoryRequestWithRelations> {
    const request = await this.prisma.carInventoryRequest.findUnique({
      where: { id },
      include: {
        car: {
          select: {
            id: true,
            model: true,
            licensePlate: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            department: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Car inventory request with ID ${id} not found`);
    }

    return request;
  }

  async createAddRequest(
    dto: CreateCarInventoryRequestDto,
    userId: string,
  ): Promise<CarInventoryRequest> {
    if (dto.type !== CarInventoryRequestType.ADD) {
      throw new BadRequestException('This endpoint is for ADD requests only');
    }

    // Check for unique constraints
    await this.checkUniqueConstraints(dto.licensePlate, dto.vin);

    const carData = {
      model: dto.model,
      type: dto.carType,
      year: dto.year,
      color: dto.color,
      licensePlate: dto.licensePlate,
      vin: dto.vin,
      mileage: dto.mileage ?? 0,
      warrantyExpiry: dto.warrantyExpiry,
      maintenanceIntervalMonths: dto.maintenanceIntervalMonths,
      nextMaintenanceDate: dto.nextMaintenanceDate,
    };

    return this.prisma.carInventoryRequest.create({
      data: {
        type: CarInventoryRequestType.ADD,
        carData,
        createdById: userId,
      },
    });
  }

  async createDeleteRequest(carId: string, userId: string): Promise<CarInventoryRequest> {
    // Verify car exists and is not already deleted
    const car = await this.prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }

    if (car.status === CarStatus.DELETED) {
      throw new BadRequestException('Car is already deleted');
    }

    // Check for existing pending delete request
    const existingRequest = await this.prisma.carInventoryRequest.findFirst({
      where: {
        carId,
        type: CarInventoryRequestType.DELETE,
        status: CarInventoryRequestStatus.PENDING_APPROVAL,
      },
    });

    if (existingRequest) {
      throw new ConflictException('A pending delete request already exists for this car');
    }

    return this.prisma.carInventoryRequest.create({
      data: {
        type: CarInventoryRequestType.DELETE,
        carId,
        createdById: userId,
      },
    });
  }

  async approve(id: string, adminId: string): Promise<CarInventoryRequest> {
    const request = await this.prisma.carInventoryRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Car inventory request with ID ${id} not found`);
    }

    if (request.status !== CarInventoryRequestStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        `Request is not pending approval. Current status: ${request.status}`,
      );
    }

    // Handle based on request type
    if (request.type === CarInventoryRequestType.ADD) {
      return this.approveAddRequest(request, adminId);
    } else {
      return this.approveDeleteRequest(request, adminId);
    }
  }

  async reject(id: string, adminId: string): Promise<CarInventoryRequest> {
    const request = await this.prisma.carInventoryRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Car inventory request with ID ${id} not found`);
    }

    if (request.status !== CarInventoryRequestStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        `Request is not pending approval. Current status: ${request.status}`,
      );
    }

    return this.prisma.carInventoryRequest.update({
      where: { id },
      data: {
        status: CarInventoryRequestStatus.REJECTED,
        approvedById: adminId,
      },
    });
  }

  private async approveAddRequest(
    request: CarInventoryRequest,
    adminId: string,
  ): Promise<CarInventoryRequest> {
    const carData = request.carData as {
      model: string;
      type: string;
      year: number;
      color: string;
      licensePlate: string;
      vin: string;
      mileage?: number;
      warrantyExpiry?: string;
      maintenanceIntervalMonths?: number;
      nextMaintenanceDate?: string;
    };

    // Check unique constraints again before creating
    await this.checkUniqueConstraints(carData.licensePlate, carData.vin);

    // Use transaction to create car and update request
    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.carInventoryRequest.update({
        where: { id: request.id },
        data: {
          status: CarInventoryRequestStatus.APPROVED,
          approvedById: adminId,
        },
      }),
      this.prisma.car.create({
        data: {
          model: carData.model,
          type: carData.type as 'SEDAN' | 'SUV' | 'TRUCK',
          year: carData.year,
          color: carData.color,
          licensePlate: carData.licensePlate,
          vin: carData.vin,
          mileage: carData.mileage ?? 0,
          warrantyExpiry: carData.warrantyExpiry ? new Date(carData.warrantyExpiry) : null,
          maintenanceIntervalMonths: carData.maintenanceIntervalMonths,
          nextMaintenanceDate: carData.nextMaintenanceDate
            ? new Date(carData.nextMaintenanceDate)
            : null,
        },
      }),
    ]);

    return updatedRequest;
  }

  private async approveDeleteRequest(
    request: CarInventoryRequest,
    adminId: string,
  ): Promise<CarInventoryRequest> {
    if (!request.carId) {
      throw new BadRequestException('Delete request has no car ID');
    }

    // Check if car has active requests or maintenance
    const activeRequests = await this.prisma.carRequest.count({
      where: {
        requestedCarId: request.carId,
        status: {
          in: ['PENDING', 'ASSIGNED', 'APPROVED', 'IN_TRANSIT'],
        },
      },
    });

    if (activeRequests > 0) {
      throw new BadRequestException(
        'Cannot delete car with active requests. Complete or cancel all requests first.',
      );
    }

    const activeMaintenance = await this.prisma.maintenanceRequest.count({
      where: {
        carId: request.carId,
        status: {
          in: ['PENDING', 'PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS'],
        },
      },
    });

    if (activeMaintenance > 0) {
      throw new BadRequestException('Cannot delete car with active maintenance requests.');
    }

    // Use transaction to soft-delete car and update request
    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.carInventoryRequest.update({
        where: { id: request.id },
        data: {
          status: CarInventoryRequestStatus.APPROVED,
          approvedById: adminId,
        },
      }),
      this.prisma.car.update({
        where: { id: request.carId },
        data: { status: CarStatus.DELETED },
      }),
    ]);

    return updatedRequest;
  }

  private async checkUniqueConstraints(licensePlate?: string, vin?: string): Promise<void> {
    if (licensePlate) {
      const existingByPlate = await this.prisma.car.findUnique({
        where: { licensePlate },
      });
      if (existingByPlate) {
        throw new ConflictException(`Car with license plate '${licensePlate}' already exists`);
      }

      // Also check pending add requests
      const pendingRequest = await this.prisma.carInventoryRequest.findFirst({
        where: {
          type: CarInventoryRequestType.ADD,
          status: CarInventoryRequestStatus.PENDING_APPROVAL,
          carData: {
            path: ['licensePlate'],
            equals: licensePlate,
          },
        },
      });
      if (pendingRequest) {
        throw new ConflictException(
          `A pending add request already exists for license plate '${licensePlate}'`,
        );
      }
    }

    if (vin) {
      const existingByVin = await this.prisma.car.findUnique({
        where: { vin },
      });
      if (existingByVin) {
        throw new ConflictException(`Car with VIN '${vin}' already exists`);
      }

      // Also check pending add requests
      const pendingRequest = await this.prisma.carInventoryRequest.findFirst({
        where: {
          type: CarInventoryRequestType.ADD,
          status: CarInventoryRequestStatus.PENDING_APPROVAL,
          carData: {
            path: ['vin'],
            equals: vin,
          },
        },
      });
      if (pendingRequest) {
        throw new ConflictException(`A pending add request already exists for VIN '${vin}'`);
      }
    }
  }
}
