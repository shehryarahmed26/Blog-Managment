export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EDITOR_NEW: '/editor',
  EDITOR_EDIT: (id: string) => `/editor/${id}`,
  POST_DETAIL: (id: string) => `/posts/${id}`,
  POST_DETAIL_PATTERN: '/posts/:id',
  EDITOR_EDIT_PATTERN: '/editor/:id',
  NOT_FOUND: '*',
} as const;
