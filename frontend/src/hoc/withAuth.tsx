import { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { MESSAGES } from '../constants/messages';
import type { Role } from '../types';

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  requiredRole?: Role
): ComponentType<P> {
  const Wrapped = (props: P) => {
    const { user, loading } = useAuth();

    if (loading) {
      return <div className="p-8 text-content-muted">{MESSAGES.loading}</div>;
    }
    if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
      return <Navigate to={ROUTES.HOME} replace />;
    }
    return <Component {...props} />;
  };
  Wrapped.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}
