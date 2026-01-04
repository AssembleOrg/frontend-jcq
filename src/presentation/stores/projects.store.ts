import { create } from "zustand";
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  UpdateProjectStatusDto,
  ProjectFilters,
  PaginationMeta,
} from "@/src/core/entities";
import { projectsApi } from "@/src/infrastructure/api";
import { showToast, formatErrorMessage } from "@/src/presentation/utils";

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
  updateProjectStatus: (
    id: string,
    data: UpdateProjectStatusDto
  ) => Promise<Project>;
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
    } catch (error: unknown) {
      if (currentTimestamp >= get().lastFetchTimestamp) {
        const errorMessage =
          formatErrorMessage(error) || "Error al cargar proyectos";
        set({
          isLoading: false,
          error: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage =
        formatErrorMessage(error) || "Error al cargar proyecto";
      set({
        isLoading: false,
        error: errorMessage,
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

      showToast.success("Proyecto creado exitosamente");
      return newProject;
    } catch (error: unknown) {
      const errorMessage =
        formatErrorMessage(error) || "Error al crear proyecto";
      set({
        isLoading: false,
        error: errorMessage,
      });
      showToast.error(errorMessage);
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
        selectedProject:
          state.selectedProject?.id === id
            ? updatedProject
            : state.selectedProject,
        isLoading: false,
      }));

      showToast.success("Proyecto actualizado exitosamente");
      return updatedProject;
    } catch (error: unknown) {
      const errorMessage =
        formatErrorMessage(error) || "Error al actualizar proyecto";
      set({
        isLoading: false,
        error: errorMessage,
      });
      showToast.error(errorMessage);
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
        selectedProject:
          state.selectedProject?.id === id
            ? updatedProject
            : state.selectedProject,
        isLoading: false,
      }));

      showToast.success("Estado del proyecto actualizado");
      return updatedProject;
    } catch (error: unknown) {
      const errorMessage =
        formatErrorMessage(error) || "Error al actualizar estado";
      set({
        isLoading: false,
        error: errorMessage,
      });
      showToast.error(errorMessage);
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
        selectedProject:
          state.selectedProject?.id === id ? null : state.selectedProject,
        isLoading: false,
      }));

      showToast.success("Proyecto eliminado exitosamente");
    } catch (error: unknown) {
      const errorMessage =
        formatErrorMessage(error) || "Error al eliminar proyecto";
      set({
        isLoading: false,
        error: errorMessage,
      });
      showToast.error(errorMessage);
      throw error;
    }
  },

  setSelectedProject: (project: Project | null) =>
    set({ selectedProject: project }),
  clearError: () => set({ error: null }),
}));
