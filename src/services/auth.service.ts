import api from './api';
import { User, UserRole } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
  requiresVerification?: boolean;
}

export interface RegisterCustomerData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Registro de cliente para tienda online
  async registerCustomer(data: RegisterCustomerData): Promise<{ message: string; email: string }> {
    const response = await api.post('/auth/register-customer', data);
    return response.data;
  },

  // Enviar código de verificación por email
  async sendVerificationCode(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/send-verification-code', { email });
    return response.data;
  },

  // Verificar código de confirmación
  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/verify-email', { email, code });
    return response.data;
  },

  // Reenviar código de verificación
  async resendVerificationCode(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/resend-verification-code', { email });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile', data);
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { oldPassword, newPassword });
  },

  // Recuperación de contraseña
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { email, code, newPassword });
    return response.data;
  },
};
