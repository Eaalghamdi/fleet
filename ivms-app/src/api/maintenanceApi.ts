import apiClient from './client';
import type { MaintenanceRequest, CreateMaintenanceDto, TriageMaintenanceDto, MaintenanceStatus } from './types';

export interface MaintenanceFilter {
  status?: MaintenanceStatus;
  carId?: string;
}

export const maintenanceApi = {
  getAll: async (filters?: MaintenanceFilter): Promise<MaintenanceRequest[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.carId) params.append('carId', filters.carId);

    const response = await apiClient.get<MaintenanceRequest[]>('/maintenance', { params });
    return response.data;
  },

  getById: async (id: string): Promise<MaintenanceRequest> => {
    const response = await apiClient.get<MaintenanceRequest>(`/maintenance/${id}`);
    return response.data;
  },

  create: async (data: CreateMaintenanceDto): Promise<MaintenanceRequest> => {
    const response = await apiClient.post<MaintenanceRequest>('/maintenance', data);
    return response.data;
  },

  triage: async (id: string, data: TriageMaintenanceDto): Promise<MaintenanceRequest> => {
    const response = await apiClient.post<MaintenanceRequest>(`/maintenance/${id}/triage`, data);
    return response.data;
  },

  approve: async (id: string): Promise<MaintenanceRequest> => {
    const response = await apiClient.post<MaintenanceRequest>(`/maintenance/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, reason: string): Promise<MaintenanceRequest> => {
    const response = await apiClient.post<MaintenanceRequest>(`/maintenance/${id}/reject`, {
      rejectionReason: reason,
    });
    return response.data;
  },

  start: async (id: string): Promise<MaintenanceRequest> => {
    const response = await apiClient.post<MaintenanceRequest>(`/maintenance/${id}/start`);
    return response.data;
  },

  complete: async (id: string): Promise<MaintenanceRequest> => {
    const response = await apiClient.post<MaintenanceRequest>(`/maintenance/${id}/complete`);
    return response.data;
  },

  // Parts management
  requestParts: async (id: string, partIds: string[]): Promise<void> => {
    await apiClient.post(`/maintenance/${id}/request-parts`, { partIds });
  },

  assignParts: async (id: string, partIds: string[]): Promise<void> => {
    await apiClient.post(`/maintenance/${id}/assign-parts`, { partIds });
  },
};

export default maintenanceApi;
