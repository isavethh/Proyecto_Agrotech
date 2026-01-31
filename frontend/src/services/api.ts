import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si es error 401 y no es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          // Intentar refrescar el token
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

          // Actualizar tokens en el store
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);

          // Reintentar la petición original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        } catch {
          // Si falla el refresh, cerrar sesión
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Tipos de respuesta
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Funciones helper
export async function get<T>(url: string, params?: object): Promise<ApiResponse<T>> {
  const response = await api.get<ApiResponse<T>>(url, { params });
  return response.data;
}

export async function post<T>(url: string, data?: object): Promise<ApiResponse<T>> {
  const response = await api.post<ApiResponse<T>>(url, data);
  return response.data;
}

export async function put<T>(url: string, data?: object): Promise<ApiResponse<T>> {
  const response = await api.put<ApiResponse<T>>(url, data);
  return response.data;
}

export async function patch<T>(url: string, data?: object): Promise<ApiResponse<T>> {
  const response = await api.patch<ApiResponse<T>>(url, data);
  return response.data;
}

export async function del<T>(url: string): Promise<ApiResponse<T>> {
  const response = await api.delete<ApiResponse<T>>(url);
  return response.data;
}
