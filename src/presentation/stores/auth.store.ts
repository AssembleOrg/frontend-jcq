import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, LoginDto } from "@/src/core/entities";
import { authApi } from "@/src/infrastructure/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Helper para inicializar desde localStorage
const getInitialState = () => {
  if (typeof window === "undefined")
    return { user: null, accessToken: null, isAuthenticated: false };

  try {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      return {
        user: JSON.parse(userStr),
        accessToken: token,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    console.error("Error loading auth state:", e);
  }

  return { user: null, accessToken: null, isAuthenticated: false };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const initial = getInitialState();

      return {
        user: initial.user,
        accessToken: initial.accessToken,
        isAuthenticated: initial.isAuthenticated,
        isLoading: false,
        error: null,

        login: async (credentials: LoginDto) => {
          // Prevent race condition - if already loading, return
          if (get().isLoading) return;

          set({ isLoading: true, error: null });

          try {
            const response = await authApi.login(credentials);

            // Store token in localStorage for axios interceptor
            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("user", JSON.stringify(response.user));

            set({
              user: response.user,
              accessToken: response.accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || "Error al iniciar sesión",
            });
            throw error;
          }
        },

        logout: () => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");

          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null,
          });
        },

        clearError: () => set({ error: null }),
      };
    },
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
