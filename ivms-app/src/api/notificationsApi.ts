import apiClient from './client';
import type { Notification } from './types';

export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },

  dismiss: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },
};

export default notificationsApi;
