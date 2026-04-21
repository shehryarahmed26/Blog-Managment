import type { Pagination as PaginationT } from '../types';

interface Props {
  pagination: PaginationT | null;
  onChange: (page: number) => void;
}

export function Pagination({ pagination, onChange }: Props) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-surface-border">
      <span className="text-sm text-content-subtle">
        Page{' '}
        <span className="font-semibold text-content">
          {pagination.currentPage}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-content">
          {pagination.totalPages}
        </span>{' '}
        · {pagination.totalPosts} posts
      </span>
      <div className="flex gap-2">
        <button
          className="btn-secondary !py-2 !px-4 disabled:hover:translate-y-0"
          disabled={!pagination.hasPrev}
          onClick={() => onChange(pagination.currentPage - 1)}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Prev
        </button>
        <button
          className="btn-secondary !py-2 !px-4 disabled:hover:translate-y-0"
          disabled={!pagination.hasNext}
          onClick={() => onChange(pagination.currentPage + 1)}
        >
          Next
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
