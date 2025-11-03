import { create } from 'zustand';
import type {
  Client,
  CreateClientDto,
  UpdateClientDto,
  ClientFilters,
  PaginationMeta,
} from '@/src/core/entities';
import { clientsApi } from '@/src/infrastructure/api';

interface ClientsState {
  clients: Client[];
  selectedClient: Client | null;
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  lastFetchTimestamp: number;

  // Actions
  fetchClients: (filters?: ClientFilters) => Promise<void>;
  fetchAllClients: () => Promise<void>;
  fetchClientById: (id: string) => Promise<void>;
  createClient: (data: CreateClientDto) => Promise<Client>;
  updateClient: (id: string, data: UpdateClientDto) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  setSelectedClient: (client: Client | null) => void;
  clearError: () => void;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  selectedClient: null,
  meta: null,
  isLoading: false,
  error: null,
  lastFetchTimestamp: 0,

  fetchClients: async (filters?: ClientFilters) => {
    const currentTimestamp = Date.now();
    
    // Prevent race condition
    if (get().isLoading && currentTimestamp - get().lastFetchTimestamp < 1000) {
      return;
    }

    set({ isLoading: true, error: null, lastFetchTimestamp: currentTimestamp });

    try {
      const response = await clientsApi.getPaginated(filters);
      
      // Only update if this is still the most recent request
      if (currentTimestamp >= get().lastFetchTimestamp) {
        set({
          clients: response.data,
          meta: response.meta,
          isLoading: false,
        });
      }
    } catch (error: any) {
      if (currentTimestamp >= get().lastFetchTimestamp) {
        set({
          isLoading: false,
          error: error.message || 'Error al cargar clientes',
        });
      }
    }
  },

  fetchAllClients: async () => {
    set({ isLoading: true, error: null });

    try {
      const clients = await clientsApi.getAll();
      set({
        clients,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al cargar clientes',
      });
    }
  },

  fetchClientById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const client = await clientsApi.getById(id);
      set({
        selectedClient: client,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al cargar cliente',
      });
    }
  },

  createClient: async (data: CreateClientDto) => {
    set({ isLoading: true, error: null });

    try {
      const newClient = await clientsApi.create(data);
      
      // Add to list atomically
      set((state) => ({
        clients: [newClient, ...state.clients],
        isLoading: false,
      }));

      return newClient;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al crear cliente',
      });
      throw error;
    }
  },

  updateClient: async (id: string, data: UpdateClientDto) => {
    set({ isLoading: true, error: null });

    try {
      const updatedClient = await clientsApi.update(id, data);
      
      // Update in list atomically
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? updatedClient : c)),
        selectedClient: state.selectedClient?.id === id ? updatedClient : state.selectedClient,
        isLoading: false,
      }));

      return updatedClient;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al actualizar cliente',
      });
      throw error;
    }
  },

  deleteClient: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await clientsApi.delete(id);
      
      // Remove from list atomically
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al eliminar cliente',
      });
      throw error;
    }
  },

  setSelectedClient: (client: Client | null) => set({ selectedClient: client }),
  clearError: () => set({ error: null }),
}));

