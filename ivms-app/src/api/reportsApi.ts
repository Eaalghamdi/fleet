import apiClient from './client';
import type { GenerateReportDto, GeneratedReport } from './types';

export const reportsApi = {
  generate: async (data: GenerateReportDto): Promise<GeneratedReport> => {
    const response = await apiClient.post<GeneratedReport>('/reports/generate', data);
    return response.data;
  },

  getById: async (id: string): Promise<GeneratedReport> => {
    const response = await apiClient.get<GeneratedReport>(`/reports/${id}`);
    return response.data;
  },

  download: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/reports/${id}/download`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  downloadAndSave: async (id: string, filename?: string): Promise<void> => {
    const blob = await reportsApi.download(id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `report-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default reportsApi;
