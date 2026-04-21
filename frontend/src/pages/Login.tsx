import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../api/client';
import { ROUTES } from '../constants/routes';
import { MESSAGES } from '../constants/messages';
import { loginSchema, type LoginFormValues } from '../schemas';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.DASHBOARD;

  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err, MESSAGES.auth.loginFailed));
    }
  }

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-2 gap-10 items-center">
      <div className="aurora top-0 left-0 h-64 w-64 rounded-full bg-brand-500/25 animate-float" />

      {/* Brand panel */}
      <div className="hidden md:block animate-fade-up">
        <div className="relative card p-8 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            Welcome back
          </p>
          <h2 className="mt-3 text-3xl font-display font-bold tracking-tight leading-tight">
            Keep the <span className="gradient-text">conversation</span> going.
          </h2>
          <p className="mt-3 text-sm text-content-muted leading-relaxed">
            Log in to publish new posts, manage drafts, and engage with readers.
          </p>

          <ul className="mt-6 space-y-3 text-sm">
            <Feature text="Rich drafting with instant publishing" />
            <Feature text="Engage with a thoughtful reader community" />
            <Feature text="Dark mode that's actually easy on the eyes" />
          </ul>
        </div>
      </div>

      {/* Form */}
      <div className="w-full max-w-md mx-auto md:mx-0 animate-fade-up">
        <div className="card p-8">
          <h1 className="text-2xl font-display font-bold">Log in</h1>
          <p className="text-sm text-content-muted mt-1">
            Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6" noValidate>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input !pr-11 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg inline-flex items-center justify-center text-content-subtle hover:text-content hover:bg-surface-subtle transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3">
                <p className="text-sm text-danger-600">{serverError}</p>
              </div>
            )}

            <button className="btn-primary w-full !py-3" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-content-muted mt-6 text-center">
            No account?{' '}
            <Link to={ROUTES.REGISTER} className="font-semibold text-brand-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-500/15 text-success-600 shrink-0">
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      <span className="text-content-muted">{text}</span>
    </li>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.77 19.77 0 0 1 4.22-5.38" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.77 19.77 0 0 1-3.22 4.24" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
