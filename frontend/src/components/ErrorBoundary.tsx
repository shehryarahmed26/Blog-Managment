import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-surface-muted text-content">
          <div className="max-w-md w-full card p-8 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-danger-500/10 ring-1 ring-inset ring-danger-500/25 inline-flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-danger-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-display font-bold mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-content-muted mb-5">
              {this.state.error.message || 'Unexpected error.'}
            </p>
            <button className="btn-primary" onClick={this.reset}>
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
