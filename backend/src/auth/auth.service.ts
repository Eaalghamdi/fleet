import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma';
import { LoginDto, ResetPasswordDto } from './dto';
import { Department, Role, User } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  username: string;
  department: Department;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    department: Department;
    role: Role;
  };
}

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      department: user.department,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        department: user.department,
        role: user.role,
      },
    };
  }

  async getMe(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async resetPassword(
    adminId: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    // Verify admin exists and is a Super Admin
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admin can reset passwords');
    }

    // Find the target user
    const targetUser = await this.prisma.user.findUnique({
      where: { id: resetPasswordDto.userId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Hash the new password
    const passwordHash = await this.hashPassword(resetPasswordDto.newPassword);

    // Update the user's password
    await this.prisma.user.update({
      where: { id: resetPasswordDto.userId },
      data: { passwordHash },
    });

    return { message: 'Password reset successfully' };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
