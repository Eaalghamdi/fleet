import apiClient from './client';
import type { Car, CreateCarDto, UpdateCarDto, CarInventoryRequest, CarStatus, CarType } from './types';

export interface CarsFilter {
  status?: CarStatus;
  type?: CarType;
}

export const carsApi = {
  getAll: async (filters?: CarsFilter): Promise<Car[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);

    const response = await apiClient.get<Car[]>('/cars', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Car> => {
    const response = await apiClient.get<Car>(`/cars/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateCarDto): Promise<Car> => {
    const response = await apiClient.patch<Car>(`/cars/${id}`, data);
    return response.data;
  },

  // Car Inventory Requests
  requestAdd: async (data: CreateCarDto, reason?: string): Promise<CarInventoryRequest> => {
    const response = await apiClient.post<CarInventoryRequest>('/car-inventory-requests/add', {
      carData: data,
      reason,
    });
    return response.data;
  },

  requestDelete: async (carId: string, reason?: string): Promise<CarInventoryRequest> => {
    const response = await apiClient.post<CarInventoryRequest>('/car-inventory-requests/delete', {
      carId,
      reason,
    });
    return response.data;
  },

  getPendingRequests: async (): Promise<CarInventoryRequest[]> => {
    const response = await apiClient.get<CarInventoryRequest[]>('/car-inventory-requests');
    return response.data;
  },

  approveRequest: async (id: string): Promise<CarInventoryRequest> => {
    const response = await apiClient.post<CarInventoryRequest>(`/car-inventory-requests/${id}/approve`);
    return response.data;
  },

  rejectRequest: async (id: string, reason: string): Promise<CarInventoryRequest> => {
    const response = await apiClient.post<CarInventoryRequest>(`/car-inventory-requests/${id}/reject`, {
      rejectionReason: reason,
    });
    return response.data;
  },

  getMaintenanceSchedule: async (carId: string): Promise<unknown> => {
    const response = await apiClient.get(`/cars/${carId}/maintenance-schedule`);
    return response.data;
  },
};

export default carsApi;
