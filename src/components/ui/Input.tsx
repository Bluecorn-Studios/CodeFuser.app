import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-[10px] uppercase font-mono font-semibold tracking-wider text-zinc-400">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full bg-zinc-900/90 border ${
          error ? "border-red-500/50 focus:border-red-500" : "border-zinc-800 focus:border-zinc-500"
        } rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700/50 transition-all font-sans placeholder:text-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && <p className="text-[10px] text-red-400 font-sans mt-1">{error}</p>}
    </div>
  );
}
