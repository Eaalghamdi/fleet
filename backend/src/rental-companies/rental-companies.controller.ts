import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RentalCompaniesService } from './rental-companies.service';
import { CreateRentalCompanyDto, UpdateRentalCompanyDto } from './dto';
import { Roles, Departments } from '../auth';
import { Role, Department, RentalCompany } from '@prisma/client';

@Controller('rental-companies')
export class RentalCompaniesController {
  constructor(private readonly rentalCompaniesService: RentalCompaniesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @Departments(Department.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateRentalCompanyDto): Promise<RentalCompany> {
    return this.rentalCompaniesService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.OPERATOR)
  @Departments(Department.ADMIN, Department.GARAGE, Department.OPERATION)
  findAll(@Query('includeInactive') includeInactive?: string): Promise<RentalCompany[]> {
    return this.rentalCompaniesService.findAll(includeInactive === 'true');
  }

  @Get('dropdown')
  @Roles(Role.SUPER_ADMIN, Role.OPERATOR)
  @Departments(Department.ADMIN, Department.GARAGE, Department.OPERATION)
  findForDropdown(): Promise<Pick<RentalCompany, 'id' | 'name'>[]> {
    return this.rentalCompaniesService.findActiveForDropdown();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  @Departments(Department.ADMIN)
  findOne(@Param('id') id: string): Promise<RentalCompany> {
    return this.rentalCompaniesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @Departments(Department.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateRentalCompanyDto): Promise<RentalCompany> {
    return this.rentalCompaniesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @Departments(Department.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string): Promise<RentalCompany> {
    return this.rentalCompaniesService.remove(id);
  }
}
