import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from '../components/Pagination';
import { PostCard } from '../components/PostCard';
import { SearchBar } from '../components/SearchBar';
import { withAuth } from '../hoc/withAuth';
import { useAuth } from '../hooks/useAuth';
import {
  useDeletePost,
  usePostsList,
  usePostStats,
  useSetPostStatus,
} from '../hooks/usePosts';
import { getApiErrorMessage } from '../api/client';
import { config } from '../config';
import { ROUTES } from '../constants/routes';
import { MESSAGES } from '../constants/messages';
import type { PostListFilters } from '../types';

const PAGE_SIZE = config.pagination.dashboardPageSize;

function DashboardInner() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<PostListFilters>({
    page: 1,
    limit: PAGE_SIZE,
  });

  const { data, isLoading, error } = usePostsList('mine', filters);
  const stats = usePostStats();
  const deletePost = useDeletePost();
  const setStatus = useSetPostStatus();

  const posts = data?.posts ?? [];
  const pagination = data?.pagination ?? null;
  const isAdmin = user?.role === 'admin';

  async function handleDelete(id: string) {
    if (!confirm(MESSAGES.posts.deleteConfirm)) return;
    try {
      await deletePost.mutateAsync(id);
    } catch (err) {
      alert(getApiErrorMessage(err, MESSAGES.posts.deleteFailed));
    }
  }

  async function handleToggle(id: string, next: 'draft' | 'published') {
    try {
      await setStatus.mutateAsync({ id, status: next });
    } catch (err) {
      alert(getApiErrorMessage(err, MESSAGES.posts.statusFailed));
    }
  }

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            {isAdmin ? 'Admin' : 'Your space'}
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
            {isAdmin ? 'Admin Dashboard' : `Welcome, ${user?.name?.split(' ')[0] ?? ''}`}
          </h1>
          <p className="text-sm text-content-muted mt-1">
            {isAdmin
              ? 'Manage every post on the platform.'
              : 'Track your drafts and published work.'}
          </p>
        </div>
        <Link to={ROUTES.EDITOR_NEW} className="btn-primary group">
          <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Post
        </Link>
      </div>

      {/* Stats */}
      {stats.data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
          <StatCard
            label="Total"
            value={stats.data.totalPosts}
            accent="brand"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            }
          />
          <StatCard
            label="Published"
            value={stats.data.publishedPosts}
            accent="success"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            }
          />
          <StatCard
            label="Drafts"
            value={stats.data.draftPosts}
            accent="warning"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Search */}
      <div className="animate-fade-up">
        <SearchBar
          initial={filters.search ?? ''}
          onSearch={(q) =>
            setFilters({ page: 1, limit: PAGE_SIZE, search: q || undefined })
          }
        />
      </div>

      {/* List */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6 space-y-3">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-6 w-3/4" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="card p-5 border-danger-500/40 bg-danger-500/5">
          <p className="text-sm text-danger-600">
            {getApiErrorMessage(error, MESSAGES.errorGeneric)}
          </p>
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="card p-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-brand-soft inline-flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </div>
          <p className="text-content-muted mb-4">{MESSAGES.posts.emptyDashboard}</p>
          <Link to={ROUTES.EDITOR_NEW} className="btn-primary">
            Write your first post
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard
            key={p._id}
            post={p}
            actions={
              <>
                <Link
                  to={ROUTES.EDITOR_EDIT(p._id)}
                  className="btn-secondary !py-1.5 !px-3 text-xs"
                >
                  Edit
                </Link>
                <button
                  className="btn-secondary !py-1.5 !px-3 text-xs"
                  onClick={() =>
                    handleToggle(
                      p._id,
                      p.status === 'published' ? 'draft' : 'published'
                    )
                  }
                  disabled={p._id.startsWith('temp-')}
                >
                  {p.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  className="btn-danger !py-1.5 !px-3 text-xs"
                  onClick={() => handleDelete(p._id)}
                  disabled={p._id.startsWith('temp-')}
                >
                  Delete
                </button>
              </>
            }
          />
        ))}
      </div>

      <Pagination
        pagination={pagination}
        onChange={(p) => setFilters({ ...filters, page: p })}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: 'brand' | 'success' | 'warning';
}) {
  const accentCls =
    accent === 'success'
      ? 'bg-success-500/10 text-success-600 ring-success-500/20'
      : accent === 'warning'
      ? 'bg-warning-500/10 text-warning-600 ring-warning-500/20'
      : 'bg-brand-500/10 text-brand-600 ring-brand-500/20';

  return (
    <div className="card p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-transform">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-content-subtle">
            {label}
          </p>
          <p className="text-3xl font-display font-bold mt-2 tracking-tight">
            {value.toLocaleString()}
          </p>
        </div>
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${accentCls}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

export const Dashboard = withAuth(DashboardInner);
