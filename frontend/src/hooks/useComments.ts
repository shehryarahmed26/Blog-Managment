import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../api/endpoints';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { Comment, User } from '../types';

export function useComments(postId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.comments.all(postId),
    queryFn: () => commentsApi.list(postId),
  });
}

export function useCreateComment(postId: string, currentUser: User | null) {
  const qc = useQueryClient();
  const key = QUERY_KEYS.comments.all(postId);

  return useMutation({
    mutationFn: (content: string) => commentsApi.create(postId, content),
    onMutate: async (content) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Comment[]>(key);
      const optimistic: Comment = {
        _id: `temp-${Date.now()}`,
        content,
        author: currentUser
          ? { _id: currentUser.id, name: currentUser.name }
          : { _id: 'me', name: 'You' },
        post: postId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      qc.setQueryData<Comment[]>(key, (old) => [optimistic, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(key, ctx.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}
