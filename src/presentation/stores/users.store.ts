import { create } from 'zustand';
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserFilters,
  PaginationMeta,
} from '@/src/core/entities';
import { usersApi } from '@/src/infrastructure/api';

interface UsersState {
  users: User[];
  selectedUser: User | null;
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  lastFetchTimestamp: number;

  // Actions
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (data: CreateUserDto) => Promise<User>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  selectedUser: null,
  meta: null,
  isLoading: false,
  error: null,
  lastFetchTimestamp: 0,

  fetchUsers: async (filters?: UserFilters) => {
    const currentTimestamp = Date.now();
    
    // Prevent race condition
    if (get().isLoading && currentTimestamp - get().lastFetchTimestamp < 1000) {
      return;
    }

    set({ isLoading: true, error: null, lastFetchTimestamp: currentTimestamp });

    try {
      const response = await usersApi.getPaginated(filters);
      
      // Only update if this is still the most recent request
      if (currentTimestamp >= get().lastFetchTimestamp) {
        set({
          users: response.data,
          meta: response.meta,
          isLoading: false,
        });
      }
    } catch (error: any) {
      if (currentTimestamp >= get().lastFetchTimestamp) {
        set({
          isLoading: false,
          error: error.message || 'Error al cargar usuarios',
        });
      }
    }
  },

  fetchUserById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const user = await usersApi.getById(id);
      set({
        selectedUser: user,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al cargar usuario',
      });
    }
  },

  createUser: async (data: CreateUserDto) => {
    set({ isLoading: true, error: null });

    try {
      const newUser = await usersApi.create(data);
      
      // Add to list atomically
      set((state) => ({
        users: [newUser, ...state.users],
        isLoading: false,
      }));

      return newUser;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al crear usuario',
      });
      throw error;
    }
  },

  updateUser: async (id: string, data: UpdateUserDto) => {
    set({ isLoading: true, error: null });

    try {
      const updatedUser = await usersApi.update(id, data);
      
      // Update in list atomically
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u)),
        selectedUser: state.selectedUser?.id === id ? updatedUser : state.selectedUser,
        isLoading: false,
      }));

      return updatedUser;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al actualizar usuario',
      });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await usersApi.delete(id);
      
      // Remove from list atomically
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al eliminar usuario',
      });
      throw error;
    }
  },

  setSelectedUser: (user: User | null) => set({ selectedUser: user }),
  clearError: () => set({ error: null }),
}));

