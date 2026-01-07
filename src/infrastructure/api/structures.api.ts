
import type {
  ApiResponse,
  Structure,
  CreateStructureDto,
  UpdateStructureDto,
  StructureFilters,
  StructureCategory,
  CreateStructureCategoryDto,
  UpdateStructureCategoryDto,
  StructureCategoryFilters,
} from '@/src/core/entities'; 
import apiClient from './client';

export const structuresApi = {
  
  // CATEGORY ENDPOINTS
  
  async createCategory(data: CreateStructureCategoryDto): Promise<StructureCategory> {
    const { data: response } = await apiClient.post<ApiResponse<StructureCategory>>('/structures/categories', data);
    return response.data;
  },

  async getAllCategories(filters?: StructureCategoryFilters): Promise<StructureCategory[]> {
    const { data } = await apiClient.get<ApiResponse<StructureCategory[]>>('/structures/categories', { 
      params: filters 
    });
    return data.data;
  },

  async updateCategory(id: string, data: UpdateStructureCategoryDto): Promise<StructureCategory> {
    const { data: response } = await apiClient.patch<ApiResponse<StructureCategory>>(`/structures/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/structures/categories/${id}`);
  },

  // STRUCTURE ENDPOINTS
  
  async getAll(filters?: StructureFilters): Promise<Structure[]> {
    const { data } = await apiClient.get<ApiResponse<Structure[]>>('/structures', { 
      params: filters 
    });
    return data.data;
  },

  async getById(id: string): Promise<Structure> {
    const { data } = await apiClient.get<ApiResponse<Structure>>(`/structures/${id}`);
    return data.data;
  },

  async create(structureData: CreateStructureDto): Promise<Structure> {
    const { data } = await apiClient.post<ApiResponse<Structure>>('/structures', structureData);
    return data.data;
  },

  async getPaginated(filters?: StructureFilters): Promise<{ data: Structure[]; meta: any }> {
    const { data } = await apiClient.get<ApiResponse<Structure[]>>('/structures/pagination', {
      params: filters,
    });
    return {
      data: data.data,
      meta: (data as any).meta, 
    };
  },

  async update(id: string, structureData: UpdateStructureDto): Promise<Structure> {
    const { data } = await apiClient.patch<ApiResponse<Structure>>(`/structures/${id}`, structureData);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/structures/${id}`);
  },

  async getUsage(structureId: string): Promise<any> {
    const { data } = await apiClient.get<ApiResponse<any>>(`/structures/${structureId}/usage`);
    return data.data;
  }
};