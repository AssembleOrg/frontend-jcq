import { create } from 'zustand';
import type {
  Staff,
  CreateStaffDto,
  UpdateStaffDto,
  StaffFilters,
  PaginationMeta,
} from '@/src/core/entities';
import { staffApi } from '@/src/infrastructure/api/staff.api'; 

interface StaffState {
  staffList: Staff[];
  selectedStaff: Staff | null;
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  lastFetchTimestamp: number;

  // Actions
  fetchStaff: (filters?: StaffFilters) => Promise<void>;
  createStaff: (data: CreateStaffDto) => Promise<Staff>;
  updateStaff: (id: string, data: UpdateStaffDto) => Promise<Staff>;
  deleteStaff: (id: string) => Promise<void>;
  setSelectedStaff: (staff: Staff | null) => void;
  clearError: () => void;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staffList: [],
  selectedStaff: null,
  meta: null,
  isLoading: false,
  error: null,
  lastFetchTimestamp: 0,

  fetchStaff: async (filters?: StaffFilters) => {
    const currentTimestamp = Date.now();
    
    if (get().isLoading && currentTimestamp - get().lastFetchTimestamp < 1000) {
      return;
    }

    set({ isLoading: true, error: null, lastFetchTimestamp: currentTimestamp });

    try {
      const staffData = await staffApi.getAll(filters);
      
      if (currentTimestamp >= get().lastFetchTimestamp) {
        set({
          staffList: staffData,
          isLoading: false,
        });
      }
    } catch (error: unknown) {
      if (currentTimestamp >= get().lastFetchTimestamp) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : String(error) || 'Error al cargar personal',
        });
      }
    }
  },

  createStaff: async (data: CreateStaffDto) => {
    set({ isLoading: true, error: null });

    try {
      const newStaff = await staffApi.create(data);
      
      set((state) => ({
        staffList: [newStaff, ...state.staffList],
        isLoading: false,
      }));

      return newStaff;
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : String(error) || 'Error al crear personal',
      });
      throw error;
    }
  },

  updateStaff: async (id: string, data: UpdateStaffDto) => {
     set({ isLoading: true, error: null });
         try {
           const updatedStaff = await staffApi.update(id, data);
           set((state) => ({
             staff: state.staffList.map((c) => (c.id === id ? updatedStaff : c)),
             selectedStaff: state.selectedStaff?.id === id ? updatedStaff : state.selectedStaff,
             isLoading: false,
           }));
     
           return updatedStaff;
         } catch (error: unknown) {
           set({
             isLoading: false,
             error: error instanceof Error ? error.message : String(error) || 'Error al actualizar empleado',
           });
           throw error;
         }
  },

  deleteStaff: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
          await staffApi.delete(id);
          set((state) => ({
            staff: state.staffList.filter((c) => c.id !== id),
            selectedStaff: state.selectedStaff?.id === id ? null : state.selectedStaff,
            isLoading: false,
          }));
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : String(error) || 'Error al eliminar empleado',
          });
          throw error;
        }
  },

  setSelectedStaff: (staff: Staff | null) => set({ selectedStaff: staff }),
  clearError: () => set({ error: null }),
}));