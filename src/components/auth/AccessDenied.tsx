import React from "react";
import { ShieldAlert, LogOut, MessageSquare, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const AccessDenied: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-sans selection:bg-amber-500/30 selection:text-amber-200 relative overflow-hidden">
      {/* CodeFuser Glowing Background Ambient Flares */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-orange-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="max-w-lg w-full bg-zinc-950/90 border border-zinc-800 rounded-3xl p-8 sm:p-10 text-center space-y-7 shadow-[0_30px_70px_rgba(0,0,0,0.95)] relative z-10 overflow-hidden backdrop-blur-xl">
        {/* Subtle top border highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-400">
            <span>Account:</span>
            <span className="text-amber-400 font-semibold">{user?.email || "Authenticated User"}</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 sm:text-3xl uppercase">
            Portal Access Pending
          </h1>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
            Your account is verified, but client portal access has not been activated for this profile yet. Please reach out to your project director to enable live portal access.
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 text-left space-y-3">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
            Next Steps
          </span>
          <ul className="text-xs text-zinc-300 space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>Verify you signed in with the exact email provided during onboarding.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>If your project was recently booked, portal activation takes up to 2 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>Contact team support if you need instant activation.</span>
            </li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-1/2 h-11 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
          >
            <MessageSquare className="w-4 h-4" />
            Contact Team
          </a>

          <button
            onClick={() => signOut()}
            className="w-full sm:w-1/2 h-11 bg-zinc-900 hover:bg-zinc-800/90 text-zinc-300 hover:text-white font-semibold text-xs border border-zinc-800 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="pt-4 border-t border-zinc-900 text-center flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="text-amber-500/80" />
          <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
            CodeFuser Client Services
          </span>
        </div>
      </div>
    </div>
  );
};

