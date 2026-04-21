import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../api/client';
import { ROUTES } from '../constants/routes';
import { MESSAGES } from '../constants/messages';
import { registerSchema, type RegisterFormValues } from '../schemas';

export function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const password = watch('password');
  const strength = getStrength(password);

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      await registerUser(values.name, values.email, values.password);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err, MESSAGES.auth.registerFailed));
    }
  }

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-2 gap-10 items-center">
      <div className="aurora top-10 right-0 h-64 w-64 rounded-full bg-accent-500/25 animate-float" />

      <div className="hidden md:block animate-fade-up">
        <div className="relative card p-8 overflow-hidden">
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-500">
            Join Inkwell
          </p>
          <h2 className="mt-3 text-3xl font-display font-bold tracking-tight leading-tight">
            Start your{' '}
            <span className="gradient-text">writing journey</span> today.
          </h2>
          <p className="mt-3 text-sm text-content-muted leading-relaxed">
            Create an account in seconds and share your thoughts with the world.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="Free" value="∞" />
            <Stat label="Posts" value="10k+" />
            <Stat label="Writers" value="2.4k" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto md:mx-0 animate-fade-up">
        <div className="card p-8">
          <h1 className="text-2xl font-display font-bold">Create an account</h1>
          <p className="text-sm text-content-muted mt-1">
            It only takes a minute.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6" noValidate>
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input
                id="name"
                autoComplete="name"
                placeholder="Jane Doe"
                className={`input ${errors.name ? 'input-error' : ''}`}
                {...register('name')}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

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
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={`input !pr-11 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg inline-flex items-center justify-center text-content-subtle hover:text-content hover:bg-surface-subtle transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.77 19.77 0 0 1 4.22-5.38" />
                      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.77 19.77 0 0 1-3.22 4.24" />
                      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {password && <StrengthMeter level={strength} />}
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3">
                <p className="text-sm text-danger-600">{serverError}</p>
              </div>
            )}

            <button className="btn-primary w-full !py-3" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-content-muted mt-6 text-center">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-semibold text-brand-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface/50 p-3 text-center">
      <p className="text-lg font-display font-bold gradient-text">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-content-subtle mt-0.5">
        {label}
      </p>
    </div>
  );
}

function getStrength(pw: string | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score as 0 | 1 | 2 | 3 | 4;
}

function StrengthMeter({ level }: { level: 0 | 1 | 2 | 3 | 4 }) {
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = [
    'bg-surface-border',
    'bg-danger-500',
    'bg-warning-500',
    'bg-brand-500',
    'bg-success-500',
  ];
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex-1 flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < level ? colors[level] : 'bg-surface-border'
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] text-content-subtle font-medium w-14 text-right">
        {labels[level]}
      </span>
    </div>
  );
}
