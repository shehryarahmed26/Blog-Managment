export type Role = 'admin' | 'author';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type PostStatus = 'draft' | 'published';

export interface PostAuthor {
  _id: string;
  name: string;
  email?: string;
  role?: Role;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: PostAuthor;
  status: PostStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: PostAuthor;
  post: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PostListResponse {
  posts: Post[];
  pagination: Pagination;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  topAuthors: { authorId: string; name: string; email: string; postCount: number }[];
}

export interface PostListFilters {
  search?: string;
  tag?: string;
  status?: PostStatus;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  order?: 'asc' | 'desc';
}

export interface PostInput {
  title: string;
  content: string;
  tags: string[];
  status: PostStatus;
}
