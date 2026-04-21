import { useState } from 'react';
import { Pagination } from '../components/Pagination';
import { PostCard } from '../components/PostCard';
import { SearchBar } from '../components/SearchBar';
import { usePostsList } from '../hooks/usePosts';
import { config } from '../config';
import { MESSAGES } from '../constants/messages';
import { getApiErrorMessage } from '../api/client';
import type { PostListFilters } from '../types';

const PAGE_SIZE = config.pagination.defaultPageSize;

export function Home() {
  const [filters, setFilters] = useState<PostListFilters>({
    page: 1,
    limit: PAGE_SIZE,
  });

  const { data, isLoading, error } = usePostsList('public', filters);
  const posts = data?.posts ?? [];
  const pagination = data?.pagination ?? null;

  return (
    <div className="relative">
      {/* Decorative aurora blobs */}
      <div className="aurora top-[-120px] left-1/4 h-72 w-72 rounded-full bg-brand-500/30 animate-float" />
      <div
        className="aurora top-10 right-[8%] h-80 w-80 rounded-full bg-accent-500/25 animate-float"
        style={{ animationDelay: '-2s' }}
      />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-12 text-center animate-fade-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface/60 backdrop-blur px-3 py-1 text-xs font-medium text-content-muted shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
          Fresh ideas, every day
        </span>
        <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight leading-[1.05]">
          Stories worth <span className="gradient-text">reading</span>.
          <br className="hidden sm:block" /> A community worth{' '}
          <span className="gradient-text">writing</span> for.
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-content-muted">
          Discover thoughtful posts from writers around the world. Publish your
          own in seconds — no markup, no friction.
        </p>

        <div className="mt-8 max-w-xl mx-auto">
          <SearchBar
            initial={filters.search ?? ''}
            onSearch={(q) =>
              setFilters({ page: 1, limit: PAGE_SIZE, search: q || undefined })
            }
          />
        </div>
      </section>

      {/* Feed */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xl font-display font-bold">
            {filters.search ? (
              <>
                Results for{' '}
                <span className="gradient-text">"{filters.search}"</span>
              </>
            ) : (
              'Latest Posts'
            )}
          </h2>
          {pagination && (
            <span className="text-xs text-content-subtle">
              {pagination.totalPosts} total
            </span>
          )}
        </div>

        {isLoading && <PostSkeletonList />}

        {error && (
          <div className="card p-5 border-danger-500/40 bg-danger-500/5">
            <p className="text-sm text-danger-600">
              {getApiErrorMessage(error, MESSAGES.errorGeneric)}
            </p>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <EmptyState message={MESSAGES.posts.empty} />
        )}

        <div className="space-y-4">
          {posts.map((p, idx) => (
            <div key={p._id} style={{ animationDelay: `${idx * 60}ms` }}>
              <PostCard post={p} />
            </div>
          ))}
        </div>

        <Pagination
          pagination={pagination}
          onChange={(p) => setFilters({ ...filters, page: p })}
        />
      </section>
    </div>
  );
}

function PostSkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card p-6 space-y-3">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-6 w-3/4" />
          <div className="skeleton h-3 w-1/3" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="card p-12 text-center">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-brand-soft inline-flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      </div>
      <p className="text-content-muted">{message}</p>
    </div>
  );
}
