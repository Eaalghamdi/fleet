import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MaintenanceService, MaintenanceWithRelations } from './maintenance.service';
import {
  CreateMaintenanceDto,
  TriageMaintenanceDto,
  CompleteMaintenanceDto,
  MaintenanceFilterDto,
} from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Departments } from '../auth/decorators/departments.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DepartmentsGuard } from '../auth/guards/departments.guard';
import { MaintenanceRequest, Department, Role } from '@prisma/client';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard, DepartmentsGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  // ==========================================
  // CRUD ENDPOINTS
  // ==========================================

  @Get()
  async findAll(@Query() filters: MaintenanceFilterDto): Promise<MaintenanceWithRelations[]> {
    return this.maintenanceService.findAll(filters);
  }

  @Get('pending')
  @Departments(Department.MAINTENANCE)
  async getPendingRequests(): Promise<MaintenanceWithRelations[]> {
    return this.maintenanceService.getPendingRequests();
  }

  @Get('pending-approval')
  @Departments(Department.ADMIN)
  async getPendingApprovalRequests(): Promise<MaintenanceWithRelations[]> {
    return this.maintenanceService.getPendingApprovalRequests();
  }

  @Get('cars-needing-maintenance')
  @Departments(Department.GARAGE, Department.MAINTENANCE, Department.ADMIN)
  async getCarsNeedingMaintenance(): Promise<
    {
      id: string;
      model: string;
      licensePlate: string;
      nextMaintenanceDate: Date;
      daysUntilDue: number;
    }[]
  > {
    return this.maintenanceService.getCarsNeedingMaintenance();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MaintenanceWithRelations> {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  @Departments(Department.GARAGE)
  async create(
    @Body() dto: CreateMaintenanceDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.create(dto, user.id);
  }

  // ==========================================
  // WORKFLOW ENDPOINTS
  // ==========================================

  @Post(':id/triage')
  @Departments(Department.MAINTENANCE)
  @HttpCode(HttpStatus.OK)
  async triage(
    @Param('id') id: string,
    @Body() dto: TriageMaintenanceDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.triage(id, dto, user.id);
  }

  @Post(':id/approve')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.approve(id, user.id);
  }

  @Post(':id/reject')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.reject(id, user.id);
  }

  @Post(':id/start')
  @Departments(Department.MAINTENANCE)
  @HttpCode(HttpStatus.OK)
  async startWork(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.startWork(id, user.id);
  }

  @Post(':id/complete')
  @Departments(Department.MAINTENANCE)
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteMaintenanceDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.complete(id, dto, user.id);
  }

  // ==========================================
  // CAR-SPECIFIC ENDPOINTS
  // ==========================================

  @Get('car/:carId/history')
  async getMaintenanceHistory(@Param('carId') carId: string): Promise<MaintenanceWithRelations[]> {
    return this.maintenanceService.getMaintenanceHistory(carId);
  }

  @Get('car/:carId/schedule')
  async getMaintenanceSchedule(@Param('carId') carId: string): Promise<{
    car: { id: string; model: string; licensePlate: string };
    nextMaintenanceDate: Date | null;
    maintenanceIntervalMonths: number | null;
    lastMaintenance: MaintenanceWithRelations | null;
    maintenanceHistory: MaintenanceWithRelations[];
  }> {
    return this.maintenanceService.getMaintenanceSchedule(carId);
  }

  @Get('car/:carId/active')
  async getActiveMaintenanceForCar(
    @Param('carId') carId: string,
  ): Promise<MaintenanceRequest | null> {
    return this.maintenanceService.getActiveMaintenanceForCar(carId);
  }
}
