import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";

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
          const response = await api.post("/admin/login", { email, password });
          const { admin, token } = response.data.data;

          // Store token for admin requests
          localStorage.setItem("admin_token", token);

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
            error: error.response?.data?.message || "Đăng nhập thất bại",
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
