import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AuditService, AuditLogWithUser } from './audit.service';
import { AuditFilterDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(
    @Query() filters: AuditFilterDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<AuditLogWithUser[]> {
    return this.auditService.findAll(filters, user.department, user.role);
  }

  @Get('entity/:entityType/:entityId')
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<AuditLogWithUser[]> {
    return this.auditService.findByEntity(entityType, entityId);
  }

  @Get('recent')
  async getRecentActions(
    @CurrentUser() user: CurrentUserData,
    @Query('limit') limit?: string,
  ): Promise<AuditLogWithUser[]> {
    const limitValue = limit ? parseInt(limit, 10) : 10;
    return this.auditService.getRecentActions(user.department, limitValue);
  }
}
