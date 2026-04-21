import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { postsApi } from '../api/endpoints';
import { QUERY_KEYS } from '../constants/queryKeys';
import type {
  Post,
  PostInput,
  PostListFilters,
  PostListResponse,
  PostStatus,
} from '../types';

type Scope = 'public' | 'mine';

// ------- Queries -------

export function usePostsList(scope: Scope, filters: PostListFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.posts.list(scope, filters),
    queryFn: () =>
      scope === 'mine' ? postsApi.listMine(filters) : postsApi.listPublic(filters),
    placeholderData: (prev) => prev,
  });
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.posts.detail(id) : ['posts', 'detail', 'noop'],
    queryFn: () => postsApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function usePostStats() {
  return useQuery({
    queryKey: QUERY_KEYS.posts.stats(),
    queryFn: () => postsApi.stats(),
  });
}

// ------- Mutations (with optimistic updates on list queries) -------

function allListKeys(qc: ReturnType<typeof useQueryClient>): QueryKey[] {
  return qc
    .getQueryCache()
    .findAll({ queryKey: QUERY_KEYS.posts.all() })
    .filter((q) => q.queryKey[1] === 'list')
    .map((q) => q.queryKey);
}

function prependToLists(
  qc: ReturnType<typeof useQueryClient>,
  optimistic: Post
): { previous: { key: QueryKey; data: PostListResponse | undefined }[] } {
  const snapshots: { key: QueryKey; data: PostListResponse | undefined }[] = [];
  for (const key of allListKeys(qc)) {
    const data = qc.getQueryData<PostListResponse>(key);
    snapshots.push({ key, data });
    if (data) {
      qc.setQueryData<PostListResponse>(key, {
        ...data,
        posts: [optimistic, ...data.posts],
      });
    }
  }
  return { previous: snapshots };
}

function rollback(
  qc: ReturnType<typeof useQueryClient>,
  snapshots: { key: QueryKey; data: PostListResponse | undefined }[]
) {
  for (const { key, data } of snapshots) qc.setQueryData(key, data);
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PostInput) => postsApi.create(input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.posts.all() });
      const optimistic: Post = {
        _id: `temp-${Date.now()}`,
        title: input.title,
        content: input.content,
        tags: input.tags,
        status: input.status,
        author: { _id: 'me', name: 'You' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const { previous } = prependToLists(qc, optimistic);
      return { previous, tempId: optimistic._id };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) rollback(qc, ctx.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.posts.all() });
    },
  });
}

export function useUpdatePost(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<PostInput>) => postsApi.update(id, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.posts.all() });
      const snapshots: { key: QueryKey; data: PostListResponse | undefined }[] = [];
      for (const key of allListKeys(qc)) {
        const data = qc.getQueryData<PostListResponse>(key);
        snapshots.push({ key, data });
        if (data) {
          qc.setQueryData<PostListResponse>(key, {
            ...data,
            posts: data.posts.map((p) =>
              p._id === id ? ({ ...p, ...input } as Post) : p
            ),
          });
        }
      }
      const detailKey = QUERY_KEYS.posts.detail(id);
      const prevDetail = qc.getQueryData<Post>(detailKey);
      if (prevDetail) {
        qc.setQueryData<Post>(detailKey, { ...prevDetail, ...input } as Post);
      }
      return { previous: snapshots, prevDetail };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) rollback(qc, ctx.previous);
      if (ctx?.prevDetail) qc.setQueryData(QUERY_KEYS.posts.detail(id), ctx.prevDetail);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.posts.all() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.posts.detail(id) });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.posts.all() });
      const snapshots: { key: QueryKey; data: PostListResponse | undefined }[] = [];
      for (const key of allListKeys(qc)) {
        const data = qc.getQueryData<PostListResponse>(key);
        snapshots.push({ key, data });
        if (data) {
          qc.setQueryData<PostListResponse>(key, {
            ...data,
            posts: data.posts.filter((p) => p._id !== id),
          });
        }
      }
      return { previous: snapshots };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) rollback(qc, ctx.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.posts.all() });
    },
  });
}

export function useSetPostStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: PostStatus }) =>
      postsApi.setStatus(vars.id, vars.status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.posts.all() });
      const snapshots: { key: QueryKey; data: PostListResponse | undefined }[] = [];
      for (const key of allListKeys(qc)) {
        const data = qc.getQueryData<PostListResponse>(key);
        snapshots.push({ key, data });
        if (data) {
          qc.setQueryData<PostListResponse>(key, {
            ...data,
            posts: data.posts.map((p) => (p._id === id ? { ...p, status } : p)),
          });
        }
      }
      return { previous: snapshots };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) rollback(qc, ctx.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.posts.all() });
    },
  });
}
