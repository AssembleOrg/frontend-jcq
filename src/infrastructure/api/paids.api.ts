import type {
  ApiResponse,
  Paid,
  CreatePaidDto,
  UpdatePaidDto,
  PaidFilters,
} from '@/src/core/entities';
import apiClient from './client';

export const paidsApi = {
  async getAll(filters?: Omit<PaidFilters, 'page' | 'limit'>): Promise<Paid[]> {
    const { data } = await apiClient.get<ApiResponse<Paid[]>>('/paids', { params: filters });
    return data.data;
  },

  async getPaginated(filters?: PaidFilters): Promise<ApiResponse<Paid[]>> {
    const { data } = await apiClient.get<ApiResponse<Paid[]>>('/paids/pagination', {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<Paid> {
    const { data } = await apiClient.get<ApiResponse<Paid>>(`/paids/${id}`);
    return data.data;
  },

  async getByProject(projectId: string): Promise<Paid[]> {
    const { data } = await apiClient.get<ApiResponse<Paid[]>>(`/paids/project/${projectId}`);
    return data.data;
  },

  async create(paidData: CreatePaidDto): Promise<Paid> {
    const { data } = await apiClient.post<ApiResponse<Paid>>('/paids', paidData);
    return data.data;
  },

  async update(id: string, paidData: UpdatePaidDto): Promise<Paid> {
    const { data } = await apiClient.patch<ApiResponse<Paid>>(`/paids/${id}`, paidData);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/paids/${id}`);
  },
};

