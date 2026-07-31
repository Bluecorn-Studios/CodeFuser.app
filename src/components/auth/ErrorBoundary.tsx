import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught React exception:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">System Error</h2>
              <p className="text-sm text-zinc-400">
                An unexpected interface issue occurred. Our monitoring team has been notified.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-zinc-900 border border-zinc-800/80 rounded-lg p-3 text-left overflow-x-auto">
                <code className="text-xs font-mono text-zinc-400 block whitespace-pre-wrap">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Client Portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
