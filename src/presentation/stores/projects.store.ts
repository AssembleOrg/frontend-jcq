import { create } from 'zustand';
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  UpdateProjectStatusDto,
  ProjectFilters,
  PaginationMeta,
} from '@/src/core/entities';
import { projectsApi } from '@/src/infrastructure/api';

interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  lastFetchTimestamp: number;

  // Actions
  fetchProjects: (filters?: ProjectFilters) => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  createProject: (data: CreateProjectDto) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectDto) => Promise<Project>;
  updateProjectStatus: (id: string, data: UpdateProjectStatusDto) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  clearError: () => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  selectedProject: null,
  meta: null,
  isLoading: false,
  error: null,
  lastFetchTimestamp: 0,

  fetchProjects: async (filters?: ProjectFilters) => {
    const currentTimestamp = Date.now();
    
    // Prevent race condition
    if (get().isLoading && currentTimestamp - get().lastFetchTimestamp < 1000) {
      return;
    }

    set({ isLoading: true, error: null, lastFetchTimestamp: currentTimestamp });

    try {
      const response = await projectsApi.getPaginated(filters);
      
      // Only update if this is still the most recent request
      if (currentTimestamp >= get().lastFetchTimestamp) {
        set({
          projects: response.data,
          meta: response.meta,
          isLoading: false,
        });
      }
    } catch (error: any) {
      if (currentTimestamp >= get().lastFetchTimestamp) {
        set({
          isLoading: false,
          error: error.message || 'Error al cargar proyectos',
        });
      }
    }
  },

  fetchProjectById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const project = await projectsApi.getById(id);
      set({
        selectedProject: project,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al cargar proyecto',
      });
    }
  },

  createProject: async (data: CreateProjectDto) => {
    set({ isLoading: true, error: null });

    try {
      const newProject = await projectsApi.create(data);
      
      // Add to list and update state atomically
      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoading: false,
      }));

      return newProject;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al crear proyecto',
      });
      throw error;
    }
  },

  updateProject: async (id: string, data: UpdateProjectDto) => {
    set({ isLoading: true, error: null });

    try {
      const updatedProject = await projectsApi.update(id, data);
      
      // Update in list atomically
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        selectedProject: state.selectedProject?.id === id ? updatedProject : state.selectedProject,
        isLoading: false,
      }));

      return updatedProject;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al actualizar proyecto',
      });
      throw error;
    }
  },

  updateProjectStatus: async (id: string, data: UpdateProjectStatusDto) => {
    set({ isLoading: true, error: null });

    try {
      const updatedProject = await projectsApi.updateStatus(id, data);
      
      // Update in list atomically
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        selectedProject: state.selectedProject?.id === id ? updatedProject : state.selectedProject,
        isLoading: false,
      }));

      return updatedProject;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al actualizar estado',
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await projectsApi.delete(id);
      
      // Remove from list atomically
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al eliminar proyecto',
      });
      throw error;
    }
  },

  setSelectedProject: (project: Project | null) => set({ selectedProject: project }),
  clearError: () => set({ error: null }),
}));

