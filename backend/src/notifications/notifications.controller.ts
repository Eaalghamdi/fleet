import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationFilterDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Notification } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query() filters: NotificationFilterDto,
  ): Promise<Notification[]> {
    return this.notificationsService.findAllForUser(user.id, filters);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: CurrentUserData): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Notification> {
    return this.notificationsService.findOne(id, user.id);
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser() user: CurrentUserData): Promise<{ count: number }> {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData): Promise<void> {
    await this.notificationsService.delete(id, user.id);
  }
}
