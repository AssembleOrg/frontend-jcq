import type {
  ApiResponse,
  Client,
  CreateClientDto,
  UpdateClientDto,
  ClientFilters,
} from '@/src/core/entities';
import apiClient from './client';

export const clientsApi = {
  async getAll(filters?: Omit<ClientFilters, 'page' | 'limit'>): Promise<Client[]> {
    const { data } = await apiClient.get<ApiResponse<Client[]>>('/clients', { params: filters });
    return data.data;
  },

  async getPaginated(filters?: ClientFilters): Promise<ApiResponse<Client[]>> {
    const { data } = await apiClient.get<ApiResponse<Client[]>>('/clients/pagination', {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<Client> {
    const { data } = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);
    return data.data;
  },

  async create(clientData: CreateClientDto): Promise<Client> {
    const { data } = await apiClient.post<ApiResponse<Client>>('/clients', clientData);
    return data.data;
  },

  async update(id: string, clientData: UpdateClientDto): Promise<Client> {
    const { data } = await apiClient.patch<ApiResponse<Client>>(`/clients/${id}`, clientData);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  },
};

