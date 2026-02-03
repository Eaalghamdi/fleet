import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UploadsService, UploadedFile, ImageUploadResult } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DepartmentsGuard } from '../auth/guards/departments.guard';
import { Departments } from '../auth/decorators/departments.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CarRequestImage, Department } from '@prisma/client';
import { memoryStorage } from 'multer';

@Controller('car-requests')
@UseGuards(JwtAuthGuard, RolesGuard, DepartmentsGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post(':id/images')
  @Departments(Department.OPERATION)
  @UseInterceptors(
    FilesInterceptor('images', 6, {
      storage: memoryStorage(),
      fileFilter: (_req, file, callback) => {
        const allowedMimes = ['image/jpeg', 'image/png'];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Only JPEG and PNG files are allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadImages(
    @Param('id') carRequestId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: CurrentUserData,
  ): Promise<ImageUploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Convert Express.Multer.File to our UploadedFile interface
    const uploadedFiles: UploadedFile[] = files.map((file) => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    }));

    return this.uploadsService.uploadImages(carRequestId, uploadedFiles, user.id);
  }

  @Get(':id/images')
  async getImages(@Param('id') carRequestId: string): Promise<CarRequestImage[]> {
    return this.uploadsService.getImagesByCarRequest(carRequestId);
  }

  @Get(':id/images/validate')
  async validateImageCount(
    @Param('id') carRequestId: string,
  ): Promise<{ valid: boolean; count: number }> {
    return this.uploadsService.validateImageCount(carRequestId);
  }

  @Get('images/:imageId')
  async getImage(@Param('imageId') imageId: string): Promise<CarRequestImage> {
    return this.uploadsService.getImage(imageId);
  }

  @Get('images/:imageId/file')
  async getImageFile(@Param('imageId') imageId: string, @Res() res: Response): Promise<void> {
    const { filePath, mimeType } = await this.uploadsService.getImageFile(imageId);
    res.setHeader('Content-Type', mimeType);
    res.sendFile(filePath);
  }

  @Delete('images/:imageId')
  @Departments(Department.OPERATION)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteImage(
    @Param('imageId') imageId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<void> {
    await this.uploadsService.deleteImage(imageId, user.id);
  }
}
