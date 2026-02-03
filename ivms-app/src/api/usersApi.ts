import apiClient from './client';
import type { User, CreateUserDto, UpdateUserDto } from './types';

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<User> => {
    const response = await apiClient.delete<User>(`/users/${id}`);
    return response.data;
  },
};

export default usersApi;
