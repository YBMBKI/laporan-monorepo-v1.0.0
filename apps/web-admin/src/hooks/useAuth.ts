import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        const { access_token, user } = response.data;
        set({ user, token: access_token, isAuthenticated: true, isLoading: false });
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        delete api.defaults.headers.common['Authorization'];
      },
      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          try {
            const response = await api.get('/auth/me');
            set({ user: response.data, isAuthenticated: true, isLoading: false });
          } catch {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
