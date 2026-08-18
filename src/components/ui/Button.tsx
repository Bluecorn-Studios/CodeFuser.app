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
  const baseStyles = "inline-flex items-center justify-center font-semibold uppercase tracking-wider transition-all cursor-pointer select-none active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none";

  const sizeStyles = {
    sm: "text-[10px] px-3 py-2 rounded-lg font-mono",
    md: "text-xs px-4 py-2.5 rounded-xl font-sans",
    lg: "text-xs px-6 py-3.5 rounded-xl font-sans font-bold",
  };

  const variantStyles = {
    primary: "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.12)] border border-white",
    secondary: "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 shadow-sm",
    quiet: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30",
    important: "bg-white text-black hover:bg-zinc-200 border border-white shadow-[0_0_25px_rgba(255,255,255,0.2)]",
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
