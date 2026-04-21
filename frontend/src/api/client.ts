import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config';
import { STORAGE_KEYS } from '../constants/storage';
import { API_ENDPOINTS } from '../constants/api';

// Access token lives in memory; refresh token in localStorage.
let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function getAccessToken(): string | null {
  return accessToken;
}
export function setRefreshToken(token: string | null) {
  if (token === null) localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  else localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}
export function setOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn;
}

export const api = axios.create({
  baseURL: config.api.baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((request) => {
  if (accessToken && request.headers) {
    request.headers.Authorization = `Bearer ${accessToken}`;
  }
  return request;
});

// Single-flight refresh so concurrent 401s only refresh once.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  const rt = getRefreshToken();
  if (!rt) return null;

  refreshInFlight = (async () => {
    try {
      const res = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${config.api.baseURL}${API_ENDPOINTS.auth.refresh}`,
        { refreshToken: rt }
      );
      setAccessToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      return res.data.accessToken;
    } catch {
      setAccessToken(null);
      setRefreshToken(null);
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh on the refresh endpoint itself.
    if (original.url?.includes(API_ENDPOINTS.auth.refresh)) {
      return Promise.reject(error);
    }

    original._retry = true;
    const newToken = await refreshAccessToken();
    if (!newToken) {
      onUnauthorized?.();
      return Promise.reject(error);
    }
    original.headers = {
      ...(original.headers ?? {}),
      Authorization: `Bearer ${newToken}`,
    };
    return api(original) as unknown as AxiosResponse;
  }
);

export function getApiErrorMessage(err: unknown, fallback = 'Unexpected error'): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
}
