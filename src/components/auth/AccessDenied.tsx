import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, LogOut, MessageSquare, Compass, ShieldCheck } from "lucide-react";
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
    `Hi CodeFuser, I am logged in with ${user?.email || "my account"} and need help finding or starting my website project.`
  )}`;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Background Animated Light Orbs for Glass Blur */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-b from-amber-400/20 via-orange-500/10 to-transparent rounded-full blur-[110px] pointer-events-none"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.06, 0.14, 0.06],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[450px] h-[300px] bg-gradient-to-t from-white/10 via-zinc-400/5 to-transparent rounded-full blur-[100px] pointer-events-none"
      />

      {/* Subtle Dot Matrix Canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:22px_22px] opacity-25 pointer-events-none" />

      {/* Main Glass Blur Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-zinc-950/75 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-10 text-center relative z-10 shadow-[0_0_60px_rgba(0,0,0,0.85),0_1px_1px_rgba(255,255,255,0.1)_inset] space-y-6"
      >
        {/* Top Rim Highlight */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* CodeFuser Brand & Header Mono Tag */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black tracking-widest text-white uppercase">CODEFUSER</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-wider text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>CLIENT PORTAL</span>
          </div>
        </div>

        {/* Animated Icon Emblem */}
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-2xl border border-dashed border-amber-500/20"
          />
          <div className="w-14 h-14 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center text-amber-400 shadow-inner">
            <Compass className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Primary Clear Wordings */}
        <div className="space-y-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
            No Active Website Project
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            You are signed in, but we couldn't find an active website project linked to this account yet.
          </p>
        </div>

        {/* Connected Account Display */}
        {user?.email && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-white/10 text-xs font-mono text-zinc-400 shadow-sm max-w-full truncate">
            <span className="text-zinc-500">Account:</span>
            <span className="text-zinc-200 font-semibold truncate">{user.email}</span>
          </div>
        )}

        {/* Action Description */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs text-zinc-400 text-left space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ready to launch your website?</span>
          </div>
          <p className="leading-relaxed">
            Tell us about your business to get a custom design, quote, and live development timeline in under 2 minutes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleStartWebsite}
            className="w-full h-12 bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:brightness-110 text-black font-extrabold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>Start Your Website Project</span>
            <ArrowRight size={14} className="stroke-[2.5]" />
          </button>

          <button
            onClick={handleBackToSignIn}
            className="w-full h-11 bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-400 hover:text-white font-medium text-xs font-mono rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <LogOut size={13} />
            <span>Sign Out / Switch Account</span>
          </button>
        </div>

        {/* Direct WhatsApp Concierge Support */}
        <div className="pt-2 border-t border-white/5 text-center">
          <a
            href={conciergeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <MessageSquare size={13} />
            <span>Need assistance? Chat with a project concierge on WhatsApp</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};


