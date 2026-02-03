import apiClient from './client';
import type { AuditLog } from './types';

export interface AuditFilter {
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

export const auditApi = {
  getAll: async (filters?: AuditFilter): Promise<AuditLog[]> => {
    const params = new URLSearchParams();
    if (filters?.action) params.append('action', filters.action);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get<AuditLog[]>('/audit/logs', { params });
    return response.data;
  },

  getByEntity: async (entityType: string, entityId: string): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>(`/audit/entity/${entityType}/${entityId}`);
    return response.data;
  },
};

export default auditApi;
