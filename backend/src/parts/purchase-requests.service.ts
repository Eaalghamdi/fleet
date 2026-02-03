import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreatePurchaseRequestDto, PurchaseRequestFilterDto } from './dto';
import { PurchaseRequest, PurchaseRequestStatus, Prisma } from '@prisma/client';

export interface PurchaseRequestWithRelations extends PurchaseRequest {
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
export class PurchaseRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: PurchaseRequestFilterDto): Promise<PurchaseRequestWithRelations[]> {
    const where: Prisma.PurchaseRequestWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
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

    return this.prisma.purchaseRequest.findMany({
      where,
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<PurchaseRequestWithRelations> {
    const request = await this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: this.getIncludeOptions(),
    });

    if (!request) {
      throw new NotFoundException(`Purchase request with ID ${id} not found`);
    }

    return request;
  }

  async create(dto: CreatePurchaseRequestDto, userId: string): Promise<PurchaseRequest> {
    return this.prisma.purchaseRequest.create({
      data: {
        partName: dto.partName,
        quantity: dto.quantity,
        estimatedCost: new Prisma.Decimal(dto.estimatedCost),
        vendor: dto.vendor,
        createdById: userId,
      },
    });
  }

  async approve(id: string, userId: string): Promise<PurchaseRequest> {
    const request = await this.findOne(id);

    if (request.status !== PurchaseRequestStatus.PENDING_APPROVAL) {
      throw new BadRequestException(`Cannot approve request in ${request.status} status`);
    }

    return this.prisma.purchaseRequest.update({
      where: { id },
      data: {
        status: PurchaseRequestStatus.APPROVED,
        approvedById: userId,
      },
    });
  }

  async reject(id: string, userId: string): Promise<PurchaseRequest> {
    const request = await this.findOne(id);

    if (request.status !== PurchaseRequestStatus.PENDING_APPROVAL) {
      throw new BadRequestException(`Cannot reject request in ${request.status} status`);
    }

    return this.prisma.purchaseRequest.update({
      where: { id },
      data: {
        status: PurchaseRequestStatus.REJECTED,
        approvedById: userId,
      },
    });
  }

  async getPendingRequests(): Promise<PurchaseRequestWithRelations[]> {
    return this.prisma.purchaseRequest.findMany({
      where: { status: PurchaseRequestStatus.PENDING_APPROVAL },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'asc' },
    });
  }

  private getIncludeOptions() {
    return {
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
    };
  }
}
