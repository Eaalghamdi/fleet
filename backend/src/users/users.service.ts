import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Department, Role, User } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.excludePassword(user));
  }

  async findOne(id: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.excludePassword(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    // Check if username already exists
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new ConflictException(`Username '${createUserDto.username}' already exists`);
    }

    // Validate department-role combination
    this.validateDepartmentRole(createUserDto.department, createUserDto.role);

    // Hash the password
    const passwordHash = await bcrypt.hash(createUserDto.password, this.saltRounds);

    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        passwordHash,
        fullName: createUserDto.fullName,
        department: createUserDto.department,
        role: createUserDto.role,
      },
    });

    return this.excludePassword(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserWithoutPassword> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if username is being updated and if it already exists
    if (updateUserDto.username && updateUserDto.username !== existingUser.username) {
      const userWithUsername = await this.findByUsername(updateUserDto.username);
      if (userWithUsername) {
        throw new ConflictException(`Username '${updateUserDto.username}' already exists`);
      }
    }

    // Validate department-role combination if either is being updated
    const newDepartment = updateUserDto.department || existingUser.department;
    const newRole = updateUserDto.role || existingUser.role;
    this.validateDepartmentRole(newDepartment, newRole);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        username: updateUserDto.username,
        fullName: updateUserDto.fullName,
        department: updateUserDto.department,
        role: updateUserDto.role,
        isActive: updateUserDto.isActive,
      },
    });

    return this.excludePassword(user);
  }

  async deactivate(id: string): Promise<UserWithoutPassword> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return this.excludePassword(user);
  }

  async activate(id: string): Promise<UserWithoutPassword> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    return this.excludePassword(user);
  }

  private validateDepartmentRole(department: Department, role: Role): void {
    // Super Admin must be in ADMIN department
    if (role === Role.SUPER_ADMIN && department !== Department.ADMIN) {
      throw new BadRequestException('Super Admin must be assigned to ADMIN department');
    }

    // ADMIN department can only have SUPER_ADMIN role
    if (department === Department.ADMIN && role !== Role.SUPER_ADMIN) {
      throw new BadRequestException('ADMIN department can only have SUPER_ADMIN role');
    }
  }

  private excludePassword(user: User): UserWithoutPassword {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
