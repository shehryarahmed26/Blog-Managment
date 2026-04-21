import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import type { Post } from '../types';

interface Props {
  post: Post;
  actions?: React.ReactNode;
}

function readTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function PostCard({ post, actions }: Props) {
  const isTemp = post._id.startsWith('temp-');
  const preview = post.content.slice(0, 220) + (post.content.length > 220 ? '…' : '');
  const minutes = readTime(post.content);

  return (
    <article
      className={[
        'group relative card card-gradient p-6 animate-fade-up',
        isTemp ? 'opacity-70' : 'hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-500/40',
      ].join(' ')}
    >
      {/* Accent bar */}
      <span className="absolute left-0 top-6 h-10 w-1 rounded-r-full bg-gradient-brand opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={post.status === 'published' ? 'tag-success' : 'tag-warning'}>
              <span className={[
                'h-1.5 w-1.5 rounded-full',
                post.status === 'published' ? 'bg-success-500' : 'bg-warning-500',
              ].join(' ')} />
              {post.status}
            </span>
            {isTemp && <span className="tag">saving…</span>}
            <span className="text-xs text-content-subtle">
              {minutes} min read
            </span>
          </div>

          <h3 className="text-xl font-display font-bold text-content leading-snug tracking-tight">
            {isTemp ? (
              <span>{post.title}</span>
            ) : (
              <Link
                to={ROUTES.POST_DETAIL(post._id)}
                className="hover:text-brand-600 transition-colors"
              >
                {post.title}
              </Link>
            )}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-xs text-content-subtle">
            <AuthorChip name={post.author?.name ?? 'Unknown'} />
            <span>·</span>
            <time>{new Date(post.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}</time>
          </div>

          <p className="mt-4 text-sm text-content-muted line-clamp-3 leading-relaxed">
            {preview}
          </p>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span key={t} className="tag">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {actions && (
          <div className="flex md:flex-col gap-2 shrink-0 md:pt-1">{actions}</div>
        )}
      </div>
    </article>
  );
}

function AuthorChip({ name }: { name: string }) {
  const initial = (name[0] ?? '?').toUpperCase();
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-brand text-[10px] font-bold text-white">
        {initial}
      </span>
      <span className="font-medium text-content-muted">{name}</span>
    </span>
  );
}
