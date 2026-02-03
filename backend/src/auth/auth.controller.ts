import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { LoginDto, ResetPasswordDto } from './dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { CurrentUserData } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Role, User } from '@prisma/client';

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  async getMe(@CurrentUser() user: CurrentUserData): Promise<Omit<User, 'passwordHash'>> {
    return this.authService.getMe(user.id);
  }

  @Post('reset-password')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @CurrentUser('id') adminId: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(adminId, resetPasswordDto);
  }
}
