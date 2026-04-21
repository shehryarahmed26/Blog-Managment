import { Link, useParams } from 'react-router-dom';
import { CommentList } from '../components/CommentList';
import { usePost } from '../hooks/usePosts';
import { getApiErrorMessage } from '../api/client';
import { ROUTES } from '../constants/routes';
import { MESSAGES } from '../constants/messages';

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading, error } = usePost(id);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-10 w-3/4" />
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="card p-8 text-center">
          <p className="text-danger-600 mb-3">
            {error ? getApiErrorMessage(error, MESSAGES.posts.notFound) : MESSAGES.posts.notFound}
          </p>
          <Link to={ROUTES.HOME} className="btn-secondary">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const minutes = Math.max(1, Math.round(post.content.trim().split(/\s+/).length / 200));

  return (
    <div className="relative">
      <div className="aurora top-0 left-10 h-64 w-64 rounded-full bg-brand-500/20 animate-float" />
      <div
        className="aurora top-20 right-10 h-64 w-64 rounded-full bg-accent-500/20 animate-float"
        style={{ animationDelay: '-3s' }}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-up">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1 text-sm text-content-muted hover:text-brand-600 transition"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.status === 'draft' ? (
              <span className="tag-warning">draft</span>
            ) : (
              <span className="tag-success">published</span>
            )}
            <span className="text-xs text-content-subtle">{minutes} min read</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight leading-[1.1]">
            {post.title}
          </h1>

          <div className="mt-5 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-brand text-white text-sm font-bold shadow-md">
              {(post.author?.name ?? '?')[0].toUpperCase()}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-content">
                {post.author?.name ?? 'Unknown'}
              </p>
              <p className="text-xs text-content-subtle">
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {post.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span key={t} className="tag">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="mt-10">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-surface-border to-transparent" />
        </div>

        <div className="prose-post mt-8">{post.content}</div>

        <div className="mt-10">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-surface-border to-transparent" />
        </div>

        <CommentList postId={post._id} />
      </article>
    </div>
  );
}
