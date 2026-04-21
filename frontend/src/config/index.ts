const DEFAULTS = {
  API_URL: 'http://localhost:4000',
  DEFAULT_PAGE_SIZE: 5,
  DASHBOARD_PAGE_SIZE: 10,
  SEARCH_DEBOUNCE_MS: 300,
  MAX_COMMENT_LENGTH: 1000,
  MAX_TITLE_LENGTH: 200,
  MIN_TITLE_LENGTH: 3,
  MIN_PASSWORD_LENGTH: 6,
  MIN_NAME_LENGTH: 2,
  MAX_TAG_LENGTH: 30,
  QUERY_STALE_TIME_MS: 30_000,
  QUERY_RETRY: 1,
} as const;

function env(name: string): string | undefined {
  return (import.meta.env as Record<string, string | undefined>)[name];
}

export const config = {
  api: {
    url: env('VITE_API_URL') ?? DEFAULTS.API_URL,
    baseURL: `${env('VITE_API_URL') ?? DEFAULTS.API_URL}/api`,
  },
  pagination: {
    defaultPageSize: DEFAULTS.DEFAULT_PAGE_SIZE,
    dashboardPageSize: DEFAULTS.DASHBOARD_PAGE_SIZE,
  },
  ui: {
    searchDebounceMs: DEFAULTS.SEARCH_DEBOUNCE_MS,
  },
  validation: {
    maxCommentLength: DEFAULTS.MAX_COMMENT_LENGTH,
    maxTitleLength: DEFAULTS.MAX_TITLE_LENGTH,
    minTitleLength: DEFAULTS.MIN_TITLE_LENGTH,
    minPasswordLength: DEFAULTS.MIN_PASSWORD_LENGTH,
    minNameLength: DEFAULTS.MIN_NAME_LENGTH,
    maxTagLength: DEFAULTS.MAX_TAG_LENGTH,
  },
  query: {
    staleTimeMs: DEFAULTS.QUERY_STALE_TIME_MS,
    retry: DEFAULTS.QUERY_RETRY,
  },
} as const;

export type AppConfig = typeof config;
