import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PostForm } from '../components/PostForm';
import { withAuth } from '../hoc/withAuth';
import { useCreatePost, usePost, useUpdatePost } from '../hooks/usePosts';
import { getApiErrorMessage } from '../api/client';
import { ROUTES } from '../constants/routes';
import { MESSAGES } from '../constants/messages';
import type { PostInput } from '../types';

function PostEditorInner() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const postQuery = usePost(id);
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost(id ?? '');

  const [error, setError] = useState<string | null>(null);

  async function onSubmit(input: PostInput) {
    setError(null);
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync(input);
      } else {
        await createMutation.mutateAsync(input);
      }
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(getApiErrorMessage(err, MESSAGES.posts.saveFailed));
    }
  }

  if (isEdit && postQuery.isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-10 w-1/2" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  const initialPost = postQuery.data;

  return (
    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-up">
      <div className="aurora top-0 right-0 h-56 w-56 rounded-full bg-brand-500/20 animate-float" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            {isEdit ? 'Editor' : 'Compose'}
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
            {isEdit ? 'Edit Post' : 'New Post'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 mb-4">
          <p className="text-sm text-danger-600">{error}</p>
        </div>
      )}

      <div className="card p-6 sm:p-8">
        <PostForm
          initial={
            initialPost
              ? {
                  title: initialPost.title,
                  content: initialPost.content,
                  tags: initialPost.tags,
                  status: initialPost.status,
                }
              : undefined
          }
          submitting={createMutation.isPending || updateMutation.isPending}
          submitLabel={isEdit ? 'Save changes' : 'Create post'}
          onSubmit={onSubmit}
          onCancel={() => navigate(ROUTES.DASHBOARD)}
        />
      </div>
    </div>
  );
}

export const PostEditor = withAuth(PostEditorInner);
