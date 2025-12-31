import { create } from 'zustand';
import type { Dolar } from '@/src/core/entities/dolar.entity';
import { dolarApi } from '@/src/infrastructure/api/dolar.api';

interface DolarState {
  dolar: Dolar | null;
  isLoading: boolean;
  error: string | null;
  lastFetchTimestamp: number;

  fetchDolar: () => Promise<void>;
}

export const useDolarStore = create<DolarState>((set, get) => ({
  dolar: null,
  isLoading: false,
  error: null,
  lastFetchTimestamp: 0,

  fetchDolar: async () => {
    const currentTimestamp = Date.now();
    // Cache simple: si ya hay datos y pasaron menos de 5 min, no se vuelve a pedir al backend
    if (get().dolar && currentTimestamp - get().lastFetchTimestamp < 300000) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await dolarApi.getBlue();
      set({ 
        dolar: data, 
        isLoading: false,
        lastFetchTimestamp: Date.now() 
      });
    } catch (error: unknown) {
      // Fallar de manera silenciosa o guardamos el error, cosa de no romper la UI
      console.error('Error fetching dolar:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Error al obtener cotización' 
      });
    }
  },
}));