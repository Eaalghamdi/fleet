import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateCarDto, UpdateCarDto, CarFilterDto } from './dto';
import { Car, CarStatus, Prisma } from '@prisma/client';

export interface CarWithHistory extends Car {
  carRequests?: {
    id: string;
    status: string;
    departureDatetime: Date;
    returnDatetime: Date;
  }[];
  maintenanceRequests?: {
    id: string;
    status: string;
    description: string;
    createdAt: Date;
  }[];
}

@Injectable()
export class CarsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: CarFilterDto): Promise<Car[]> {
    const where: Prisma.CarWhereInput = {
      status: { not: CarStatus.DELETED },
    };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.model) {
      where.model = { contains: filters.model, mode: 'insensitive' };
    }

    if (filters?.search) {
      where.OR = [
        { model: { contains: filters.search, mode: 'insensitive' } },
        { licensePlate: { contains: filters.search, mode: 'insensitive' } },
        { vin: { contains: filters.search, mode: 'insensitive' } },
        { color: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.car.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<CarWithHistory> {
    const car = await this.prisma.car.findUnique({
      where: { id },
      include: {
        carRequests: {
          select: {
            id: true,
            status: true,
            departureDatetime: true,
            returnDatetime: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        maintenanceRequests: {
          select: {
            id: true,
            status: true,
            description: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }

  async create(createCarDto: CreateCarDto): Promise<Car> {
    // Check for unique constraints
    await this.checkUniqueConstraints(createCarDto.licensePlate, createCarDto.vin);

    return this.prisma.car.create({
      data: {
        model: createCarDto.model,
        type: createCarDto.type,
        year: createCarDto.year,
        color: createCarDto.color,
        licensePlate: createCarDto.licensePlate,
        vin: createCarDto.vin,
        mileage: createCarDto.mileage ?? 0,
        warrantyExpiry: createCarDto.warrantyExpiry ? new Date(createCarDto.warrantyExpiry) : null,
        maintenanceIntervalMonths: createCarDto.maintenanceIntervalMonths,
        nextMaintenanceDate: createCarDto.nextMaintenanceDate
          ? new Date(createCarDto.nextMaintenanceDate)
          : null,
      },
    });
  }

  async update(id: string, updateCarDto: UpdateCarDto): Promise<Car> {
    const existingCar = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!existingCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    if (existingCar.status === CarStatus.DELETED) {
      throw new BadRequestException('Cannot update a deleted car');
    }

    // Check unique constraints if updating licensePlate or vin
    if (updateCarDto.licensePlate || updateCarDto.vin) {
      await this.checkUniqueConstraints(updateCarDto.licensePlate, updateCarDto.vin, id);
    }

    const data: Prisma.CarUpdateInput = {};

    if (updateCarDto.model !== undefined) data.model = updateCarDto.model;
    if (updateCarDto.type !== undefined) data.type = updateCarDto.type;
    if (updateCarDto.year !== undefined) data.year = updateCarDto.year;
    if (updateCarDto.color !== undefined) data.color = updateCarDto.color;
    if (updateCarDto.licensePlate !== undefined) data.licensePlate = updateCarDto.licensePlate;
    if (updateCarDto.vin !== undefined) data.vin = updateCarDto.vin;
    if (updateCarDto.mileage !== undefined) data.mileage = updateCarDto.mileage;
    if (updateCarDto.status !== undefined) data.status = updateCarDto.status;
    if (updateCarDto.maintenanceIntervalMonths !== undefined) {
      data.maintenanceIntervalMonths = updateCarDto.maintenanceIntervalMonths;
    }

    if (updateCarDto.warrantyExpiry !== undefined) {
      data.warrantyExpiry = updateCarDto.warrantyExpiry
        ? new Date(updateCarDto.warrantyExpiry)
        : null;
    }

    if (updateCarDto.nextMaintenanceDate !== undefined) {
      data.nextMaintenanceDate = updateCarDto.nextMaintenanceDate
        ? new Date(updateCarDto.nextMaintenanceDate)
        : null;
    }

    return this.prisma.car.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Car> {
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    if (car.status === CarStatus.DELETED) {
      throw new BadRequestException('Car is already deleted');
    }

    // Check if car has active requests or maintenance
    const activeRequests = await this.prisma.carRequest.count({
      where: {
        requestedCarId: id,
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
        carId: id,
        status: {
          in: ['PENDING', 'PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS'],
        },
      },
    });

    if (activeMaintenance > 0) {
      throw new BadRequestException(
        'Cannot delete car with active maintenance requests. Complete or cancel all maintenance first.',
      );
    }

    return this.prisma.car.update({
      where: { id },
      data: { status: CarStatus.DELETED },
    });
  }

  async checkAvailability(id: string): Promise<boolean> {
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car.status === CarStatus.AVAILABLE;
  }

  async getAvailableCars(): Promise<Car[]> {
    return this.prisma.car.findMany({
      where: { status: CarStatus.AVAILABLE },
      orderBy: { model: 'asc' },
    });
  }

  async updateStatus(id: string, status: CarStatus): Promise<Car> {
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    if (car.status === CarStatus.DELETED) {
      throw new BadRequestException('Cannot update status of a deleted car');
    }

    return this.prisma.car.update({
      where: { id },
      data: { status },
    });
  }

  async getCarsWithExpiringWarranty(daysAhead: number = 30): Promise<Car[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.prisma.car.findMany({
      where: {
        status: { not: CarStatus.DELETED },
        warrantyExpiry: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      orderBy: { warrantyExpiry: 'asc' },
    });
  }

  async getCarsNeedingMaintenance(): Promise<Car[]> {
    const today = new Date();

    return this.prisma.car.findMany({
      where: {
        status: { not: CarStatus.DELETED },
        nextMaintenanceDate: {
          lte: today,
        },
      },
      orderBy: { nextMaintenanceDate: 'asc' },
    });
  }

  private async checkUniqueConstraints(
    licensePlate?: string,
    vin?: string,
    excludeId?: string,
  ): Promise<void> {
    if (licensePlate) {
      const existingByPlate = await this.prisma.car.findUnique({
        where: { licensePlate },
      });
      if (existingByPlate && existingByPlate.id !== excludeId) {
        throw new ConflictException(`Car with license plate '${licensePlate}' already exists`);
      }
    }

    if (vin) {
      const existingByVin = await this.prisma.car.findUnique({
        where: { vin },
      });
      if (existingByVin && existingByVin.id !== excludeId) {
        throw new ConflictException(`Car with VIN '${vin}' already exists`);
      }
    }
  }
}
