import { create } from "zustand";
import Cookies from "js-cookie";
import type { User, LoginDto } from "@/src/core/entities";
import { authApi } from "@/src/infrastructure/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => void;
}

// Helper to get user from cookie
const getUserFromCookie = (): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const userStr = Cookies.get("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Error parsing user cookie:", e);
  }

  return null;
};

// Check if token exists
const hasToken = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!Cookies.get("accessToken");
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initializeAuth: () => {
    const user = getUserFromCookie();
    const hasValidToken = hasToken();

    if (user && hasValidToken) {
      set({
        user,
        isAuthenticated: true,
      });
    }
  },

  login: async (credentials: LoginDto) => {
    // Prevent race condition - if already loading, return
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const response = await authApi.login(credentials);

      // Store token in HTTP-only cookie (7 days)
      Cookies.set("accessToken", response.accessToken, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Store user in regular cookie (for client-side access)
      Cookies.set("user", JSON.stringify(response.user), {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : String(error) || "Error al iniciar sesión",
      });
      throw error;
    }
  },

  logout: () => {
    // Remove cookies
    Cookies.remove("accessToken");
    Cookies.remove("user");

    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
