import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 p-8">
          <div className="w-12 h-12 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[var(--color-error)]" />
          </div>
          <div className="text-center">
            <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-1">
              Etwas ist schiefgelaufen
            </h3>
            <p className="text-[13px] text-[var(--color-text-tertiary)] max-w-md">
              {this.state.error?.message || "Ein unerwarteter Fehler ist aufgetreten."}
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.hash = "#/dashboard";
            }}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[13px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Zum Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
