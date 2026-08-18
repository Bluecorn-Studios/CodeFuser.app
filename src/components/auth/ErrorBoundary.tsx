import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Sparkles } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isChunkError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    const msg = (error?.message || error?.toString() || "").toLowerCase();
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      msg.includes("dynamically imported module") ||
      msg.includes("failed to fetch") ||
      msg.includes("importing a module script failed") ||
      msg.includes("mime type") ||
      msg.includes("loading chunk");

    return { hasError: true, error, isChunkError };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught React exception:", error, errorInfo);

    const msg = (error?.message || error?.toString() || "").toLowerCase();
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      msg.includes("dynamically imported module") ||
      msg.includes("failed to fetch") ||
      msg.includes("importing a module script failed") ||
      msg.includes("mime type") ||
      msg.includes("loading chunk");

    // Auto-reload once if it's a version mismatch/chunk error
    if (isChunkError) {
      const reloadedKey = "error-boundary-chunk-reloaded";
      const hasReloaded = sessionStorage.getItem(reloadedKey);
      if (!hasReloaded) {
        sessionStorage.setItem(reloadedKey, "true");
        console.log("[ErrorBoundary] Auto-reloading to fetch newest application bundle...");
        this.handleReload();
      }
    }
  }

  private handleReload = async () => {
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.update();
        }
      }
    } catch {
      // Ignore cache clearing errors
    }

    // Force hard reload by appending timestamp or reloading
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("_v", Date.now().toString());
    window.location.href = currentUrl.toString();
  };

  public render() {
    if (this.state.hasError) {
      const isChunk = this.state.isChunkError;

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#0A0A0A] border border-white/20 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
              isChunk ? "bg-white/10 border border-white/20 text-white" : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}>
              {isChunk ? <Sparkles className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-display">
                {isChunk ? "Application Updated" : "System Notice"}
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {isChunk 
                  ? "A new version of the dashboard is available. Click below to load the latest features." 
                  : "An unexpected interface issue occurred. Please reload to resume your session."}
              </p>
            </div>

            {this.state.error && !isChunk && (
              <div className="bg-[#050505] border border-white/10 rounded-xl p-3 text-left overflow-x-auto">
                <code className="text-xs font-mono text-neutral-400 block whitespace-pre-wrap">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full h-11 bg-white text-black hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 font-mono"
            >
              <RefreshCw className="w-4 h-4" />
              {isChunk ? "Load Latest Version" : "Reload Workspace"}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
