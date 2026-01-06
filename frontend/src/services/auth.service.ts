import api, { ApiResponse } from "./api";
import { Customer, LoginResponse, RegisterData } from "../types";

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Use unified login endpoint that checks both admin and customer tables
    const response = await api.post<LoginResponse>("/login", {
      email,
      password,
    });
    return response.data;
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/customer/register", data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/customer/logout");
  },

  async getProfile(): Promise<ApiResponse<Customer>> {
    const response = await api.get<ApiResponse<Customer>>("/customer/me");
    return response.data;
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post<ApiResponse<{ token: string }>>(
      "/customer/refresh"
    );
    return response.data.data;
  },
};

export default authService;
