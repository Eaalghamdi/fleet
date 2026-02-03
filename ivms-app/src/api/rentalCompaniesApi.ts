import apiClient from './client';
import type { RentalCompany, CreateRentalCompanyDto, UpdateRentalCompanyDto } from './types';

export const rentalCompaniesApi = {
  getAll: async (includeInactive = false): Promise<RentalCompany[]> => {
    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', 'true');

    const response = await apiClient.get<RentalCompany[]>('/rental-companies', { params });
    return response.data;
  },

  getForDropdown: async (): Promise<Pick<RentalCompany, 'id' | 'name'>[]> => {
    const response = await apiClient.get<Pick<RentalCompany, 'id' | 'name'>[]>('/rental-companies/dropdown');
    return response.data;
  },

  getById: async (id: string): Promise<RentalCompany> => {
    const response = await apiClient.get<RentalCompany>(`/rental-companies/${id}`);
    return response.data;
  },

  create: async (data: CreateRentalCompanyDto): Promise<RentalCompany> => {
    const response = await apiClient.post<RentalCompany>('/rental-companies', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRentalCompanyDto): Promise<RentalCompany> => {
    const response = await apiClient.patch<RentalCompany>(`/rental-companies/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<RentalCompany> => {
    const response = await apiClient.delete<RentalCompany>(`/rental-companies/${id}`);
    return response.data;
  },
};

export default rentalCompaniesApi;
