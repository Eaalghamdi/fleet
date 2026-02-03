import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateRentalCompanyDto, UpdateRentalCompanyDto } from './dto';
import { RentalCompany } from '@prisma/client';

@Injectable()
export class RentalCompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRentalCompanyDto): Promise<RentalCompany> {
    // Check for duplicate name
    const existing = await this.prisma.rentalCompany.findFirst({
      where: { name: dto.name, isActive: true },
    });

    if (existing) {
      throw new ConflictException('A rental company with this name already exists');
    }

    return this.prisma.rentalCompany.create({
      data: {
        name: dto.name,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(includeInactive = false): Promise<RentalCompany[]> {
    const where = includeInactive ? {} : { isActive: true };

    return this.prisma.rentalCompany.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<RentalCompany> {
    const rentalCompany = await this.prisma.rentalCompany.findUnique({
      where: { id },
    });

    if (!rentalCompany) {
      throw new NotFoundException(`Rental company with ID ${id} not found`);
    }

    return rentalCompany;
  }

  async update(id: string, dto: UpdateRentalCompanyDto): Promise<RentalCompany> {
    await this.findOne(id);

    // Check for duplicate name if name is being updated
    if (dto.name) {
      const existing = await this.prisma.rentalCompany.findFirst({
        where: {
          name: dto.name,
          isActive: true,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('A rental company with this name already exists');
      }
    }

    return this.prisma.rentalCompany.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string): Promise<RentalCompany> {
    await this.findOne(id);

    // Soft delete by setting isActive to false
    return this.prisma.rentalCompany.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findActiveForDropdown(): Promise<Pick<RentalCompany, 'id' | 'name'>[]> {
    return this.prisma.rentalCompany.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
