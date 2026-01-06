import { create } from 'zustand';
import type {
  Structure,
  CreateStructureDto,
  UpdateStructureDto,
  StructureFilters,
  PaginationMeta, 
} from '@/src/core/entities';
import { structuresApi } from '@/src/infrastructure/api/structures.api'; 

interface StructuresState {
  structuresList: Structure[];
  selectedStructure: Structure | null;
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  lastFetchTimestamp: number;

  // Actions
  fetchStructures: (filters?: StructureFilters, force?: boolean) => Promise<void>;
  fetchStructuresPaginated: (filters?: StructureFilters, force?: boolean) => Promise<void>;
  getStructureById: (id: string) => Promise<Structure | null>;
  createStructure: (data: CreateStructureDto) => Promise<Structure | null>;
  updateStructure: (id: string, data: UpdateStructureDto) => Promise<Structure | null>;
  deleteStructure: (id: string) => Promise<void>;
  setSelectedStructure: (structure: Structure | null) => void;
  clearError: () => void;
}

export const useStructuresStore = create<StructuresState>((set, get) => ({
  structuresList: [],
  selectedStructure: null,
  meta: null,
  isLoading: false,
  error: null,
  lastFetchTimestamp: 0,

  fetchStructures: async (filters?: StructureFilters, force = false) => {
    const currentTimestamp = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos de caché

    // Si ya tenemos datos, no pasaron 5 min y no forzamos recarga -> Usamos caché
    if (
      !force &&
      get().structuresList.length > 0 &&
      currentTimestamp - get().lastFetchTimestamp < CACHE_DURATION
    ) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await structuresApi.getAll(filters);
      set({
        structuresList: data,
        // TO-DO ? AQUI SE INCLUIRIA META (PAGINACION)
        isLoading: false,
        lastFetchTimestamp: currentTimestamp,
      });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : String(error) || 'Error al cargar estructuras',
      });
    }
  },

  fetchStructuresPaginated: async (filters?: StructureFilters, force = false) => {
    const currentTimestamp = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000;

    if (
      !force &&
      get().structuresList.length > 0 &&
      currentTimestamp - get().lastFetchTimestamp < CACHE_DURATION
    ) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await structuresApi.getPaginated(filters);
      set({
        structuresList: data,
        meta,
        isLoading: false,
        lastFetchTimestamp: currentTimestamp,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Error al cargar estructuras' });
    }
  },

  getStructureById: async (id: string) => {
    const existing = get().structuresList.find(s => s.id === id);
    if (existing) {
      set({ selectedStructure: existing });
      return existing;
    }

    set({ isLoading: true, error: null });
    try {
      const structure = await structuresApi.getById(id);
      set({ selectedStructure: structure, isLoading: false });
      return structure;
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : String(error) || 'Error al obtener estructura',
      });
      return null;
    }
  },

  createStructure: async (data: CreateStructureDto) => {
    set({ isLoading: true, error: null });
    try {
      const newStructure = await structuresApi.create(data);
      set((state) => ({
        structuresList: [newStructure, ...state.structuresList], 
        isLoading: false,
      }));
      return newStructure;
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : String(error) || 'Error al crear estructura',
      });
      return null;
    }
  },

  updateStructure: async (id: string, data: UpdateStructureDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedStructure = await structuresApi.update(id, data);
      set((state) => ({
        structuresList: state.structuresList.map((s) => (s.id === id ? updatedStructure : s)),
        selectedStructure: state.selectedStructure?.id === id ? updatedStructure : state.selectedStructure,
        isLoading: false,
      }));
      return updatedStructure;
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : String(error) || 'Error al actualizar estructura',
      });
      return null;
    }
  },

  deleteStructure: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await structuresApi.delete(id);
      set((state) => ({
        structuresList: state.structuresList.filter((s) => s.id !== id),
        selectedStructure: state.selectedStructure?.id === id ? null : state.selectedStructure,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : String(error) || 'Error al eliminar estructura',
      });
    }
  },

  setSelectedStructure: (structure) => set({ selectedStructure: structure }),
  
  clearError: () => set({ error: null }),
}));