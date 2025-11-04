import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import type { ApiError } from "@/src/core/entities";

// Get backend URL from environment variables
// In production, this should be the full backend URL
// In development, we can use the Next.js proxy (/api)
const getBaseURL = () => {
  // Check if we're in the browser
  if (typeof window !== "undefined") {
    // Debug: Log all env vars
    console.log("🔍 Environment variables:", {
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    });

    // Use environment variable if available (production)
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BASE_URL;

    if (backendUrl) {
      console.log("✅ Using backend URL:", backendUrl);
      const fullUrl = `${backendUrl}/api`;
      console.log("📍 Full API URL:", fullUrl);
      return fullUrl;
    }

    console.warn("⚠️ No NEXT_PUBLIC_BACKEND_URL found! Using proxy fallback.");
  }

  // Fallback to Next.js proxy (development)
  console.log("🔗 Using Next.js proxy: /api");
  return "/api";
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add token from cookie
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = Cookies.get("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear cookies and redirect to login
      if (typeof window !== "undefined") {
        Cookies.remove("accessToken");
        Cookies.remove("user");
        window.location.href = "/login";
      }
    }

    // Check if we got HTML instead of JSON (wrong backend URL)
    const contentType = error.response?.headers["content-type"];
    if (contentType && contentType.includes("text/html")) {
      console.error(
        "❌ Received HTML instead of JSON. Check NEXT_PUBLIC_BACKEND_URL!"
      );
      console.error("Current baseURL:", apiClient.defaults.baseURL);
      console.error("Request URL:", error.config?.url);

      return Promise.reject({
        success: false,
        statusCode: 500,
        message:
          "Error de configuración: Verifica que NEXT_PUBLIC_BACKEND_URL apunte al backend correcto",
        timestamp: new Date().toISOString(),
        path: error.config?.url || "",
      });
    }

    // Return the error response in a consistent format
    const apiError: ApiError = error.response?.data || {
      success: false,
      statusCode: error.response?.status || 500,
      message: error.message || "Error desconocido",
      timestamp: new Date().toISOString(),
      path: error.config?.url || "",
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;
