import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useSessionStore } from "@/store/sessionStore";
import { useAdminAuthStore } from "@/store/adminAuthStore";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";

      // Don't show modal for auth endpoints (login/register) - let component handle error
      const isAuthEndpoint =
        url.includes("/login") || url.includes("/register");

      // Only show session expired modal if user was authenticated (had token in request)
      const hadAuthHeader = error.config?.headers?.Authorization;

      if (!isAuthEndpoint && hadAuthHeader) {
        // Check if this was an admin request
        const isAdminRequest = url.includes("/admin");

        if (isAdminRequest) {
          // Admin token expired - call store logout to clear both localStorage AND Zustand state
          useAdminAuthStore.getState().logout();
        } else {
          // Customer token expired - clear customer storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }

        // Show session expired modal
        useSessionStore.getState().setSessionExpired(true);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper for API responses
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
