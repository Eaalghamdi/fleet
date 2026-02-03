import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { AssignPartDto } from './dto';
import { PartsService } from './parts.service';
import { MaintenancePartUsage, MaintenanceStatus, TrackingMode } from '@prisma/client';

export interface MaintenancePartUsageWithRelations extends MaintenancePartUsage {
  part: {
    id: string;
    name: string;
    carType: string;
    carModel: string;
    trackingMode: string;
    serialNumber: string | null;
  };
  assignedBy: {
    id: string;
    fullName: string;
  };
}

@Injectable()
export class MaintenancePartsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partsService: PartsService,
  ) {}

  async assignPart(
    maintenanceId: string,
    dto: AssignPartDto,
    userId: string,
  ): Promise<MaintenancePartUsage> {
    // Verify maintenance request exists and is in progress
    const maintenance = await this.prisma.maintenanceRequest.findUnique({
      where: { id: maintenanceId },
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance request with ID ${maintenanceId} not found`);
    }

    if (maintenance.status !== MaintenanceStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Can only assign parts to maintenance requests that are in progress',
      );
    }

    // Verify part exists
    const part = await this.partsService.findOne(dto.partId);

    // Determine quantity to use
    const quantityToUse = dto.quantity || 1;

    // For serial-number tracked parts, quantity must be 1
    if (part.trackingMode === TrackingMode.SERIAL_NUMBER && quantityToUse !== 1) {
      throw new BadRequestException(
        'Serial-number tracked parts can only be assigned one at a time',
      );
    }

    // Check if serial-number part is already assigned
    if (part.trackingMode === TrackingMode.SERIAL_NUMBER) {
      const existingUsage = await this.prisma.maintenancePartUsage.findFirst({
        where: { partId: dto.partId },
      });

      if (existingUsage) {
        throw new BadRequestException(
          'This serial-number tracked part is already assigned to a maintenance request',
        );
      }
    }

    // Deduct from inventory for quantity-tracked parts
    if (part.trackingMode === TrackingMode.QUANTITY) {
      await this.partsService.adjustQuantity(dto.partId, -quantityToUse);
    }

    // Create the usage record
    return this.prisma.maintenancePartUsage.create({
      data: {
        maintenanceRequestId: maintenanceId,
        partId: dto.partId,
        quantityUsed: quantityToUse,
        assignedById: userId,
      },
    });
  }

  async getPartsForMaintenance(
    maintenanceId: string,
  ): Promise<MaintenancePartUsageWithRelations[]> {
    // Verify maintenance exists
    const maintenance = await this.prisma.maintenanceRequest.findUnique({
      where: { id: maintenanceId },
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance request with ID ${maintenanceId} not found`);
    }

    return this.prisma.maintenancePartUsage.findMany({
      where: { maintenanceRequestId: maintenanceId },
      include: {
        part: {
          select: {
            id: true,
            name: true,
            carType: true,
            carModel: true,
            trackingMode: true,
            serialNumber: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async removePartAssignment(usageId: string, _userId: string): Promise<void> {
    const usage = await this.prisma.maintenancePartUsage.findUnique({
      where: { id: usageId },
      include: {
        maintenanceRequest: true,
        part: true,
      },
    });

    if (!usage) {
      throw new NotFoundException(`Part usage record with ID ${usageId} not found`);
    }

    // Can only remove parts from in-progress maintenance
    if (usage.maintenanceRequest.status !== MaintenanceStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Can only remove parts from maintenance requests that are in progress',
      );
    }

    // Return quantity to inventory for quantity-tracked parts
    if (usage.part.trackingMode === TrackingMode.QUANTITY) {
      await this.partsService.adjustQuantity(usage.partId, usage.quantityUsed);
    }

    // Delete the usage record
    await this.prisma.maintenancePartUsage.delete({
      where: { id: usageId },
    });
  }

  async getPartUsageHistory(partId: string): Promise<MaintenancePartUsageWithRelations[]> {
    // Verify part exists
    await this.partsService.findOne(partId);

    return this.prisma.maintenancePartUsage.findMany({
      where: { partId },
      include: {
        part: {
          select: {
            id: true,
            name: true,
            carType: true,
            carModel: true,
            trackingMode: true,
            serialNumber: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }
}
