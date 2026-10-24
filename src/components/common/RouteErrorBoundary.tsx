import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Route ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-surface flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container text-on-error-container flex items-center justify-center mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[32px]">warning</span>
          </div>
          <h2 className="font-heading font-bold text-xl text-primary mb-2">
            Something unexpected occurred
          </h2>
          <p className="font-body-md text-sm text-on-surface-variant max-w-md mb-6">
            We encountered a temporary issue while loading this studio section. Please check your network or refresh.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-sm font-semibold hover:bg-primary-container transition-all shadow-sm"
            >
              Retry Loading
            </button>
            <a
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-sm font-semibold transition-all"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
