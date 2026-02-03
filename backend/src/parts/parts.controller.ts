import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PartsService } from './parts.service';
import { PurchaseRequestsService, PurchaseRequestWithRelations } from './purchase-requests.service';
import {
  MaintenancePartsService,
  MaintenancePartUsageWithRelations,
} from './maintenance-parts.service';
import {
  CreatePartDto,
  UpdatePartDto,
  PartFilterDto,
  CreatePurchaseRequestDto,
  PurchaseRequestFilterDto,
  AssignPartDto,
} from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Departments } from '../auth/decorators/departments.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DepartmentsGuard } from '../auth/guards/departments.guard';
import { Part, PurchaseRequest, MaintenancePartUsage, Department, Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, DepartmentsGuard)
export class PartsController {
  constructor(
    private readonly partsService: PartsService,
    private readonly purchaseRequestsService: PurchaseRequestsService,
    private readonly maintenancePartsService: MaintenancePartsService,
  ) {}

  // ==========================================
  // PARTS INVENTORY ENDPOINTS
  // ==========================================

  @Get('parts')
  async findAllParts(@Query() filters: PartFilterDto): Promise<Part[]> {
    return this.partsService.findAll(filters);
  }

  @Get('parts/low-stock')
  @Departments(Department.GARAGE, Department.ADMIN)
  async getLowStockParts(@Query('threshold') threshold?: string): Promise<Part[]> {
    const thresholdValue = threshold ? parseInt(threshold, 10) : 5;
    return this.partsService.getLowStockParts(thresholdValue);
  }

  @Get('parts/:id')
  async findOnePart(@Param('id') id: string): Promise<Part> {
    return this.partsService.findOne(id);
  }

  @Get('parts/:id/usage-history')
  async getPartUsageHistory(@Param('id') id: string): Promise<MaintenancePartUsageWithRelations[]> {
    return this.maintenancePartsService.getPartUsageHistory(id);
  }

  @Post('parts')
  @Departments(Department.GARAGE)
  async createPart(@Body() dto: CreatePartDto): Promise<Part> {
    return this.partsService.create(dto);
  }

  @Patch('parts/:id')
  @Departments(Department.GARAGE)
  async updatePart(@Param('id') id: string, @Body() dto: UpdatePartDto): Promise<Part> {
    return this.partsService.update(id, dto);
  }

  @Delete('parts/:id')
  @Departments(Department.GARAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePart(@Param('id') id: string): Promise<void> {
    await this.partsService.softDelete(id);
  }

  // ==========================================
  // PURCHASE REQUEST ENDPOINTS
  // ==========================================

  @Get('purchase-requests')
  async findAllPurchaseRequests(
    @Query() filters: PurchaseRequestFilterDto,
  ): Promise<PurchaseRequestWithRelations[]> {
    return this.purchaseRequestsService.findAll(filters);
  }

  @Get('purchase-requests/pending')
  @Departments(Department.ADMIN)
  async getPendingPurchaseRequests(): Promise<PurchaseRequestWithRelations[]> {
    return this.purchaseRequestsService.getPendingRequests();
  }

  @Get('purchase-requests/:id')
  async findOnePurchaseRequest(@Param('id') id: string): Promise<PurchaseRequestWithRelations> {
    return this.purchaseRequestsService.findOne(id);
  }

  @Post('purchase-requests')
  @Departments(Department.GARAGE)
  async createPurchaseRequest(
    @Body() dto: CreatePurchaseRequestDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<PurchaseRequest> {
    return this.purchaseRequestsService.create(dto, user.id);
  }

  @Post('purchase-requests/:id/approve')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async approvePurchaseRequest(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<PurchaseRequest> {
    return this.purchaseRequestsService.approve(id, user.id);
  }

  @Post('purchase-requests/:id/reject')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async rejectPurchaseRequest(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<PurchaseRequest> {
    return this.purchaseRequestsService.reject(id, user.id);
  }

  // ==========================================
  // MAINTENANCE PARTS ENDPOINTS
  // ==========================================

  @Get('maintenance/:maintenanceId/parts')
  async getMaintenanceParts(
    @Param('maintenanceId') maintenanceId: string,
  ): Promise<MaintenancePartUsageWithRelations[]> {
    return this.maintenancePartsService.getPartsForMaintenance(maintenanceId);
  }

  @Post('maintenance/:maintenanceId/parts')
  @Departments(Department.GARAGE)
  async assignPart(
    @Param('maintenanceId') maintenanceId: string,
    @Body() dto: AssignPartDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<MaintenancePartUsage> {
    return this.maintenancePartsService.assignPart(maintenanceId, dto, user.id);
  }

  @Delete('maintenance/parts/:usageId')
  @Departments(Department.GARAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePartAssignment(
    @Param('usageId') usageId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<void> {
    await this.maintenancePartsService.removePartAssignment(usageId, user.id);
  }
}
