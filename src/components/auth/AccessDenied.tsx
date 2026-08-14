import React from "react";
import { motion } from "motion/react";
import { ArrowRight, LogOut, MessageSquare, Terminal } from "lucide-react";
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

  const conciergeUrl = `https://wa.me/917449100307?text=${encodeURIComponent(
    `Hi CodeFuser, I am signed in with ${user?.email || "my account"} and want to start my website project.`
  )}`;

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-white selection:text-black">
      {/* Monochromatic Subtle Glow for Glass Blur */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-white rounded-full blur-[120px] pointer-events-none"
      />

      {/* Grid texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

      {/* Compact Frosted Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-black/70 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-7 text-center relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)_inset] space-y-5"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="font-mono text-xs font-bold tracking-widest text-white uppercase">CODEFUSER</span>
          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">WORKSPACE</span>
        </div>

        {/* Minimal Mono Icon */}
        <div className="w-11 h-11 bg-white/[0.04] border border-white/10 rounded-xl flex items-center justify-center mx-auto text-white">
          <Terminal className="w-5 h-5 text-zinc-200" />
        </div>

        {/* Short & Clear Copy */}
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-white tracking-tight font-mono">
            No Project Linked
          </h1>
          <p className="text-xs text-zinc-400 leading-normal max-w-xs mx-auto">
            No active website project was found for this account.
          </p>
        </div>

        {/* Account Chip */}
        {user?.email && (
          <div className="inline-block px-3 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-mono text-zinc-300 truncate max-w-full">
            {user.email}
          </div>
        )}

        {/* Action Buttons - Pure High-Contrast Mono */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleStartWebsite}
            className="w-full h-10 bg-white hover:bg-zinc-200 text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>Start a Project</span>
            <ArrowRight size={13} className="stroke-[2.5]" />
          </button>

          <button
            onClick={handleBackToSignIn}
            className="w-full h-9 bg-transparent hover:bg-white/5 text-zinc-400 hover:text-zinc-200 text-xs font-mono rounded-lg border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <LogOut size={12} />
            <span>Switch Account</span>
          </button>
        </div>

        {/* Concierge Link */}
        <div className="pt-1">
          <a
            href={conciergeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <MessageSquare size={11} />
            <span>WhatsApp Concierge</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};


