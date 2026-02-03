import { Test, TestingModule } from '@nestjs/testing';
import { RentalCompaniesController } from './rental-companies.controller';
import { RentalCompaniesService } from './rental-companies.service';

describe('RentalCompaniesController', () => {
  let controller: RentalCompaniesController;

  const mockRentalCompany = {
    id: 'rental-123',
    name: 'Hertz',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRentalCompaniesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findActiveForDropdown: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentalCompaniesController],
      providers: [
        {
          provide: RentalCompaniesService,
          useValue: mockRentalCompaniesService,
        },
      ],
    }).compile();

    controller = module.get<RentalCompaniesController>(RentalCompaniesController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a rental company', async () => {
      mockRentalCompaniesService.create.mockResolvedValue(mockRentalCompany);

      const result = await controller.create({ name: 'Hertz' });

      expect(result).toEqual(mockRentalCompany);
      expect(mockRentalCompaniesService.create).toHaveBeenCalledWith({ name: 'Hertz' });
    });
  });

  describe('findAll', () => {
    it('should return all active rental companies by default', async () => {
      mockRentalCompaniesService.findAll.mockResolvedValue([mockRentalCompany]);

      const result = await controller.findAll();

      expect(result).toEqual([mockRentalCompany]);
      expect(mockRentalCompaniesService.findAll).toHaveBeenCalledWith(false);
    });

    it('should return all rental companies including inactive', async () => {
      mockRentalCompaniesService.findAll.mockResolvedValue([mockRentalCompany]);

      const result = await controller.findAll('true');

      expect(result).toEqual([mockRentalCompany]);
      expect(mockRentalCompaniesService.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe('findForDropdown', () => {
    it('should return rental companies for dropdown', async () => {
      const dropdownData = [{ id: 'rental-123', name: 'Hertz' }];
      mockRentalCompaniesService.findActiveForDropdown.mockResolvedValue(dropdownData);

      const result = await controller.findForDropdown();

      expect(result).toEqual(dropdownData);
      expect(mockRentalCompaniesService.findActiveForDropdown).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a rental company', async () => {
      mockRentalCompaniesService.findOne.mockResolvedValue(mockRentalCompany);

      const result = await controller.findOne('rental-123');

      expect(result).toEqual(mockRentalCompany);
      expect(mockRentalCompaniesService.findOne).toHaveBeenCalledWith('rental-123');
    });
  });

  describe('update', () => {
    it('should update a rental company', async () => {
      const updatedCompany = { ...mockRentalCompany, name: 'Avis' };
      mockRentalCompaniesService.update.mockResolvedValue(updatedCompany);

      const result = await controller.update('rental-123', { name: 'Avis' });

      expect(result).toEqual(updatedCompany);
      expect(mockRentalCompaniesService.update).toHaveBeenCalledWith('rental-123', {
        name: 'Avis',
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a rental company', async () => {
      const deletedCompany = { ...mockRentalCompany, isActive: false };
      mockRentalCompaniesService.remove.mockResolvedValue(deletedCompany);

      const result = await controller.remove('rental-123');

      expect(result).toEqual(deletedCompany);
      expect(mockRentalCompaniesService.remove).toHaveBeenCalledWith('rental-123');
    });
  });
});
