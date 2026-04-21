export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  posts: {
    base: '/posts',
    mine: '/posts/my',
    byId: (id: string) => `/posts/${id}`,
    status: (id: string) => `/posts/${id}/status`,
    comments: (id: string) => `/posts/${id}/comments`,
  },
  stats: {
    posts: '/stats/posts',
  },
} as const;
