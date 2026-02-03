import apiClient from './client';
import type { CarRequest, CreateCarRequestDto, AssignCarDto, CarRequestStatus } from './types';

export interface CarRequestsFilter {
  status?: CarRequestStatus;
}

export const carRequestsApi = {
  getAll: async (filters?: CarRequestsFilter): Promise<CarRequest[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get<CarRequest[]>('/car-requests', { params });
    return response.data;
  },

  getById: async (id: string): Promise<CarRequest> => {
    const response = await apiClient.get<CarRequest>(`/car-requests/${id}`);
    return response.data;
  },

  create: async (data: CreateCarRequestDto): Promise<CarRequest> => {
    const response = await apiClient.post<CarRequest>('/car-requests', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateCarRequestDto>): Promise<CarRequest> => {
    const response = await apiClient.patch<CarRequest>(`/car-requests/${id}`, data);
    return response.data;
  },

  cancel: async (id: string): Promise<CarRequest> => {
    const response = await apiClient.post<CarRequest>(`/car-requests/${id}/cancel`);
    return response.data;
  },

  assign: async (id: string, data: AssignCarDto): Promise<CarRequest> => {
    const response = await apiClient.post<CarRequest>(`/car-requests/${id}/assign`, data);
    return response.data;
  },

  approve: async (id: string): Promise<CarRequest> => {
    const response = await apiClient.post<CarRequest>(`/car-requests/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, reason: string): Promise<CarRequest> => {
    const response = await apiClient.post<CarRequest>(`/car-requests/${id}/reject`, {
      rejectionReason: reason,
    });
    return response.data;
  },

  markInTransit: async (id: string): Promise<CarRequest> => {
    const response = await apiClient.post<CarRequest>(`/car-requests/${id}/in-transit`);
    return response.data;
  },

  markReturned: async (id: string): Promise<CarRequest> => {
    const response = await apiClient.post<CarRequest>(`/car-requests/${id}/return`);
    return response.data;
  },

  // Image handling
  uploadImages: async (id: string, files: File[]): Promise<void> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    await apiClient.post(`/car-requests/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getImages: async (id: string): Promise<{ id: string; url: string }[]> => {
    const response = await apiClient.get<{ id: string; url: string }[]>(`/car-requests/${id}/images`);
    return response.data;
  },

  deleteImage: async (requestId: string, imageId: string): Promise<void> => {
    await apiClient.delete(`/car-requests/${requestId}/images/${imageId}`);
  },
};

export default carRequestsApi;
