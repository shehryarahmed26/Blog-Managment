import type { PostListFilters } from '../types';

export const QUERY_KEYS = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  posts: {
    all: () => ['posts'] as const,
    list: (scope: 'public' | 'mine', filters: PostListFilters) =>
      ['posts', 'list', scope, filters] as const,
    detail: (id: string) => ['posts', 'detail', id] as const,
    stats: () => ['posts', 'stats'] as const,
  },
  comments: {
    all: (postId: string) => ['comments', postId] as const,
  },
} as const;
