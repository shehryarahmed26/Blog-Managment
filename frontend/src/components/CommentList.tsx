import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useComments, useCreateComment } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../api/client';
import { config } from '../config';
import { MESSAGES } from '../constants/messages';
import { commentSchema, type CommentFormValues } from '../schemas';

interface Props {
  postId: string;
}

export function CommentList({ postId }: Props) {
  const { user } = useAuth();
  const { data: comments = [], isLoading, error } = useComments(postId);
  const createComment = useCreateComment(postId, user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  });

  async function onSubmit(values: CommentFormValues) {
    try {
      await createComment.mutateAsync(values.content.trim());
      reset();
    } catch {
      // surfaced via createComment.error below
    }
  }

  const mutationError = createComment.isError
    ? getApiErrorMessage(createComment.error, MESSAGES.comments.postFailed)
    : null;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-xl font-display font-bold">Comments</h3>
        {comments.length > 0 && (
          <span className="tag">{comments.length}</span>
        )}
      </div>

      {user ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card p-4 mb-6 flex flex-col sm:flex-row gap-2"
          noValidate
        >
          <span className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-white text-xs font-bold shrink-0">
            {(user.name[0] ?? '?').toUpperCase()}
          </span>
          <input
            className={`input !py-2.5 ${errors.content ? 'input-error' : ''}`}
            placeholder="Share your thoughts…"
            maxLength={config.validation.maxCommentLength}
            {...register('content')}
          />
          <button
            className="btn-primary"
            type="submit"
            disabled={isSubmitting || createComment.isPending}
          >
            {createComment.isPending ? 'Posting…' : 'Post'}
          </button>
        </form>
      ) : (
        <div className="card p-5 text-center mb-6">
          <p className="text-sm text-content-muted">
            {MESSAGES.comments.loginToComment}
          </p>
        </div>
      )}

      {errors.content && <p className="form-error mb-2">{errors.content.message}</p>}
      {mutationError && (
        <div className="rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-2.5 mb-3">
          <p className="text-sm text-danger-600">{mutationError}</p>
        </div>
      )}

      {isLoading && <p className="text-sm text-content-muted">{MESSAGES.loading}</p>}
      {error && (
        <p className="text-sm text-danger-600">
          {getApiErrorMessage(error, MESSAGES.errorGeneric)}
        </p>
      )}

      <ul className="space-y-3">
        {comments.map((c) => (
          <li
            key={c._id}
            className={`card p-4 flex gap-3 ${c._id.startsWith('temp-') ? 'opacity-70' : ''}`}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-white text-xs font-bold shrink-0">
              {(c.author?.name ?? '?')[0].toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-semibold text-content truncate">
                  {c.author?.name ?? 'Unknown'}
                </span>
                <span className="text-xs text-content-subtle shrink-0">
                  {new Date(c.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-content-muted whitespace-pre-wrap leading-relaxed">
                {c.content}
              </p>
            </div>
          </li>
        ))}
        {!isLoading && comments.length === 0 && (
          <li className="card p-6 text-center text-sm text-content-muted">
            {MESSAGES.comments.empty}
          </li>
        )}
      </ul>
    </section>
  );
}
