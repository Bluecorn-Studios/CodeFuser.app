import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "quiet" | "danger" | "important";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-semibold uppercase tracking-wider transition-all cursor-pointer select-none active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-white/40";

  const sizeStyles = {
    sm: "text-[10px] px-3 py-1.5 rounded-lg font-mono",
    md: "text-xs px-4 py-2.5 rounded-xl font-mono",
    lg: "text-xs px-6 py-3.5 rounded-xl font-mono font-bold",
  };

  const variantStyles = {
    primary: "bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] border border-white font-bold",
    secondary: "bg-[#0A0A0A] hover:bg-neutral-900 text-neutral-200 border border-white/20 hover:border-white/40 shadow-sm",
    quiet: "bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-white/10",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30",
    important: "bg-white text-black hover:bg-neutral-200 border border-white shadow-[0_0_25px_rgba(255,255,255,0.25)] font-bold",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
