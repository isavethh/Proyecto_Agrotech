import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: string;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean; tempToken?: string }>;
  verify2FA: (tempToken: string, code: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (token: string, refreshToken: string) => void;
  loadUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  departamento?: string;
  comunidad?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const data = response.data.data;

        if (data.requires2FA) {
          return { requires2FA: true, tempToken: data.tempToken };
        }

        set({
          user: data.user,
          token: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          isAuthenticated: true,
        });

        return {};
      },

      verify2FA: async (tempToken: string, code: string) => {
        const response = await api.post('/auth/verify-2fa', {
          tempToken,
          token: code,
        });
        const data = response.data.data;

        set({
          user: data.user,
          token: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      register: async (data: RegisterData) => {
        await api.post('/auth/register', data);
      },

      logout: async () => {
        try {
          if (get().token) {
            await api.post('/auth/logout');
          }
        } catch {
          // Ignorar errores de logout
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      setTokens: (token: string, refreshToken: string) => {
        set({ token, refreshToken });
      },

      loadUser: async () => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          const response = await api.get('/auth/profile');
          set({
            user: response.data.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loadUser();
        }
      },
    }
  )
);
