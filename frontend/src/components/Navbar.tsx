import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { ROUTES } from '../constants/routes';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    [
      'relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
      isActive
        ? 'text-brand-600 bg-brand-500/10'
        : 'text-content-muted hover:text-content hover:bg-surface-subtle',
    ].join(' ');

  return (
    <header
      className={[
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-surface/70 backdrop-blur-xl border-b border-surface-border shadow-sm'
          : 'bg-transparent border-b border-transparent',
      ].join(' ')}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow group-hover:scale-105 transition-transform">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </span>
          <span className="text-lg font-display font-bold tracking-tight">
            <span className="gradient-text">Inkwell</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to={ROUTES.HOME} end className={linkCls}>
            Home
          </NavLink>
          {user && (
            <NavLink to={ROUTES.DASHBOARD} className={linkCls}>
              Dashboard
            </NavLink>
          )}
          {user && (
            <NavLink to={ROUTES.EDITOR_NEW} className={linkCls}>
              New Post
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggle} />
          {user ? (
            <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l border-surface-border">
              <div className="flex items-center gap-2">
                <Avatar name={user.name} />
                <div className="text-left leading-tight hidden lg:block">
                  <p className="text-sm font-semibold text-content">{user.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-content-subtle">
                    {user.role}
                  </p>
                </div>
              </div>
              <button className="btn-ghost !py-1.5 !px-3 text-xs" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <NavLink to={ROUTES.LOGIN} className="btn-ghost !py-2 !px-3 text-sm">
                Login
              </NavLink>
              <NavLink to={ROUTES.REGISTER} className="btn-primary !py-2 !px-4 text-sm">
                Get started
              </NavLink>
            </div>
          )}

          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border bg-surface/70 backdrop-blur"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {open ? (
                <>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </>
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-surface-border bg-surface/90 backdrop-blur-xl animate-fade-up">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
            <NavLink to={ROUTES.HOME} end className={linkCls} onClick={() => setOpen(false)}>
              Home
            </NavLink>
            {user && (
              <NavLink to={ROUTES.DASHBOARD} className={linkCls} onClick={() => setOpen(false)}>
                Dashboard
              </NavLink>
            )}
            {user && (
              <NavLink to={ROUTES.EDITOR_NEW} className={linkCls} onClick={() => setOpen(false)}>
                New Post
              </NavLink>
            )}
            {!user && (
              <>
                <NavLink to={ROUTES.LOGIN} className={linkCls} onClick={() => setOpen(false)}>
                  Login
                </NavLink>
                <NavLink to={ROUTES.REGISTER} className={linkCls} onClick={() => setOpen(false)}>
                  Get started
                </NavLink>
              </>
            )}
            {user && (
              <button
                className="btn-secondary mt-2"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                Logout ({user.name})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-white text-xs font-bold shadow-md">
      {initials || '?'}
    </span>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: 'light' | 'dark'; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border bg-surface/70 backdrop-blur hover:border-brand-500/50 hover:text-brand-600 transition-all"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
