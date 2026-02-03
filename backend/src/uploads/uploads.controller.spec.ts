import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { Department, Role } from '@prisma/client';
import { Response } from 'express';

describe('UploadsController', () => {
  let controller: UploadsController;

  const mockImage = {
    id: 'image-123',
    carRequestId: 'request-123',
    filePath: 'uploads/requests/request-123/image.jpg',
    originalFilename: 'test.jpg',
    uploadedAt: new Date(),
  };

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    fullName: 'Test User',
    department: Department.OPERATION,
    role: Role.OPERATOR,
  };

  const mockUploadResult = {
    id: 'image-123',
    filePath: 'uploads/requests/request-123/image.jpg',
    originalFilename: 'test.jpg',
    uploadedAt: new Date(),
  };

  const mockUploadsService = {
    uploadImages: jest.fn(),
    getImagesByCarRequest: jest.fn(),
    getImage: jest.fn(),
    getImageFile: jest.fn(),
    deleteImage: jest.fn(),
    validateImageCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImages', () => {
    it('should upload images successfully', async () => {
      const mockFile = {
        fieldname: 'images',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake image data'),
        size: 1024,
      } as Express.Multer.File;

      mockUploadsService.uploadImages.mockResolvedValue([mockUploadResult]);

      const result = await controller.uploadImages('request-123', [mockFile], mockUser);

      expect(result).toEqual([mockUploadResult]);
      expect(mockUploadsService.uploadImages).toHaveBeenCalledWith(
        'request-123',
        expect.arrayContaining([
          expect.objectContaining({
            originalname: 'test.jpg',
            mimetype: 'image/jpeg',
          }),
        ]),
        mockUser.id,
      );
    });

    it('should throw BadRequestException when no files uploaded', async () => {
      await expect(controller.uploadImages('request-123', [], mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when files is undefined', async () => {
      await expect(
        controller.uploadImages(
          'request-123',
          undefined as unknown as Express.Multer.File[],
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getImages', () => {
    it('should return images for a car request', async () => {
      mockUploadsService.getImagesByCarRequest.mockResolvedValue([mockImage]);

      const result = await controller.getImages('request-123');

      expect(result).toEqual([mockImage]);
      expect(mockUploadsService.getImagesByCarRequest).toHaveBeenCalledWith('request-123');
    });
  });

  describe('validateImageCount', () => {
    it('should return validation result', async () => {
      mockUploadsService.validateImageCount.mockResolvedValue({ valid: true, count: 4 });

      const result = await controller.validateImageCount('request-123');

      expect(result).toEqual({ valid: true, count: 4 });
      expect(mockUploadsService.validateImageCount).toHaveBeenCalledWith('request-123');
    });
  });

  describe('getImage', () => {
    it('should return an image by id', async () => {
      mockUploadsService.getImage.mockResolvedValue(mockImage);

      const result = await controller.getImage('image-123');

      expect(result).toEqual(mockImage);
      expect(mockUploadsService.getImage).toHaveBeenCalledWith('image-123');
    });
  });

  describe('getImageFile', () => {
    it('should send the image file', async () => {
      const setHeaderMock = jest.fn();
      const sendFileMock = jest.fn();
      const mockResponse = {
        setHeader: setHeaderMock,
        sendFile: sendFileMock,
      } as unknown as Response;

      mockUploadsService.getImageFile.mockResolvedValue({
        filePath: '/full/path/to/image.jpg',
        mimeType: 'image/jpeg',
      });

      await controller.getImageFile('image-123', mockResponse);

      expect(setHeaderMock).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(sendFileMock).toHaveBeenCalledWith('/full/path/to/image.jpg');
    });
  });

  describe('deleteImage', () => {
    it('should delete an image', async () => {
      mockUploadsService.deleteImage.mockResolvedValue(undefined);

      await controller.deleteImage('image-123', mockUser);

      expect(mockUploadsService.deleteImage).toHaveBeenCalledWith('image-123', mockUser.id);
    });
  });
});
