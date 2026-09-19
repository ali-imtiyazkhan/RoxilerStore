import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import { User, Role } from '@roxiler/shared-types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

interface SignupData {
  name: string;
  email: string;
  address: string;
  password: string;
  role?: Role;
}

const setAuth = (user: User, token: string) => {
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return { user, token, isAuthenticated: true, isLoading: false };
};

const clearAuth = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
  return { user: null, token: null, isAuthenticated: false, isLoading: false };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set(setAuth(data.user, data.token));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true });
        try {
          const { data: response } = await api.post('/auth/signup', data);
          set(setAuth(response.user, response.token));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => set(clearAuth()),

      fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return set(clearAuth());
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/auth/me');
          set({ user: data.user, token, isAuthenticated: true });
        } catch {
          set(clearAuth());
        }
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true });
        try {
          await api.put('/auth/password', { currentPassword, newPassword });
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);

if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    useAuthStore.getState().fetchUser();
  }
}