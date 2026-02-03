import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  CreateCarRequestDto,
  UpdateCarRequestDto,
  AssignCarDto,
  ReturnCarDto,
  CarRequestFilterDto,
} from './dto';
import { CarRequest, CarRequestStatus, CarStatus, Prisma } from '@prisma/client';

export interface CarRequestWithRelations extends CarRequest {
  requestedCar?: {
    id: string;
    model: string;
    licensePlate: string;
    type: string;
  } | null;
  rentalCompany?: {
    id: string;
    name: string;
  } | null;
  createdBy: {
    id: string;
    fullName: string;
    department: string;
  };
  assignedBy?: {
    id: string;
    fullName: string;
  } | null;
  approvedBy?: {
    id: string;
    fullName: string;
  } | null;
  images?: {
    id: string;
    filePath: string;
    originalFilename: string;
  }[];
}

// Valid state transitions for car requests
const STATE_TRANSITIONS: Record<CarRequestStatus, CarRequestStatus[]> = {
  [CarRequestStatus.PENDING]: [CarRequestStatus.ASSIGNED, CarRequestStatus.CANCELLED],
  [CarRequestStatus.ASSIGNED]: [
    CarRequestStatus.APPROVED,
    CarRequestStatus.REJECTED,
    CarRequestStatus.CANCELLED,
  ],
  [CarRequestStatus.APPROVED]: [CarRequestStatus.IN_TRANSIT, CarRequestStatus.CANCELLED],
  [CarRequestStatus.REJECTED]: [],
  [CarRequestStatus.IN_TRANSIT]: [CarRequestStatus.RETURNED],
  [CarRequestStatus.RETURNED]: [],
  [CarRequestStatus.CANCELLED]: [],
};

@Injectable()
export class CarRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: CarRequestFilterDto): Promise<CarRequestWithRelations[]> {
    const where: Prisma.CarRequestWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.carType) {
      where.requestedCarType = filters.carType;
    }

    if (filters?.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters?.fromDate || filters?.toDate) {
      where.departureDatetime = {};
      if (filters?.fromDate) {
        where.departureDatetime.gte = new Date(filters.fromDate);
      }
      if (filters?.toDate) {
        where.departureDatetime.lte = new Date(filters.toDate);
      }
    }

    return this.prisma.carRequest.findMany({
      where,
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<CarRequestWithRelations> {
    const request = await this.prisma.carRequest.findUnique({
      where: { id },
      include: this.getIncludeOptions(),
    });

    if (!request) {
      throw new NotFoundException(`Car request with ID ${id} not found`);
    }

    return request;
  }

  async create(dto: CreateCarRequestDto, userId: string): Promise<CarRequest> {
    // Validate dates
    const departure = new Date(dto.departureDatetime);
    const returnDate = new Date(dto.returnDatetime);

    if (departure >= returnDate) {
      throw new BadRequestException('Return datetime must be after departure datetime');
    }

    if (departure < new Date()) {
      throw new BadRequestException('Departure datetime cannot be in the past');
    }

    // If a specific car is requested, verify it exists and is available
    if (dto.requestedCarId) {
      await this.verifyCarAvailable(dto.requestedCarId);
    }

    return this.prisma.carRequest.create({
      data: {
        requestedCarType: dto.requestedCarType,
        requestedCarId: dto.requestedCarId,
        departureLocation: dto.departureLocation,
        destination: dto.destination,
        departureDatetime: departure,
        returnDatetime: returnDate,
        description: dto.description,
        createdById: userId,
      },
    });
  }

  async update(id: string, dto: UpdateCarRequestDto, userId: string): Promise<CarRequest> {
    const request = await this.findOne(id);

    // Only allow updates in PENDING status
    if (request.status !== CarRequestStatus.PENDING) {
      throw new BadRequestException('Can only update requests in PENDING status');
    }

    // Only the creator can update
    if (request.createdById !== userId) {
      throw new BadRequestException('Only the request creator can update the request');
    }

    const data: Prisma.CarRequestUpdateInput = {};

    if (dto.requestedCarType !== undefined) {
      data.requestedCarType = dto.requestedCarType;
    }
    if (dto.departureLocation !== undefined) {
      data.departureLocation = dto.departureLocation;
    }
    if (dto.destination !== undefined) {
      data.destination = dto.destination;
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }

    if (dto.departureDatetime !== undefined || dto.returnDatetime !== undefined) {
      const departure = dto.departureDatetime
        ? new Date(dto.departureDatetime)
        : request.departureDatetime;
      const returnDate = dto.returnDatetime ? new Date(dto.returnDatetime) : request.returnDatetime;

      if (departure >= returnDate) {
        throw new BadRequestException('Return datetime must be after departure datetime');
      }

      if (dto.departureDatetime) {
        data.departureDatetime = departure;
      }
      if (dto.returnDatetime) {
        data.returnDatetime = returnDate;
      }
    }

    if (dto.requestedCarId !== undefined) {
      if (dto.requestedCarId) {
        await this.verifyCarAvailable(dto.requestedCarId);
      }
      data.requestedCar = dto.requestedCarId
        ? { connect: { id: dto.requestedCarId } }
        : { disconnect: true };
    }

    return this.prisma.carRequest.update({
      where: { id },
      data,
    });
  }

  async cancel(id: string, userId: string): Promise<CarRequest> {
    const request = await this.findOne(id);

    // Only allow cancellation in certain statuses
    const cancellableStatuses: CarRequestStatus[] = [
      CarRequestStatus.PENDING,
      CarRequestStatus.ASSIGNED,
      CarRequestStatus.APPROVED,
    ];

    if (!cancellableStatuses.includes(request.status)) {
      throw new BadRequestException(`Cannot cancel request in ${request.status} status`);
    }

    // Only the creator can cancel
    if (request.createdById !== userId) {
      throw new BadRequestException('Only the request creator can cancel the request');
    }

    // Release the car if one was assigned
    if (request.requestedCarId && !request.isRental) {
      await this.releaseCarIfAssigned(request.requestedCarId);
    }

    return this.prisma.carRequest.update({
      where: { id },
      data: {
        status: CarRequestStatus.CANCELLED,
        cancelledById: userId,
      },
    });
  }

  async assign(id: string, dto: AssignCarDto, userId: string): Promise<CarRequest> {
    const request = await this.findOne(id);

    this.validateStateTransition(request.status, CarRequestStatus.ASSIGNED);

    if (dto.isRental) {
      // Rental car assignment
      if (!dto.rentalCompanyId) {
        throw new BadRequestException('Rental company ID is required for rental assignments');
      }

      // Verify rental company exists
      const rentalCompany = await this.prisma.rentalCompany.findUnique({
        where: { id: dto.rentalCompanyId },
      });

      if (!rentalCompany || !rentalCompany.isActive) {
        throw new NotFoundException('Rental company not found or inactive');
      }

      return this.prisma.carRequest.update({
        where: { id },
        data: {
          status: CarRequestStatus.ASSIGNED,
          isRental: true,
          rentalCompanyId: dto.rentalCompanyId,
          requestedCarId: null,
          assignedById: userId,
        },
      });
    } else {
      // Company car assignment
      if (!dto.carId) {
        throw new BadRequestException('Car ID is required for company car assignments');
      }

      // Verify car is available
      await this.verifyCarAvailable(dto.carId);

      // Update car status to ASSIGNED
      await this.prisma.car.update({
        where: { id: dto.carId },
        data: { status: CarStatus.ASSIGNED },
      });

      return this.prisma.carRequest.update({
        where: { id },
        data: {
          status: CarRequestStatus.ASSIGNED,
          isRental: false,
          requestedCarId: dto.carId,
          rentalCompanyId: null,
          assignedById: userId,
        },
      });
    }
  }

  async approve(id: string, userId: string): Promise<CarRequest> {
    const request = await this.findOne(id);

    this.validateStateTransition(request.status, CarRequestStatus.APPROVED);

    return this.prisma.carRequest.update({
      where: { id },
      data: {
        status: CarRequestStatus.APPROVED,
        approvedById: userId,
      },
    });
  }

  async reject(id: string, userId: string): Promise<CarRequest> {
    const request = await this.findOne(id);

    this.validateStateTransition(request.status, CarRequestStatus.REJECTED);

    // Release the car if one was assigned
    if (request.requestedCarId && !request.isRental) {
      await this.releaseCarIfAssigned(request.requestedCarId);
    }

    return this.prisma.carRequest.update({
      where: { id },
      data: {
        status: CarRequestStatus.REJECTED,
        approvedById: userId,
      },
    });
  }

  async markInTransit(id: string, userId: string): Promise<CarRequest> {
    const request = await this.findOne(id);

    this.validateStateTransition(request.status, CarRequestStatus.IN_TRANSIT);

    // Only the creator can mark as in transit
    if (request.createdById !== userId) {
      throw new BadRequestException('Only the request creator can mark as in transit');
    }

    // Update car status if company car
    if (request.requestedCarId && !request.isRental) {
      await this.prisma.car.update({
        where: { id: request.requestedCarId },
        data: { status: CarStatus.IN_TRANSIT },
      });
    }

    return this.prisma.carRequest.update({
      where: { id },
      data: {
        status: CarRequestStatus.IN_TRANSIT,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async confirmReturn(id: string, dto: ReturnCarDto, _userId: string): Promise<CarRequest> {
    const request = await this.findOne(id);

    this.validateStateTransition(request.status, CarRequestStatus.RETURNED);

    // Update car status and mileage if company car
    if (request.requestedCarId && !request.isRental) {
      const updateData: Prisma.CarUpdateInput = {
        status: CarStatus.AVAILABLE,
      };

      if (dto.currentMileage !== undefined) {
        updateData.mileage = dto.currentMileage;
      }

      await this.prisma.car.update({
        where: { id: request.requestedCarId },
        data: updateData,
      });
    }

    return this.prisma.carRequest.update({
      where: { id },
      data: {
        status: CarRequestStatus.RETURNED,
        returnConditionNotes: dto.returnConditionNotes,
      },
    });
  }

  async getRequestsByUser(userId: string): Promise<CarRequestWithRelations[]> {
    return this.prisma.carRequest.findMany({
      where: { createdById: userId },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingRequests(): Promise<CarRequestWithRelations[]> {
    return this.prisma.carRequest.findMany({
      where: { status: CarRequestStatus.PENDING },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'asc' },
    });
  }

  async getAssignedRequests(): Promise<CarRequestWithRelations[]> {
    return this.prisma.carRequest.findMany({
      where: { status: CarRequestStatus.ASSIGNED },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'asc' },
    });
  }

  async getActiveRequestsForCar(carId: string): Promise<CarRequest[]> {
    return this.prisma.carRequest.findMany({
      where: {
        requestedCarId: carId,
        status: {
          in: [
            CarRequestStatus.PENDING,
            CarRequestStatus.ASSIGNED,
            CarRequestStatus.APPROVED,
            CarRequestStatus.IN_TRANSIT,
          ],
        },
      },
    });
  }

  private validateStateTransition(
    currentStatus: CarRequestStatus,
    targetStatus: CarRequestStatus,
  ): void {
    const allowedTransitions = STATE_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(targetStatus)) {
      throw new BadRequestException(`Cannot transition from ${currentStatus} to ${targetStatus}`);
    }
  }

  private async verifyCarAvailable(carId: string): Promise<void> {
    const car = await this.prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }

    if (car.status !== CarStatus.AVAILABLE) {
      throw new ConflictException(`Car is not available. Current status: ${car.status}`);
    }

    // Check for active requests on this car
    const activeRequests = await this.getActiveRequestsForCar(carId);
    if (activeRequests.length > 0) {
      throw new ConflictException('Car has an active request and cannot be assigned');
    }
  }

  private async releaseCarIfAssigned(carId: string): Promise<void> {
    const car = await this.prisma.car.findUnique({
      where: { id: carId },
    });

    if (car && car.status !== CarStatus.AVAILABLE && car.status !== CarStatus.DELETED) {
      await this.prisma.car.update({
        where: { id: carId },
        data: { status: CarStatus.AVAILABLE },
      });
    }
  }

  private getIncludeOptions() {
    return {
      requestedCar: {
        select: {
          id: true,
          model: true,
          licensePlate: true,
          type: true,
        },
      },
      rentalCompany: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          fullName: true,
          department: true,
        },
      },
      assignedBy: {
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
      images: {
        select: {
          id: true,
          filePath: true,
          originalFilename: true,
        },
      },
    };
  }
}
