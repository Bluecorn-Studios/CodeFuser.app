import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
  children: React.ReactNode;
  onRedirectToLogin?: () => void;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, onRedirectToLogin }) => {
  const { user, isLoading } = useAuth();

  console.log(`[TIMING] ${performance.now().toFixed(2)}ms - 9. RequireAuth rendered (isLoading: ${isLoading}, user: ${user ? user.email : 'null'})`);

  useEffect(() => {
    if (!isLoading && !user) {
      if (onRedirectToLogin) {
        onRedirectToLogin();
      } else if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }, [isLoading, user, onRedirectToLogin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
        </div>
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest animate-pulse">
          CodeFuser • Verifying Secure Session
        </span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
