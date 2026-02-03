import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RentalCompaniesService } from './rental-companies.service';
import { PrismaService } from '../prisma';

describe('RentalCompaniesService', () => {
  let service: RentalCompaniesService;

  const mockRentalCompany = {
    id: 'rental-123',
    name: 'Hertz',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    rentalCompany: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentalCompaniesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RentalCompaniesService>(RentalCompaniesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a rental company', async () => {
      mockPrismaService.rentalCompany.findFirst.mockResolvedValue(null);
      mockPrismaService.rentalCompany.create.mockResolvedValue(mockRentalCompany);

      const result = await service.create({ name: 'Hertz' });

      expect(result).toEqual(mockRentalCompany);
      expect(mockPrismaService.rentalCompany.create).toHaveBeenCalledWith({
        data: { name: 'Hertz', isActive: true },
      });
    });

    it('should throw ConflictException if name already exists', async () => {
      mockPrismaService.rentalCompany.findFirst.mockResolvedValue(mockRentalCompany);

      await expect(service.create({ name: 'Hertz' })).rejects.toThrow(ConflictException);
    });

    it('should create with custom isActive value', async () => {
      mockPrismaService.rentalCompany.findFirst.mockResolvedValue(null);
      mockPrismaService.rentalCompany.create.mockResolvedValue({
        ...mockRentalCompany,
        isActive: false,
      });

      const result = await service.create({ name: 'Hertz', isActive: false });

      expect(result.isActive).toBe(false);
      expect(mockPrismaService.rentalCompany.create).toHaveBeenCalledWith({
        data: { name: 'Hertz', isActive: false },
      });
    });
  });

  describe('findAll', () => {
    it('should return all active rental companies', async () => {
      mockPrismaService.rentalCompany.findMany.mockResolvedValue([mockRentalCompany]);

      const result = await service.findAll();

      expect(result).toEqual([mockRentalCompany]);
      expect(mockPrismaService.rentalCompany.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    });

    it('should return all rental companies including inactive', async () => {
      mockPrismaService.rentalCompany.findMany.mockResolvedValue([mockRentalCompany]);

      const result = await service.findAll(true);

      expect(result).toEqual([mockRentalCompany]);
      expect(mockPrismaService.rentalCompany.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a rental company', async () => {
      mockPrismaService.rentalCompany.findUnique.mockResolvedValue(mockRentalCompany);

      const result = await service.findOne('rental-123');

      expect(result).toEqual(mockRentalCompany);
    });

    it('should throw NotFoundException if rental company not found', async () => {
      mockPrismaService.rentalCompany.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a rental company', async () => {
      mockPrismaService.rentalCompany.findUnique.mockResolvedValue(mockRentalCompany);
      mockPrismaService.rentalCompany.findFirst.mockResolvedValue(null);
      mockPrismaService.rentalCompany.update.mockResolvedValue({
        ...mockRentalCompany,
        name: 'Avis',
      });

      const result = await service.update('rental-123', { name: 'Avis' });

      expect(result.name).toBe('Avis');
    });

    it('should throw NotFoundException if rental company not found', async () => {
      mockPrismaService.rentalCompany.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'Avis' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new name already exists', async () => {
      mockPrismaService.rentalCompany.findUnique.mockResolvedValue(mockRentalCompany);
      mockPrismaService.rentalCompany.findFirst.mockResolvedValue({
        ...mockRentalCompany,
        id: 'other-rental',
        name: 'Avis',
      });

      await expect(service.update('rental-123', { name: 'Avis' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update isActive without name conflict check', async () => {
      mockPrismaService.rentalCompany.findUnique.mockResolvedValue(mockRentalCompany);
      mockPrismaService.rentalCompany.update.mockResolvedValue({
        ...mockRentalCompany,
        isActive: false,
      });

      const result = await service.update('rental-123', { isActive: false });

      expect(result.isActive).toBe(false);
      expect(mockPrismaService.rentalCompany.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a rental company', async () => {
      mockPrismaService.rentalCompany.findUnique.mockResolvedValue(mockRentalCompany);
      mockPrismaService.rentalCompany.update.mockResolvedValue({
        ...mockRentalCompany,
        isActive: false,
      });

      const result = await service.remove('rental-123');

      expect(result.isActive).toBe(false);
      expect(mockPrismaService.rentalCompany.update).toHaveBeenCalledWith({
        where: { id: 'rental-123' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if rental company not found', async () => {
      mockPrismaService.rentalCompany.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findActiveForDropdown', () => {
    it('should return active rental companies for dropdown', async () => {
      const dropdownData = [{ id: 'rental-123', name: 'Hertz' }];
      mockPrismaService.rentalCompany.findMany.mockResolvedValue(dropdownData);

      const result = await service.findActiveForDropdown();

      expect(result).toEqual(dropdownData);
      expect(mockPrismaService.rentalCompany.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    });
  });
});
