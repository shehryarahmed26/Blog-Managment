import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export function NotFound() {
  return (
    <div className="relative max-w-md mx-auto px-4 sm:px-6 py-16 text-center animate-fade-up">
      <div className="aurora top-0 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-brand-500/25 animate-float" />

      <p className="text-[10rem] leading-none font-display font-extrabold gradient-text tracking-tighter select-none">
        404
      </p>
      <h1 className="text-2xl font-display font-bold mt-2">Page not found</h1>
      <p className="text-content-muted mt-2 mb-6">
        The page you're looking for doesn't exist — or it wandered off.
      </p>
      <Link to={ROUTES.HOME} className="btn-primary">
        ← Back home
      </Link>
    </div>
  );
}
