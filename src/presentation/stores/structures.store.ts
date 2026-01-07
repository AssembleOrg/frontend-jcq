import { create } from 'zustand';
import type {
  Structure,
  CreateStructureDto,
  UpdateStructureDto,
  StructureFilters,
  PaginationMeta,
  StructureCategory,
  CreateStructureCategoryDto,
  UpdateStructureCategoryDto,
  StructureCategoryFilters,
} from '@/src/core/entities';
import { structuresApi } from '@/src/infrastructure/api/structures.api'; 
import { showToast } from '@/src/presentation/utils/toast';

// Helper to extract error message from API response
const getErrorMessage = (error: any, defaultMessage: string): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

interface StructuresState {
  structuresList: Structure[];
  selectedStructure: Structure | null;
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  lastFetchTimestamp: number;

  // Categories
  categoriesList: StructureCategory[];
  isCategoriesLoading: boolean;

  // Actions - Structures
  fetchStructures: (filters?: StructureFilters, force?: boolean) => Promise<void>;
  fetchStructuresPaginated: (filters?: StructureFilters) => Promise<void>;
  getStructureById: (id: string) => Promise<Structure | null>;
  createStructure: (data: CreateStructureDto) => Promise<Structure | null>;
  updateStructure: (id: string, data: UpdateStructureDto) => Promise<Structure | null>;
  deleteStructure: (id: string) => Promise<void>;
  setSelectedStructure: (structure: Structure | null) => void;
  clearError: () => void;

  // Actions - Categories
  fetchCategories: (filters?: StructureCategoryFilters) => Promise<void>;
  createCategory: (data: CreateStructureCategoryDto) => Promise<StructureCategory | null>;
  updateCategory: (id: string, data: UpdateStructureCategoryDto) => Promise<StructureCategory | null>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useStructuresStore = create<StructuresState>((set, get) => ({
  structuresList: [],
  selectedStructure: null,
  meta: null,
  isLoading: false,
  error: null,
  lastFetchTimestamp: 0,
  categoriesList: [],
  isCategoriesLoading: false,

  // CATEGORY ACTIONS
  
  fetchCategories: async (filters?: StructureCategoryFilters) => {
    set({ isCategoriesLoading: true });
    try {
      const data = await structuresApi.getAllCategories(filters);
      set({ categoriesList: data, isCategoriesLoading: false });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Error al cargar categorías');
      set({ isCategoriesLoading: false, error: errorMessage });
      showToast.error(errorMessage);
    }
  },

  createCategory: async (data: CreateStructureCategoryDto) => {
    set({ isCategoriesLoading: true, error: null });
    try {
      const newCategory = await structuresApi.createCategory(data);
      set((state) => ({
        categoriesList: [...state.categoriesList, newCategory],
        isCategoriesLoading: false,
      }));
      showToast.success('Categoría creada exitosamente');
      return newCategory;
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Error al crear categoría');
      set({ isCategoriesLoading: false, error: errorMessage });
      showToast.error(errorMessage);
      return null;
    }
  },

  updateCategory: async (id: string, data: UpdateStructureCategoryDto) => {
    set({ isCategoriesLoading: true, error: null });
    try {
      const updatedCategory = await structuresApi.updateCategory(id, data);
      set((state) => ({
        categoriesList: state.categoriesList.map((c) => (c.id === id ? updatedCategory : c)),
        isCategoriesLoading: false,
      }));
      showToast.success('Categoría actualizada exitosamente');
      return updatedCategory;
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Error al actualizar categoría');
      set({ isCategoriesLoading: false, error: errorMessage });
      showToast.error(errorMessage);
      return null;
    }
  },

  deleteCategory: async (id: string) => {
    set({ isCategoriesLoading: true, error: null });
    try {
      await structuresApi.deleteCategory(id);
      set((state) => ({
        categoriesList: state.categoriesList.filter((c) => c.id !== id),
        isCategoriesLoading: false,
      }));
      showToast.success('Categoría eliminada exitosamente');
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Error al eliminar categoría');
      set({ isCategoriesLoading: false, error: errorMessage });
      showToast.error(errorMessage);
    }
  },

  // STRUCTURE ACTIONS

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
        isLoading: false,
        lastFetchTimestamp: currentTimestamp,
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Error al cargar estructuras');
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  fetchStructuresPaginated: async (filters?: StructureFilters) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await structuresApi.getPaginated(filters);
      set({
        structuresList: data,
        meta,
        isLoading: false,
        lastFetchTimestamp: Date.now(),
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Error al cargar estructuras');
      set({ isLoading: false, error: errorMessage });
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
      const errorMessage = getErrorMessage(error, 'Error al obtener estructura');
      set({
        isLoading: false,
        error: errorMessage,
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
      showToast.success('Estructura creada exitosamente');
      return newStructure;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Error al crear estructura');
      set({
        isLoading: false,
        error: errorMessage,
      });
      showToast.error(errorMessage);
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
      showToast.success('Estructura actualizada exitosamente');
      return updatedStructure;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Error al actualizar estructura');
      set({
        isLoading: false,
        error: errorMessage,
      });
      showToast.error(errorMessage);
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
      showToast.success('Estructura eliminada exitosamente');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Error al eliminar estructura');
      set({
        isLoading: false,
        error: errorMessage,
      });
      showToast.error(errorMessage);
    }
  },

  setSelectedStructure: (structure) => set({ selectedStructure: structure }),
  
  clearError: () => set({ error: null }),
}));