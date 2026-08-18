import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "active" | "success" | "warning";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variantStyles = {
    neutral: "bg-zinc-900 border-zinc-800 text-zinc-300",
    active: "bg-white/10 border-white/25 text-white shadow-sm",
    success: "bg-zinc-900 border-zinc-700 text-white font-medium",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border ${variantStyles[variant]} ${className}`}
    >
      {variant === "success" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
      {children}
    </span>
  );
}
