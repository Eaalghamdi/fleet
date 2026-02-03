import apiClient from './client';
import type { LoginResponse, User } from './types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  resetPassword: async (userId: string, newPassword: string): Promise<void> => {
    await apiClient.post(`/auth/reset-password/${userId}`, { password: newPassword });
  },
};

export default authApi;
