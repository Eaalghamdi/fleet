import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UploadsService, UploadedFile } from './uploads.service';
import { PrismaService } from '../prisma';
import { CarRequestStatus, CarType } from '@prisma/client';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// Mock sharp module
jest.mock('sharp', () => {
  const mockSharp = jest.fn(() => ({
    metadata: jest.fn().mockResolvedValue({ width: 800, height: 600 }),
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue(undefined),
  }));
  return mockSharp;
});

describe('UploadsService', () => {
  let service: UploadsService;

  const mockCarRequest = {
    id: 'request-123',
    requestedCarType: CarType.SEDAN,
    requestedCarId: null,
    isRental: false,
    rentalCompanyId: null,
    departureLocation: 'Office',
    destination: 'Airport',
    departureDatetime: new Date('2025-06-01T10:00:00Z'),
    returnDatetime: new Date('2025-06-02T18:00:00Z'),
    description: 'Business trip',
    status: CarRequestStatus.PENDING,
    returnConditionNotes: null,
    createdById: 'user-123',
    assignedById: null,
    approvedById: null,
    cancelledById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [],
  };

  const mockImage = {
    id: 'image-123',
    carRequestId: 'request-123',
    filePath: 'uploads/requests/request-123/image.jpg',
    originalFilename: 'test.jpg',
    uploadedAt: new Date(),
  };

  const mockFile: UploadedFile = {
    fieldname: 'images',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake image data'),
    size: 1024,
  };

  const mockPrismaService = {
    carRequest: {
      findUnique: jest.fn(),
    },
    carRequestImage: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);

    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(false);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImages', () => {
    it('should upload images successfully', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);
      mockPrismaService.carRequestImage.create.mockResolvedValue(mockImage);

      const result = await service.uploadImages('request-123', [mockFile], 'user-123');

      expect(result).toHaveLength(1);
      expect(result[0].originalFilename).toBe('test.jpg');
      expect(mockPrismaService.carRequestImage.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when car request not found', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(null);

      await expect(service.uploadImages('nonexistent', [mockFile], 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when user is not the creator', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);

      await expect(service.uploadImages('request-123', [mockFile], 'other-user')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when request status does not allow uploads', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue({
        ...mockCarRequest,
        status: CarRequestStatus.RETURNED,
      });

      await expect(service.uploadImages('request-123', [mockFile], 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when exceeding max images', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue({
        ...mockCarRequest,
        images: Array(5).fill(mockImage),
      });

      await expect(
        service.uploadImages('request-123', [mockFile, mockFile], 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid mime type', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);

      const invalidFile: UploadedFile = {
        ...mockFile,
        mimetype: 'application/pdf',
      };

      await expect(service.uploadImages('request-123', [invalidFile], 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for file exceeding size limit', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);

      const largeFile: UploadedFile = {
        ...mockFile,
        size: 20 * 1024 * 1024, // 20MB
      };

      await expect(service.uploadImages('request-123', [largeFile], 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle PNG files correctly', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);
      mockPrismaService.carRequestImage.create.mockResolvedValue({
        ...mockImage,
        originalFilename: 'test.png',
      });

      const pngFile: UploadedFile = {
        ...mockFile,
        originalname: 'test.png',
        mimetype: 'image/png',
      };

      const result = await service.uploadImages('request-123', [pngFile], 'user-123');

      expect(result).toHaveLength(1);
    });
  });

  describe('getImagesByCarRequest', () => {
    it('should return images for a car request', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(mockCarRequest);
      mockPrismaService.carRequestImage.findMany.mockResolvedValue([mockImage]);

      const result = await service.getImagesByCarRequest('request-123');

      expect(result).toEqual([mockImage]);
      expect(mockPrismaService.carRequestImage.findMany).toHaveBeenCalledWith({
        where: { carRequestId: 'request-123' },
        orderBy: { uploadedAt: 'asc' },
      });
    });

    it('should throw NotFoundException when car request not found', async () => {
      mockPrismaService.carRequest.findUnique.mockResolvedValue(null);

      await expect(service.getImagesByCarRequest('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getImage', () => {
    it('should return an image by id', async () => {
      mockPrismaService.carRequestImage.findUnique.mockResolvedValue(mockImage);

      const result = await service.getImage('image-123');

      expect(result).toEqual(mockImage);
    });

    it('should throw NotFoundException when image not found', async () => {
      mockPrismaService.carRequestImage.findUnique.mockResolvedValue(null);

      await expect(service.getImage('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getImageFile', () => {
    it('should return file path and mime type', async () => {
      mockPrismaService.carRequestImage.findUnique.mockResolvedValue(mockImage);
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await service.getImageFile('image-123');

      expect(result.mimeType).toBe('image/jpeg');
      expect(result.filePath).toContain('image.jpg');
    });

    it('should throw NotFoundException when file not found on disk', async () => {
      mockPrismaService.carRequestImage.findUnique.mockResolvedValue(mockImage);
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(service.getImageFile('image-123')).rejects.toThrow(NotFoundException);
    });

    it('should return png mime type for png files', async () => {
      mockPrismaService.carRequestImage.findUnique.mockResolvedValue({
        ...mockImage,
        filePath: 'uploads/requests/request-123/image.png',
      });
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await service.getImageFile('image-123');

      expect(result.mimeType).toBe('image/png');
    });
  });

  describe('deleteImage', () => {
    it('should delete an image successfully', async () => {
      mockPrismaService.carRequestImage.findUnique.mockResolvedValue({
        ...mockImage,
        carRequest: mockCarRequest,
      });
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await service.deleteImage('image-123', 'user-123');

      expect(mockPrismaService.carRequestImage.delete).toHaveBeenCalledWith({
        where: { id: 'image-123' },
      });
      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('should throw NotFoundException when image not found', async () => {
      mockPrismaService.carRequestImage.findUnique.mockResolvedValue(null);

      await expect(service.deleteImage('nonexistent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when user is not the creator', async () => {
      mockPrismaService.carRequestImage.findUnique.mockResolvedValue({
        ...mockImage,
        carRequest: mockCarRequest,
      });

      await expect(service.deleteImage('image-123', 'other-user')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when status does not allow deletion', async () => {
      mockPrismaService.carRequestImage.findUnique.mockResolvedValue({
        ...mockImage,
        carRequest: {
          ...mockCarRequest,
          status: CarRequestStatus.RETURNED,
        },
      });

      await expect(service.deleteImage('image-123', 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not throw if file does not exist on disk', async () => {
      mockPrismaService.carRequestImage.findUnique.mockResolvedValue({
        ...mockImage,
        carRequest: mockCarRequest,
      });
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await service.deleteImage('image-123', 'user-123');

      expect(mockPrismaService.carRequestImage.delete).toHaveBeenCalled();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('validateImageCount', () => {
    it('should return valid true when count is within range', async () => {
      mockPrismaService.carRequestImage.count.mockResolvedValue(4);

      const result = await service.validateImageCount('request-123');

      expect(result).toEqual({ valid: true, count: 4 });
    });

    it('should return valid false when count is below minimum', async () => {
      mockPrismaService.carRequestImage.count.mockResolvedValue(2);

      const result = await service.validateImageCount('request-123');

      expect(result).toEqual({ valid: false, count: 2 });
    });

    it('should return valid true for maximum count', async () => {
      mockPrismaService.carRequestImage.count.mockResolvedValue(6);

      const result = await service.validateImageCount('request-123');

      expect(result).toEqual({ valid: true, count: 6 });
    });
  });
});
