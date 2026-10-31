import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setCsrfToken } from '@/services/api';
import type { SavedReflection, User } from '@/types';
import { storage, STORAGE_KEYS } from '@/utils/format';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; accept_privacy: boolean }) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: User | null) => void;
  /** Saves a guest reflection (from localStorage) to the account; returns the new id or null. */
  savePendingReflection: () => Promise<number | null>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<{ user: User | null; csrf_token: string }>('/auth/me');
      setCsrfToken(res.csrf_token);
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ user: User; csrf_token: string }>('/auth/login', { email, password });
    setCsrfToken(res.csrf_token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; accept_privacy: boolean }) => {
    const res = await api.post<{ user: User; csrf_token: string }>('/auth/register', data);
    setCsrfToken(res.csrf_token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      // Fetch a fresh anonymous CSRF token for the new session.
      void refresh();
    }
  }, [refresh]);

  const savePendingReflection = useCallback(async () => {
    const pending = storage.get<{ answers: Record<string, number | string> }>(STORAGE_KEYS.guestResult);
    if (!pending?.answers) return null;
    try {
      const saved = await api.post<SavedReflection>('/reflections', { answers: pending.answers });
      storage.remove(STORAGE_KEYS.guestResult);
      return saved.id;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, setUser, savePendingReflection }),
    [user, loading, login, register, logout, refresh, savePendingReflection],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
