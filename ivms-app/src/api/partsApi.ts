import apiClient from './client';
import type { Part, CreatePartDto, UpdatePartDto, PurchaseRequest, CreatePurchaseRequestDto, CarType, TrackingMode } from './types';

export interface PartsFilter {
  carType?: CarType;
  trackingMode?: TrackingMode;
}

export const partsApi = {
  getAll: async (filters?: PartsFilter): Promise<Part[]> => {
    const params = new URLSearchParams();
    if (filters?.carType) params.append('carType', filters.carType);
    if (filters?.trackingMode) params.append('trackingMode', filters.trackingMode);

    const response = await apiClient.get<Part[]>('/parts', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Part> => {
    const response = await apiClient.get<Part>(`/parts/${id}`);
    return response.data;
  },

  create: async (data: CreatePartDto): Promise<Part> => {
    const response = await apiClient.post<Part>('/parts', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePartDto): Promise<Part> => {
    const response = await apiClient.patch<Part>(`/parts/${id}`, data);
    return response.data;
  },

  requestDelete: async (id: string): Promise<void> => {
    await apiClient.post(`/parts/${id}/delete-request`);
  },

  // Purchase Requests
  getPurchaseRequests: async (): Promise<PurchaseRequest[]> => {
    const response = await apiClient.get<PurchaseRequest[]>('/purchase-requests');
    return response.data;
  },

  createPurchaseRequest: async (data: CreatePurchaseRequestDto): Promise<PurchaseRequest> => {
    const response = await apiClient.post<PurchaseRequest>('/purchase-requests', data);
    return response.data;
  },

  approvePurchaseRequest: async (id: string): Promise<PurchaseRequest> => {
    const response = await apiClient.post<PurchaseRequest>(`/purchase-requests/${id}/approve`);
    return response.data;
  },

  rejectPurchaseRequest: async (id: string, reason: string): Promise<PurchaseRequest> => {
    const response = await apiClient.post<PurchaseRequest>(`/purchase-requests/${id}/reject`, {
      rejectionReason: reason,
    });
    return response.data;
  },
};

export default partsApi;
