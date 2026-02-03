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
import { CarRequestsService, CarRequestWithRelations } from './car-requests.service';
import {
  CreateCarRequestDto,
  UpdateCarRequestDto,
  AssignCarDto,
  ReturnCarDto,
  CarRequestFilterDto,
} from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Departments } from '../auth/decorators/departments.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DepartmentsGuard } from '../auth/guards/departments.guard';
import { CarRequest, Department, Role } from '@prisma/client';

@Controller('car-requests')
@UseGuards(JwtAuthGuard, RolesGuard, DepartmentsGuard)
export class CarRequestsController {
  constructor(private readonly carRequestsService: CarRequestsService) {}

  // ==========================================
  // CRUD ENDPOINTS
  // ==========================================

  @Get()
  async findAll(@Query() filters: CarRequestFilterDto): Promise<CarRequestWithRelations[]> {
    return this.carRequestsService.findAll(filters);
  }

  @Get('my-requests')
  async getMyRequests(@CurrentUser() user: CurrentUserData): Promise<CarRequestWithRelations[]> {
    return this.carRequestsService.getRequestsByUser(user.id);
  }

  @Get('pending')
  @Departments(Department.ADMIN, Department.GARAGE)
  async getPendingRequests(): Promise<CarRequestWithRelations[]> {
    return this.carRequestsService.getPendingRequests();
  }

  @Get('assigned')
  @Departments(Department.ADMIN)
  async getAssignedRequests(): Promise<CarRequestWithRelations[]> {
    return this.carRequestsService.getAssignedRequests();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CarRequestWithRelations> {
    return this.carRequestsService.findOne(id);
  }

  @Post()
  @Departments(Department.OPERATION)
  async create(
    @Body() dto: CreateCarRequestDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CarRequest> {
    return this.carRequestsService.create(dto, user.id);
  }

  @Patch(':id')
  @Departments(Department.OPERATION)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCarRequestDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CarRequest> {
    return this.carRequestsService.update(id, dto, user.id);
  }

  @Post(':id/cancel')
  @Departments(Department.OPERATION)
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string, @CurrentUser() user: CurrentUserData): Promise<CarRequest> {
    return this.carRequestsService.cancel(id, user.id);
  }

  // ==========================================
  // WORKFLOW ENDPOINTS
  // ==========================================

  @Post(':id/assign')
  @Departments(Department.GARAGE)
  @HttpCode(HttpStatus.OK)
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignCarDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CarRequest> {
    return this.carRequestsService.assign(id, dto, user.id);
  }

  @Post(':id/approve')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CarRequest> {
    return this.carRequestsService.approve(id, user.id);
  }

  @Post(':id/reject')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async reject(@Param('id') id: string, @CurrentUser() user: CurrentUserData): Promise<CarRequest> {
    return this.carRequestsService.reject(id, user.id);
  }

  @Post(':id/in-transit')
  @Departments(Department.OPERATION)
  @HttpCode(HttpStatus.OK)
  async markInTransit(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CarRequest> {
    return this.carRequestsService.markInTransit(id, user.id);
  }

  @Post(':id/return')
  @Departments(Department.GARAGE)
  @HttpCode(HttpStatus.OK)
  async confirmReturn(
    @Param('id') id: string,
    @Body() dto: ReturnCarDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CarRequest> {
    return this.carRequestsService.confirmReturn(id, dto, user.id);
  }
}
