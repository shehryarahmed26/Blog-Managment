import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import axios from 'axios';
import {
  getRefreshToken,
  setAccessToken,
  setOnUnauthorized,
  setRefreshToken,
} from '../api/client';
import { authApi } from '../api/endpoints';
import { config } from '../config';
import { API_ENDPOINTS } from '../constants/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: if we have a refresh token, exchange it for an access token and fetch /me.
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const rt = getRefreshToken();
      if (!rt) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${config.api.baseURL}${API_ENDPOINTS.auth.refresh}`,
          { refreshToken: rt }
        );
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);

        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch {
        setAccessToken(null);
        setRefreshToken(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setAccessToken(res.accessToken);
    setRefreshToken(res.refreshToken);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await authApi.register({ name, email, password });
      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken);
      setUser(res.user);
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
