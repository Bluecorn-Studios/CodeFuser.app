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
        <label htmlFor={id} className="block text-[11px] font-mono font-semibold tracking-wider text-neutral-300">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full bg-[#050505] border ${
          error ? "border-red-500 focus:border-red-400 focus:ring-red-500/20" : "border-white/20 hover:border-white/30 focus:border-white focus:ring-white/20"
        } rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 transition-all font-sans placeholder:text-neutral-600 disabled:opacity-40 disabled:bg-neutral-900 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && <p className="text-[10px] text-red-400 font-sans mt-1">{error}</p>}
    </div>
  );
}
