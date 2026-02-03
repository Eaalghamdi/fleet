import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CarsService, CarWithHistory } from './cars.service';
import {
  CarInventoryRequestsService,
  CarInventoryRequestWithRelations,
} from './car-inventory-requests.service';
import { UpdateCarDto, CarFilterDto, CreateCarInventoryRequestDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Departments } from '../auth/decorators/departments.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DepartmentsGuard } from '../auth/guards/departments.guard';
import {
  Car,
  CarInventoryRequest,
  CarInventoryRequestStatus,
  CarInventoryRequestType,
  Department,
  Role,
} from '@prisma/client';

@Controller('cars')
@UseGuards(JwtAuthGuard, RolesGuard, DepartmentsGuard)
export class CarsController {
  constructor(
    private readonly carsService: CarsService,
    private readonly carInventoryRequestsService: CarInventoryRequestsService,
  ) {}

  // ==========================================
  // CAR ENDPOINTS
  // ==========================================

  @Get()
  async findAll(@Query() filters: CarFilterDto): Promise<Car[]> {
    return this.carsService.findAll(filters);
  }

  @Get('available')
  async getAvailableCars(): Promise<Car[]> {
    return this.carsService.getAvailableCars();
  }

  @Get('expiring-warranty')
  @Departments(Department.ADMIN, Department.GARAGE)
  async getCarsWithExpiringWarranty(@Query('days') days?: string): Promise<Car[]> {
    const daysAhead = days ? parseInt(days, 10) : 30;
    return this.carsService.getCarsWithExpiringWarranty(daysAhead);
  }

  @Get('needing-maintenance')
  @Departments(Department.ADMIN, Department.GARAGE, Department.MAINTENANCE)
  async getCarsNeedingMaintenance(): Promise<Car[]> {
    return this.carsService.getCarsNeedingMaintenance();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CarWithHistory> {
    return this.carsService.findOne(id);
  }

  @Get(':id/availability')
  async checkAvailability(@Param('id') id: string): Promise<{ available: boolean }> {
    const available = await this.carsService.checkAvailability(id);
    return { available };
  }

  @Patch(':id')
  @Departments(Department.ADMIN, Department.GARAGE)
  async update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto): Promise<Car> {
    return this.carsService.update(id, updateCarDto);
  }

  // ==========================================
  // CAR INVENTORY REQUEST ENDPOINTS
  // ==========================================

  @Get('inventory-requests/pending')
  @Roles(Role.SUPER_ADMIN)
  async getPendingInventoryRequests(): Promise<CarInventoryRequestWithRelations[]> {
    return this.carInventoryRequestsService.findPending();
  }

  @Get('inventory-requests/all')
  @Departments(Department.ADMIN, Department.GARAGE)
  async getAllInventoryRequests(
    @Query('status') status?: CarInventoryRequestStatus,
  ): Promise<CarInventoryRequestWithRelations[]> {
    return this.carInventoryRequestsService.findAll(status);
  }

  @Get('inventory-requests/:id')
  @Departments(Department.ADMIN, Department.GARAGE)
  async getInventoryRequest(@Param('id') id: string): Promise<CarInventoryRequestWithRelations> {
    return this.carInventoryRequestsService.findOne(id);
  }

  @Post('inventory-requests')
  @Departments(Department.GARAGE)
  async createInventoryRequest(
    @Body() dto: CreateCarInventoryRequestDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CarInventoryRequest> {
    if (dto.type === CarInventoryRequestType.ADD) {
      return this.carInventoryRequestsService.createAddRequest(dto, user.id);
    } else {
      if (!dto.carId) {
        throw new Error('carId is required for DELETE requests');
      }
      return this.carInventoryRequestsService.createDeleteRequest(dto.carId, user.id);
    }
  }

  @Post('inventory-requests/:carId/delete')
  @Departments(Department.GARAGE)
  async createDeleteRequest(
    @Param('carId') carId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CarInventoryRequest> {
    return this.carInventoryRequestsService.createDeleteRequest(carId, user.id);
  }

  @Post('inventory-requests/:id/approve')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async approveInventoryRequest(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CarInventoryRequest> {
    return this.carInventoryRequestsService.approve(id, user.id);
  }

  @Post('inventory-requests/:id/reject')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async rejectInventoryRequest(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CarInventoryRequest> {
    return this.carInventoryRequestsService.reject(id, user.id);
  }
}
