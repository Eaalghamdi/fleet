import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService, type GeneratedReport } from './reports.service';
import { GenerateReportDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DepartmentsGuard } from '../auth/guards/departments.guard';
import { Departments } from '../auth/decorators/departments.decorator';
import { Department } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard, DepartmentsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @Departments(Department.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async generate(@Body() dto: GenerateReportDto): Promise<GeneratedReport> {
    return this.reportsService.generate(dto);
  }

  @Get(':id')
  @Departments(Department.ADMIN)
  getReport(@Param('id') id: string): GeneratedReport {
    return this.reportsService.getReport(id);
  }

  @Get(':id/download')
  @Departments(Department.ADMIN)
  download(@Param('id') id: string, @Res() res: Response): void {
    const filePath = this.reportsService.getReportFilePath(id);
    res.download(filePath);
  }
}
