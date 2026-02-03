import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CarRequestImage, CarRequestStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface ImageUploadResult {
  id: string;
  filePath: string;
  originalFilename: string;
  uploadedAt: Date;
}

@Injectable()
export class UploadsService {
  private readonly uploadDir = 'uploads/requests';
  private readonly maxImageWidth = 1920;
  private readonly maxImageHeight = 1080;
  private readonly compressionQuality = 80;
  private readonly minImages = 4;
  private readonly maxImages = 6;
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(private readonly prisma: PrismaService) {}

  async uploadImages(
    carRequestId: string,
    files: UploadedFile[],
    userId: string,
  ): Promise<ImageUploadResult[]> {
    // Validate car request exists and user has permission
    const carRequest = await this.prisma.carRequest.findUnique({
      where: { id: carRequestId },
      include: { images: true },
    });

    if (!carRequest) {
      throw new NotFoundException(`Car request with ID ${carRequestId} not found`);
    }

    // Only creator can upload images
    if (carRequest.createdById !== userId) {
      throw new BadRequestException('Only the request creator can upload images');
    }

    // Only allow uploads in certain statuses
    const allowedStatuses: CarRequestStatus[] = [
      CarRequestStatus.PENDING,
      CarRequestStatus.ASSIGNED,
      CarRequestStatus.APPROVED,
    ];

    if (!allowedStatuses.includes(carRequest.status)) {
      throw new BadRequestException(
        `Cannot upload images for request in ${carRequest.status} status`,
      );
    }

    // Validate file count
    const currentImageCount = carRequest.images.length;
    const newTotalCount = currentImageCount + files.length;

    if (newTotalCount > this.maxImages) {
      throw new BadRequestException(
        `Maximum ${this.maxImages} images allowed. Current: ${currentImageCount}, Attempting to add: ${files.length}`,
      );
    }

    // Validate each file
    for (const file of files) {
      this.validateFile(file);
    }

    // Create upload directory
    const requestDir = path.join(this.uploadDir, carRequestId);
    this.ensureDirectoryExists(requestDir);

    // Process and save each file
    const uploadResults: ImageUploadResult[] = [];

    for (const file of files) {
      const result = await this.processAndSaveImage(file, carRequestId, requestDir);
      uploadResults.push(result);
    }

    return uploadResults;
  }

  async getImagesByCarRequest(carRequestId: string): Promise<CarRequestImage[]> {
    // Verify car request exists
    const carRequest = await this.prisma.carRequest.findUnique({
      where: { id: carRequestId },
    });

    if (!carRequest) {
      throw new NotFoundException(`Car request with ID ${carRequestId} not found`);
    }

    return this.prisma.carRequestImage.findMany({
      where: { carRequestId },
      orderBy: { uploadedAt: 'asc' },
    });
  }

  async getImage(imageId: string): Promise<CarRequestImage> {
    const image = await this.prisma.carRequestImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    return image;
  }

  async getImageFile(imageId: string): Promise<{ filePath: string; mimeType: string }> {
    const image = await this.getImage(imageId);
    const fullPath = path.resolve(image.filePath);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('Image file not found on disk');
    }

    const extension = path.extname(image.filePath).toLowerCase();
    const mimeType = extension === '.png' ? 'image/png' : 'image/jpeg';

    return { filePath: fullPath, mimeType };
  }

  async deleteImage(imageId: string, userId: string): Promise<void> {
    const image = await this.prisma.carRequestImage.findUnique({
      where: { id: imageId },
      include: { carRequest: true },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    // Only creator can delete images
    if (image.carRequest.createdById !== userId) {
      throw new BadRequestException('Only the request creator can delete images');
    }

    // Only allow deletion in certain statuses
    const allowedStatuses: CarRequestStatus[] = [
      CarRequestStatus.PENDING,
      CarRequestStatus.ASSIGNED,
      CarRequestStatus.APPROVED,
    ];

    if (!allowedStatuses.includes(image.carRequest.status)) {
      throw new BadRequestException(
        `Cannot delete images for request in ${image.carRequest.status} status`,
      );
    }

    // Delete from database
    await this.prisma.carRequestImage.delete({
      where: { id: imageId },
    });

    // Delete file from disk
    if (fs.existsSync(image.filePath)) {
      fs.unlinkSync(image.filePath);
    }
  }

  async validateImageCount(carRequestId: string): Promise<{ valid: boolean; count: number }> {
    const count = await this.prisma.carRequestImage.count({
      where: { carRequestId },
    });

    return {
      valid: count >= this.minImages && count <= this.maxImages,
      count,
    };
  }

  private validateFile(file: UploadedFile): void {
    // Validate mime type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Only JPEG and PNG are allowed.`,
      );
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File ${file.originalname} exceeds maximum size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }
  }

  private async processAndSaveImage(
    file: UploadedFile,
    carRequestId: string,
    requestDir: string,
  ): Promise<ImageUploadResult> {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.mimetype === 'image/png' ? '.png' : '.jpg';
    const filename = `${timestamp}-${randomString}${extension}`;
    const filePath = path.join(requestDir, filename);

    // Process image with sharp - resize and compress
    let sharpInstance = sharp(file.buffer);

    // Get metadata to check dimensions
    const metadata = await sharpInstance.metadata();

    // Resize if larger than max dimensions
    if (
      (metadata.width && metadata.width > this.maxImageWidth) ||
      (metadata.height && metadata.height > this.maxImageHeight)
    ) {
      sharpInstance = sharpInstance.resize(this.maxImageWidth, this.maxImageHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Apply compression based on format
    if (file.mimetype === 'image/png') {
      sharpInstance = sharpInstance.png({ quality: this.compressionQuality });
    } else {
      sharpInstance = sharpInstance.jpeg({ quality: this.compressionQuality });
    }

    // Save processed image
    await sharpInstance.toFile(filePath);

    // Create database record
    const imageRecord = await this.prisma.carRequestImage.create({
      data: {
        carRequestId,
        filePath,
        originalFilename: file.originalname,
      },
    });

    return {
      id: imageRecord.id,
      filePath: imageRecord.filePath,
      originalFilename: imageRecord.originalFilename,
      uploadedAt: imageRecord.uploadedAt,
    };
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
