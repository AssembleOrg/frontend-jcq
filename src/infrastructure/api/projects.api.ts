import type {
  ApiResponse,
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  UpdateProjectStatusDto,
  ProjectFilters,
} from '@/src/core/entities';
import apiClient from './client';

export const projectsApi = {
  async getAll(filters?: Omit<ProjectFilters, 'page' | 'limit'>): Promise<Project[]> {
    const { data } = await apiClient.get<ApiResponse<Project[]>>('/projects', { params: filters });
    return data.data;
  },

  async getPaginated(filters?: ProjectFilters): Promise<ApiResponse<Project[]>> {
    const { data } = await apiClient.get<ApiResponse<Project[]>>('/projects/pagination', {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<Project> {
    const { data } = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return data.data;
  },

  async create(projectData: CreateProjectDto): Promise<Project> {
    const { data } = await apiClient.post<ApiResponse<Project>>('/projects', projectData);
    return data.data;
  },

  async update(id: string, projectData: UpdateProjectDto): Promise<Project> {
    const { data } = await apiClient.patch<ApiResponse<Project>>(`/projects/${id}`, projectData);
    return data.data;
  },

  async updateStatus(id: string, statusData: UpdateProjectStatusDto): Promise<Project> {
    const { data } = await apiClient.patch<ApiResponse<Project>>(
      `/projects/${id}/status`,
      statusData
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};

