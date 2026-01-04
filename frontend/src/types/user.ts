// User Types
export interface Customer {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
}

export interface Admin {
  id: number;
  email: string;
  name: string;
  role: string;
}

export type User = Customer | Admin;

export interface AuthState {
  user: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  full_name: string;
  phone?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    customer: Customer;
  };
}
