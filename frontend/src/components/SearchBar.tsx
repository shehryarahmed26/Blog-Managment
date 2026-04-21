import { FormEvent, useEffect, useState } from 'react';

interface Props {
  initial?: string;
  onSearch: (q: string) => void;
  placeholder?: string;
}

export function SearchBar({ initial = '', onSearch, placeholder }: Props) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  function submit(ev: FormEvent) {
    ev.preventDefault();
    onSearch(value.trim());
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-content-subtle"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          className="input !pl-11 !pr-10"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? 'Search posts by title or tag…'}
        />
        {value && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full inline-flex items-center justify-center text-content-subtle hover:bg-surface-subtle hover:text-content transition"
            onClick={() => {
              setValue('');
              onSearch('');
            }}
            aria-label="Clear search"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <button className="btn-primary sm:!px-6" type="submit">
        Search
      </button>
    </form>
  );
}
