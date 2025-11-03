import { create } from 'zustand';
import type {
  Paid,
  CreatePaidDto,
  UpdatePaidDto,
  PaidFilters,
  PaginationMeta,
} from '@/src/core/entities';
import { paidsApi } from '@/src/infrastructure/api';

interface PaidsState {
  paids: Paid[];
  selectedPaid: Paid | null;
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  lastFetchTimestamp: number;

  // Actions
  fetchPaids: (filters?: PaidFilters) => Promise<void>;
  fetchPaidsByProject: (projectId: string) => Promise<void>;
  fetchPaidById: (id: string) => Promise<void>;
  createPaid: (data: CreatePaidDto) => Promise<Paid>;
  updatePaid: (id: string, data: UpdatePaidDto) => Promise<Paid>;
  deletePaid: (id: string) => Promise<void>;
  setSelectedPaid: (paid: Paid | null) => void;
  clearError: () => void;
}

export const usePaidsStore = create<PaidsState>((set, get) => ({
  paids: [],
  selectedPaid: null,
  meta: null,
  isLoading: false,
  error: null,
  lastFetchTimestamp: 0,

  fetchPaids: async (filters?: PaidFilters) => {
    const currentTimestamp = Date.now();
    
    // Prevent race condition
    if (get().isLoading && currentTimestamp - get().lastFetchTimestamp < 1000) {
      return;
    }

    set({ isLoading: true, error: null, lastFetchTimestamp: currentTimestamp });

    try {
      const response = await paidsApi.getPaginated(filters);
      
      // Only update if this is still the most recent request
      if (currentTimestamp >= get().lastFetchTimestamp) {
        set({
          paids: response.data,
          meta: response.meta,
          isLoading: false,
        });
      }
    } catch (error: any) {
      if (currentTimestamp >= get().lastFetchTimestamp) {
        set({
          isLoading: false,
          error: error.message || 'Error al cargar pagos',
        });
      }
    }
  },

  fetchPaidsByProject: async (projectId: string) => {
    set({ isLoading: true, error: null });

    try {
      const paids = await paidsApi.getByProject(projectId);
      set({
        paids,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al cargar pagos',
      });
    }
  },

  fetchPaidById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const paid = await paidsApi.getById(id);
      set({
        selectedPaid: paid,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al cargar pago',
      });
    }
  },

  createPaid: async (data: CreatePaidDto) => {
    set({ isLoading: true, error: null });

    try {
      const newPaid = await paidsApi.create(data);
      
      // Add to list atomically
      set((state) => ({
        paids: [newPaid, ...state.paids],
        isLoading: false,
      }));

      return newPaid;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al crear pago',
      });
      throw error;
    }
  },

  updatePaid: async (id: string, data: UpdatePaidDto) => {
    set({ isLoading: true, error: null });

    try {
      const updatedPaid = await paidsApi.update(id, data);
      
      // Update in list atomically
      set((state) => ({
        paids: state.paids.map((p) => (p.id === id ? updatedPaid : p)),
        selectedPaid: state.selectedPaid?.id === id ? updatedPaid : state.selectedPaid,
        isLoading: false,
      }));

      return updatedPaid;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al actualizar pago',
      });
      throw error;
    }
  },

  deletePaid: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await paidsApi.delete(id);
      
      // Remove from list atomically
      set((state) => ({
        paids: state.paids.filter((p) => p.id !== id),
        selectedPaid: state.selectedPaid?.id === id ? null : state.selectedPaid,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al eliminar pago',
      });
      throw error;
    }
  },

  setSelectedPaid: (paid: Paid | null) => set({ selectedPaid: paid }),
  clearError: () => set({ error: null }),
}));

