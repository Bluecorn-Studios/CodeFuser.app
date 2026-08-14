import React from "react";
import { Sparkles, ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const AccessDenied: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleStartWebsite = () => {
    window.location.href = "/start-project";
  };

  const handleBackToSignIn = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* CodeFuser Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-orange-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="max-w-md w-full bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-8 sm:p-10 text-center relative z-10 shadow-2xl backdrop-blur-xl space-y-6">
        {/* CodeFuser Brand */}
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-xl font-bold tracking-tight text-white">CODEFUSER</span>
        </div>

        <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
          <Sparkles className="w-7 h-7 text-amber-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Your client area isn't ready yet
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            We couldn't find a CodeFuser project for this account yet.
          </p>
        </div>

        {user?.email && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400">
            <span>Account:</span>
            <span className="text-zinc-200 font-medium">{user.email}</span>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <button
            onClick={handleStartWebsite}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            Start your website <ArrowRight size={14} />
          </button>

          <button
            onClick={handleBackToSignIn}
            className="w-full h-11 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium text-xs rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={13} />
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};

