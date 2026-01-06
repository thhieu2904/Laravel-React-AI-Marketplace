import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";
import { useSessionStore } from "./sessionStore";

interface Admin {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

interface AdminAuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Use unified login endpoint
          const response = await api.post("/login", { email, password });
          const data = response.data.data;
          
          // Check if this is actually an admin
          if (data.user_type !== 'admin') {
            throw new Error('Tài khoản không có quyền admin');
          }
          
          const admin = data.user || data.admin;
          const token = data.token;

          // Store token for admin requests
          localStorage.setItem("admin_token", token);
          localStorage.setItem("token", token);
          localStorage.setItem("user_type", "admin");
          
          // Clear session expired flag on successful login
          useSessionStore.getState().setSessionExpired(false);

          set({
            admin,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || "Đăng nhập thất bại",
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("admin_token");
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      fetchProfile: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const response = await api.get("/admin/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ admin: response.data.data });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
