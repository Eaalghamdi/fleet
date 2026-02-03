import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreatePartDto, UpdatePartDto, PartFilterDto } from './dto';
import { Part, TrackingMode, Prisma } from '@prisma/client';

@Injectable()
export class PartsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: PartFilterDto): Promise<Part[]> {
    const where: Prisma.PartWhereInput = {
      isDeleted: false,
    };

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { carModel: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.carType) {
      where.carType = filters.carType;
    }

    if (filters?.carModel) {
      where.carModel = { contains: filters.carModel, mode: 'insensitive' };
    }

    if (filters?.trackingMode) {
      where.trackingMode = filters.trackingMode;
    }

    return this.prisma.part.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Part> {
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!part || part.isDeleted) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    return part;
  }

  async create(dto: CreatePartDto): Promise<Part> {
    // Validate based on tracking mode
    if (dto.trackingMode === TrackingMode.QUANTITY) {
      if (dto.quantity === undefined || dto.quantity < 0) {
        throw new BadRequestException('Quantity is required for quantity-based tracking');
      }
      if (dto.serialNumber) {
        throw new BadRequestException(
          'Serial number should not be provided for quantity-based tracking',
        );
      }
    } else if (dto.trackingMode === TrackingMode.SERIAL_NUMBER) {
      if (!dto.serialNumber) {
        throw new BadRequestException('Serial number is required for serial-number-based tracking');
      }
      if (dto.quantity !== undefined && dto.quantity !== 1) {
        throw new BadRequestException('Quantity must be 1 for serial-number-based tracking');
      }

      // Check if serial number already exists
      const existingPart = await this.prisma.part.findUnique({
        where: { serialNumber: dto.serialNumber },
      });

      if (existingPart) {
        throw new ConflictException(`Part with serial number ${dto.serialNumber} already exists`);
      }
    }

    return this.prisma.part.create({
      data: {
        name: dto.name,
        carType: dto.carType,
        carModel: dto.carModel,
        trackingMode: dto.trackingMode,
        quantity: dto.trackingMode === TrackingMode.QUANTITY ? dto.quantity : 1,
        serialNumber: dto.trackingMode === TrackingMode.SERIAL_NUMBER ? dto.serialNumber : null,
      },
    });
  }

  async update(id: string, dto: UpdatePartDto): Promise<Part> {
    const part = await this.findOne(id);

    const data: Prisma.PartUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.carModel !== undefined) {
      data.carModel = dto.carModel;
    }

    if (dto.quantity !== undefined) {
      if (part.trackingMode !== TrackingMode.QUANTITY) {
        throw new BadRequestException('Cannot update quantity for serial-number-based parts');
      }
      if (dto.quantity < 0) {
        throw new BadRequestException('Quantity cannot be negative');
      }
      data.quantity = dto.quantity;
    }

    return this.prisma.part.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Part> {
    await this.findOne(id);

    return this.prisma.part.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async adjustQuantity(id: string, adjustment: number): Promise<Part> {
    const part = await this.findOne(id);

    if (part.trackingMode !== TrackingMode.QUANTITY) {
      throw new BadRequestException('Cannot adjust quantity for serial-number-based parts');
    }

    const newQuantity = (part.quantity || 0) + adjustment;

    if (newQuantity < 0) {
      throw new BadRequestException('Insufficient quantity in stock');
    }

    return this.prisma.part.update({
      where: { id },
      data: { quantity: newQuantity },
    });
  }

  async getPartsByCarType(carType: string): Promise<Part[]> {
    return this.prisma.part.findMany({
      where: {
        carType: carType as Prisma.EnumCarTypeFilter['equals'],
        isDeleted: false,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getLowStockParts(threshold: number = 5): Promise<Part[]> {
    return this.prisma.part.findMany({
      where: {
        trackingMode: TrackingMode.QUANTITY,
        quantity: { lte: threshold },
        isDeleted: false,
      },
      orderBy: { quantity: 'asc' },
    });
  }
}
