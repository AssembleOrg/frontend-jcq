import type { ApiResponse } from '@/src/core/entities';
import type { Dolar } from '@/src/core/entities/dolar.entity';
import apiClient from './client'; 

export const dolarApi = {
  async getBlue(): Promise<Dolar> {
    const { data } = await apiClient.get<ApiResponse<Dolar>>('/dolar');
    return data.data; 
  },
};