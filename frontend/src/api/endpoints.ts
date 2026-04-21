import { api } from './client';
import { API_ENDPOINTS } from '../constants/api';
import type {
  AuthResponse,
  Comment,
  Post,
  PostInput,
  PostListFilters,
  PostListResponse,
  PostStatus,
  Stats,
  User,
} from '../types';

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>(API_ENDPOINTS.auth.register, body).then((r) => r.data),
  login: (body: { email: string; password: string }) =>
    api.post<AuthResponse>(API_ENDPOINTS.auth.login, body).then((r) => r.data),
  me: () => api.get<{ user: User }>(API_ENDPOINTS.auth.me).then((r) => r.data.user),
};

export const postsApi = {
  listPublic: (filters: PostListFilters = {}) =>
    api
      .get<PostListResponse>(API_ENDPOINTS.posts.base, { params: filters })
      .then((r) => r.data),
  listMine: (filters: PostListFilters = {}) =>
    api
      .get<PostListResponse>(API_ENDPOINTS.posts.mine, { params: filters })
      .then((r) => r.data),
  get: (id: string) =>
    api.get<{ post: Post }>(API_ENDPOINTS.posts.byId(id)).then((r) => r.data.post),
  create: (body: PostInput) =>
    api.post<{ post: Post }>(API_ENDPOINTS.posts.base, body).then((r) => r.data.post),
  update: (id: string, body: Partial<PostInput>) =>
    api.put<{ post: Post }>(API_ENDPOINTS.posts.byId(id), body).then((r) => r.data.post),
  remove: (id: string) =>
    api.delete<{ message: string }>(API_ENDPOINTS.posts.byId(id)).then((r) => r.data),
  setStatus: (id: string, status: PostStatus) =>
    api
      .patch<{ post: Post }>(API_ENDPOINTS.posts.status(id), { status })
      .then((r) => r.data.post),
  stats: () => api.get<Stats>(API_ENDPOINTS.stats.posts).then((r) => r.data),
};

export const commentsApi = {
  list: (postId: string) =>
    api
      .get<{ comments: Comment[] }>(API_ENDPOINTS.posts.comments(postId))
      .then((r) => r.data.comments),
  create: (postId: string, content: string) =>
    api
      .post<{ comment: Comment }>(API_ENDPOINTS.posts.comments(postId), { content })
      .then((r) => r.data.comment),
};
