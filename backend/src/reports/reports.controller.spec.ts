import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportType } from './dto';

describe('ReportsController', () => {
  let controller: ReportsController;

  const mockReport = {
    id: 'FLEET_OVERVIEW-123456789',
    type: ReportType.FLEET_OVERVIEW,
    filePath: '/reports/FLEET_OVERVIEW-123456789.pdf',
    generatedAt: new Date(),
  };

  const downloadMock = jest.fn();

  const mockResponse = {
    download: downloadMock,
  };

  const mockReportsService = {
    generate: jest.fn(),
    getReport: jest.fn(),
    getReportFilePath: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generate', () => {
    it('should generate a report', async () => {
      mockReportsService.generate.mockResolvedValue(mockReport);

      const result = await controller.generate({ type: ReportType.FLEET_OVERVIEW });

      expect(result).toEqual(mockReport);
      expect(mockReportsService.generate).toHaveBeenCalledWith({
        type: ReportType.FLEET_OVERVIEW,
      });
    });

    it('should generate report with date range', async () => {
      mockReportsService.generate.mockResolvedValue(mockReport);

      await controller.generate({
        type: ReportType.CAR_REQUESTS_SUMMARY,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockReportsService.generate).toHaveBeenCalledWith({
        type: ReportType.CAR_REQUESTS_SUMMARY,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });
  });

  describe('getReport', () => {
    it('should return a report', () => {
      mockReportsService.getReport.mockReturnValue(mockReport);

      const result = controller.getReport('FLEET_OVERVIEW-123456789');

      expect(result).toEqual(mockReport);
      expect(mockReportsService.getReport).toHaveBeenCalledWith('FLEET_OVERVIEW-123456789');
    });
  });

  describe('download', () => {
    it('should download a report', () => {
      mockReportsService.getReportFilePath.mockReturnValue('/reports/FLEET_OVERVIEW-123456789.pdf');

      controller.download(
        'FLEET_OVERVIEW-123456789',
        mockResponse as unknown as import('express').Response,
      );

      expect(mockReportsService.getReportFilePath).toHaveBeenCalledWith('FLEET_OVERVIEW-123456789');
      expect(downloadMock).toHaveBeenCalledWith('/reports/FLEET_OVERVIEW-123456789.pdf');
    });
  });
});
