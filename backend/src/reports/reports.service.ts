import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { GenerateReportDto, ReportType } from './dto';
import {
  fleetOverviewTemplate,
  FleetOverviewData,
  carRequestsTemplate,
  CarRequestsSummaryData,
  maintenanceTemplate,
  MaintenanceSummaryData,
  partsInventoryTemplate,
  PartsInventoryData,
} from './templates';
import { CarStatus, MaintenanceType, TrackingMode } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

export interface GeneratedReport {
  id: string;
  type: ReportType;
  filePath: string;
  generatedAt: Date;
}

@Injectable()
export class ReportsService {
  private readonly reportsDir: string;
  private generatedReports: Map<string, GeneratedReport> = new Map();

  constructor(private readonly prisma: PrismaService) {
    this.reportsDir = path.join(process.cwd(), 'reports');
    this.ensureReportsDirectory();
  }

  private ensureReportsDirectory(): void {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generate(dto: GenerateReportDto): Promise<GeneratedReport> {
    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();

    let html: string;

    switch (dto.type) {
      case ReportType.FLEET_OVERVIEW:
        html = await this.generateFleetOverviewReport();
        break;
      case ReportType.CAR_REQUESTS_SUMMARY:
        html = await this.generateCarRequestsReport(startDate, endDate);
        break;
      case ReportType.MAINTENANCE_SUMMARY:
        html = await this.generateMaintenanceReport(startDate, endDate);
        break;
      case ReportType.PARTS_INVENTORY:
        html = await this.generatePartsInventoryReport();
        break;
      default:
        throw new NotFoundException(`Report type ${String(dto.type)} not supported`);
    }

    const report = await this.generatePdf(html, dto.type);
    return report;
  }

  private async generateFleetOverviewReport(): Promise<string> {
    const [
      totalCars,
      availableCars,
      assignedCars,
      underMaintenance,
      carsByType,
      recentRequests,
      upcomingMaintenance,
    ] = await Promise.all([
      this.prisma.car.count({ where: { status: { not: CarStatus.DELETED } } }),
      this.prisma.car.count({ where: { status: CarStatus.AVAILABLE } }),
      this.prisma.car.count({ where: { status: CarStatus.ASSIGNED } }),
      this.prisma.car.count({ where: { status: CarStatus.UNDER_MAINTENANCE } }),
      this.prisma.car.groupBy({
        by: ['type'],
        where: { status: { not: CarStatus.DELETED } },
        _count: { type: true },
      }),
      this.prisma.carRequest.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, destination: true, status: true, createdAt: true },
      }),
      this.prisma.car.findMany({
        where: {
          nextMaintenanceDate: { gte: new Date() },
          status: { not: CarStatus.DELETED },
        },
        orderBy: { nextMaintenanceDate: 'asc' },
        take: 10,
        select: { model: true, licensePlate: true, nextMaintenanceDate: true },
      }),
    ]);

    const data: FleetOverviewData = {
      totalCars,
      availableCars,
      assignedCars,
      underMaintenance,
      carsByType: carsByType.map((c) => ({ type: c.type, count: c._count.type })),
      recentRequests,
      upcomingMaintenance: upcomingMaintenance.map((c) => ({
        carModel: c.model,
        licensePlate: c.licensePlate,
        nextMaintenanceDate: c.nextMaintenanceDate!,
      })),
    };

    return fleetOverviewTemplate(data, new Date());
  }

  private async generateCarRequestsReport(startDate: Date, endDate: Date): Promise<string> {
    const where = {
      createdAt: { gte: startDate, lte: endDate },
    };

    const [requests, requestsByStatus] = await Promise.all([
      this.prisma.carRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { fullName: true } } },
      }),
      this.prisma.carRequest.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
    ]);

    const data: CarRequestsSummaryData = {
      totalRequests: requests.length,
      pendingRequests: requests.filter((r) => r.status === 'PENDING').length,
      approvedRequests: requests.filter((r) => r.status === 'APPROVED').length,
      rejectedRequests: requests.filter((r) => r.status === 'REJECTED').length,
      completedRequests: requests.filter((r) => r.status === 'RETURNED').length,
      requestsByStatus: requestsByStatus.map((r) => ({
        status: r.status,
        count: r._count.status,
      })),
      requestsList: requests.map((r) => ({
        id: r.id,
        requestedCarType: r.requestedCarType,
        destination: r.destination,
        status: r.status,
        createdBy: r.createdBy.fullName,
        createdAt: r.createdAt,
        departureDatetime: r.departureDatetime,
      })),
      dateRange: { start: startDate, end: endDate },
    };

    return carRequestsTemplate(data, new Date());
  }

  private async generateMaintenanceReport(startDate: Date, endDate: Date): Promise<string> {
    const where = {
      createdAt: { gte: startDate, lte: endDate },
    };

    const [requests, requestsByStatus] = await Promise.all([
      this.prisma.maintenanceRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { car: { select: { model: true, licensePlate: true } } },
      }),
      this.prisma.maintenanceRequest.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
    ]);

    const totalExternalCost = requests
      .filter((r) => r.externalCost)
      .reduce((sum, r) => sum + Number(r.externalCost), 0);

    const data: MaintenanceSummaryData = {
      totalRequests: requests.length,
      pendingRequests: requests.filter(
        (r) => r.status === 'PENDING' || r.status === 'PENDING_APPROVAL',
      ).length,
      inProgressRequests: requests.filter((r) => r.status === 'IN_PROGRESS').length,
      completedRequests: requests.filter((r) => r.status === 'COMPLETED').length,
      internalMaintenance: requests.filter((r) => r.maintenanceType === MaintenanceType.INTERNAL)
        .length,
      externalMaintenance: requests.filter((r) => r.maintenanceType === MaintenanceType.EXTERNAL)
        .length,
      totalExternalCost,
      requestsByStatus: requestsByStatus.map((r) => ({
        status: r.status,
        count: r._count.status,
      })),
      maintenanceList: requests.map((r) => ({
        id: r.id,
        carModel: r.car.model,
        licensePlate: r.car.licensePlate,
        description: r.description,
        maintenanceType: r.maintenanceType,
        status: r.status,
        externalCost: r.externalCost ? Number(r.externalCost) : null,
        createdAt: r.createdAt,
      })),
      dateRange: { start: startDate, end: endDate },
    };

    return maintenanceTemplate(data, new Date());
  }

  private async generatePartsInventoryReport(): Promise<string> {
    const [parts, lowStockParts, purchaseRequests] = await Promise.all([
      this.prisma.part.findMany({
        where: { isDeleted: false },
        orderBy: { name: 'asc' },
      }),
      this.prisma.part.findMany({
        where: {
          isDeleted: false,
          trackingMode: TrackingMode.QUANTITY,
          quantity: { lte: 5 },
        },
      }),
      this.prisma.purchaseRequest.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const data: PartsInventoryData = {
      totalParts: parts.length,
      totalQuantityParts: parts.filter((p) => p.trackingMode === TrackingMode.QUANTITY).length,
      totalSerialParts: parts.filter((p) => p.trackingMode === TrackingMode.SERIAL_NUMBER).length,
      lowStockCount: lowStockParts.length,
      partsList: parts.map((p) => ({
        id: p.id,
        name: p.name,
        carType: p.carType,
        carModel: p.carModel,
        trackingMode: p.trackingMode,
        quantity: p.quantity,
        serialNumber: p.serialNumber,
      })),
      lowStockParts: lowStockParts.map((p) => ({
        name: p.name,
        quantity: p.quantity!,
        carType: p.carType,
      })),
      recentPurchaseRequests: purchaseRequests.map((pr) => ({
        id: pr.id,
        partName: pr.partName,
        quantity: pr.quantity,
        estimatedCost: Number(pr.estimatedCost),
        vendor: pr.vendor,
        status: pr.status,
        createdAt: pr.createdAt,
      })),
    };

    return partsInventoryTemplate(data, new Date());
  }

  private async generatePdf(html: string, type: ReportType): Promise<GeneratedReport> {
    const reportId = `${type}-${Date.now()}`;
    const fileName = `${reportId}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      });
    } finally {
      await browser.close();
    }

    const report: GeneratedReport = {
      id: reportId,
      type,
      filePath,
      generatedAt: new Date(),
    };

    this.generatedReports.set(reportId, report);

    return report;
  }

  getReport(id: string): GeneratedReport {
    const report = this.generatedReports.get(id);

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    if (!fs.existsSync(report.filePath)) {
      throw new NotFoundException(`Report file not found`);
    }

    return report;
  }

  getReportFilePath(id: string): string {
    const report = this.generatedReports.get(id);

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report.filePath;
  }
}
