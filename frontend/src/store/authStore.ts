import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customer, RegisterData } from "../types";
import { authService } from "../services";
import { useSessionStore } from "./sessionStore";

interface AuthState {
  user: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(email, password);
          console.log('authService response:', response); // Debug
          
          // response = { success, message, data: { user, user_type, token } }
          const token = response.data?.token;
          const user = response.data?.user;
          const userType = response.data?.user_type; // 'admin' or 'customer'

          console.log('Extracted:', { token: !!token, user: !!user, userType }); // Debug

          if (!token || !user) {
            console.error('Missing data:', { token, user, userType });
            throw new Error("Invalid response from server");
          }

          console.log('Login successful, user_type:', userType);

          localStorage.setItem("token", token);
          localStorage.setItem("user_type", userType || "customer");
          
          // Clear session expired flag on successful login
          useSessionStore.getState().setSessionExpired(false);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Fetch latest profile data after login
          if (userType === 'customer') {
            get().fetchProfile().catch(() => {}); // Fetch profile but don't fail login if it errors
          }

          // Return user_type for redirect logic
          return userType;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(data);
          // API returns: { success, data: { customer, token } }
          const token = response.data?.token;
          const user = response.data?.customer;

          if (!token || !user) {
            throw new Error("Invalid response from server");
          }

          localStorage.setItem("token", token);
          
          // Clear session expired flag on successful register
          useSessionStore.getState().setSessionExpired(false);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        // Optional: call API logout
        authService.logout().catch(() => {});
      },

      fetchProfile: async () => {
        const token = get().token;
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await authService.getProfile();
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // If profile fetch fails, clear auth
          localStorage.removeItem("token");
          localStorage.removeItem("user_type");
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setToken: (token: string) => {
        localStorage.setItem("token", token);
        set({ token, isAuthenticated: true });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useAuthStore;
