import type {
  ApiResponse,
  User,
  CreateUserDto,
  UpdateUserDto,
  UserFilters,
} from '@/src/core/entities';
import apiClient from './client';

export const usersApi = {
  async getAll(filters?: Omit<UserFilters, 'page' | 'limit'>): Promise<User[]> {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/users', { params: filters });
    return data.data;
  },

  async getPaginated(filters?: UserFilters): Promise<ApiResponse<User[]>> {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/users/pagination', {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  },

  async create(userData: CreateUserDto): Promise<User> {
    const { data } = await apiClient.post<ApiResponse<User>>('/users', userData);
    return data.data;
  },

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, userData);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};

