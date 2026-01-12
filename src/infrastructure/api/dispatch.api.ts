import type {
    ApiResponse,
    Dispatch,
    CreateDispatchDto,
    UpdateDispatchDto,
    DispatchFilters,
} from '@/src/core/entities';
import apiClient from './client';

export const dispatchApi = {
    async getAll(filters?: DispatchFilters): Promise<Dispatch[]> {
        const { data } = await apiClient.get<ApiResponse<Dispatch[]>>('/dispatches', { params: filters });
        return data.data;
    },

    async getPaginated(filters?: DispatchFilters): Promise<ApiResponse<Dispatch[]>> {
        const { data } = await apiClient.get<ApiResponse<Dispatch[]>>('/dispatches/pagination', {
            params: filters,
        });
        return data;
    },

    async getByProject(projectId: string): Promise<Dispatch[]> {
        const { data } = await apiClient.get<ApiResponse<Dispatch[]>>('/dispatches', {
            params: { projectId },
        });
        return data.data;
    },

    async create(dispatchData: CreateDispatchDto): Promise<Dispatch> {
        const { data } = await apiClient.post<ApiResponse<Dispatch>>('/dispatches', dispatchData);
        return data.data;
    },

    async update(id: string, dispatchData: UpdateDispatchDto): Promise<Dispatch> {
        const { data } = await apiClient.patch<ApiResponse<Dispatch>>(`/dispatches/${id}`, dispatchData);
        return data.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/dispatches/${id}`);
    },
};
