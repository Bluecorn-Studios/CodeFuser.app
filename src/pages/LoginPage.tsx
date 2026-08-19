import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  ChevronLeft,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";
import { useAppRouter } from "../components/Reveal";
import { useAuth } from "../context/AuthContext";
import { logAndMapAuthError } from "../utils/authErrors";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function LoginPage() {
  const { navigate } = useAppRouter();
  const { user, isLoading: authLoading, signInWithEmail, signInWithGoogle } = useAuth();
  
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-redirect if already authenticated with live Supabase session
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const authResult = await signInWithEmail(email, password);
      if (authResult?.session) {
        await supabase.auth.setSession(authResult.session);
      }
      setSuccessMsg("Welcome back! Entering your client workspace...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err: any) {
      const friendlyError = logAndMapAuthError(err, "Manual Credentials Submit");
      setErrorMsg(friendlyError);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    try {
      await signInWithGoogle();
    } catch (err: any) {
      const friendlyError = logAndMapAuthError(err, "Google OAuth Sign-In Client Initiation");
      setErrorMsg(friendlyError);
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div id="login-container" className="min-h-screen bg-black text-white relative flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans selection:bg-zinc-800 selection:text-white">
      {/* CodeFuser Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/25 via-zinc-950/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent blur-2xl pointer-events-none" />
      
      {/* Subtle Micro-Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" 
      />

      {/* Back Button */}
      <div className="absolute top-6 left-6 sm:left-12 z-20">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all cursor-pointer bg-zinc-900/60 hover:bg-zinc-800/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-zinc-800/80 shadow-lg hover:border-zinc-700 group"
        >
          <ChevronLeft size={14} className="text-zinc-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <motion.div 
          initial={{ opacity: 0, filter: "blur(12px)", y: -20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-6"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-full text-zinc-300 text-[10px] font-mono uppercase tracking-widest mb-4 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <Shield size={12} className="text-zinc-400" />
            <span>CodeFuser • Client Portal</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-sans">
            Client Login
          </h2>
          
          <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-2.5 tracking-wide font-sans leading-relaxed">
            Reserved for authorized CodeFuser clients.
            <br />
            <span className="text-zinc-500">Sign in to access your project dashboard.</span>
          </p>
        </motion.div>

        {/* Auth card with Elite Blurry Entrance */}
        <motion.div 
          initial={{ opacity: 0, filter: "blur(24px)", scale: 0.94, y: 30 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800/90 hover:border-zinc-700 p-8 rounded-3xl shadow-[0_35px_80px_rgba(0,0,0,0.95)] transition-all duration-300 relative overflow-hidden"
        >
          {/* Subtle Scanning Laser Border Highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-zinc-900 overflow-hidden">
            <motion.div 
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-zinc-500 to-transparent"
            />
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {/* Status alerts */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2.5 font-sans shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span className="leading-snug">{errorMsg}</span>
                </motion.div>
              )}
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-xl flex items-center gap-2.5 font-sans shadow-sm"
                >
                  <CheckCircle2 size={16} className="text-zinc-300 shrink-0" />
                  <span className="leading-snug">{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Input
                type="email"
                autoComplete="username email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                label="Email Address *"
                className="pl-10"
                disabled={isLoading}
                required
              />
              <Mail size={15} className="absolute left-3.5 top-[38px] text-zinc-500" />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                label="Password *"
                className="pl-10 pr-10"
                disabled={isLoading}
                required
              />
              <Lock size={15} className="absolute left-3.5 top-[38px] text-zinc-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[38px] text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-black" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Portal</span>
                  <ArrowRight size={15} />
                </>
              )}
            </Button>

            {/* Google Authentication Divider & Button */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-800/80"></div>
              <span className="flex-shrink mx-4 text-[10px] text-zinc-500 uppercase font-mono tracking-widest">or</span>
              <div className="flex-grow border-t border-zinc-800/80"></div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.3-.7-.5-1.5-.5-2.3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span className="font-mono text-xs font-bold uppercase tracking-wider">Continue with Google</span>
            </Button>
          </form>

          {/* Onboarding note */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              New client? Client accounts are configured automatically upon submitting your project onboarding form.{" "}
              <button 
                type="button" 
                onClick={() => navigate('/start-project')} 
                className="text-white hover:text-zinc-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer transition-colors"
              >
                Start a Project →
              </button>
            </p>
          </div>
        </motion.div>

        {/* Footer info line */}
        <div className="text-[10px] text-zinc-500 text-center mt-6 font-mono tracking-widest uppercase flex items-center justify-center gap-2">
          <Sparkles size={11} className="text-zinc-400" />
          <span>CodeFuser SSL Encrypted Portal</span>
        </div>
      </div>
    </div>
  );
}

