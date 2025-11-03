import type {
  ApiResponse,
  AuthResponse,
  LoginDto,
  RegisterDto,
} from "@/src/core/entities";
import apiClient from "./client";

// Backend response structure (flat user data)
interface BackendAuthResponse {
  accessToken: string;
  userId: string;
  email: string;
  role: "ADMIN" | "SUBADMIN" | "MANAGER";
  firstName: string;
  lastName: string;
}

export const authApi = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<BackendAuthResponse>>(
      "/auth/login",
      credentials
    );

    // Transform backend response to expected AuthResponse format
    const backendData = data.data;
    return {
      accessToken: backendData.accessToken,
      user: {
        id: backendData.userId,
        email: backendData.email,
        firstName: backendData.firstName,
        lastName: backendData.lastName,
        role: backendData.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    };
  },

  async register(userData: RegisterDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<BackendAuthResponse>>(
      "/auth/register",
      userData
    );

    // Transform backend response to expected AuthResponse format
    const backendData = data.data;
    return {
      accessToken: backendData.accessToken,
      user: {
        id: backendData.userId,
        email: backendData.email,
        firstName: backendData.firstName,
        lastName: backendData.lastName,
        role: backendData.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    };
  },
};
