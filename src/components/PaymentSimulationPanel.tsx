import React, { useState, useEffect } from "react";
import { Play, CheckCircle, XCircle, AlertTriangle, Clock, Loader2, ShieldAlert } from "lucide-react";

interface PaymentSimulationPanelProps {
  projectId: string;
  term?: string;
  getAuthToken: () => string | null;
  onSuccess: (project: any) => void;
  onStatusChange?: (status: string, message: string) => void;
  className?: string;
}

export const PaymentSimulationPanel: React.FC<PaymentSimulationPanelProps> = ({
  projectId,
  term = "upfront",
  getAuthToken,
  onSuccess,
  onStatusChange,
  className = ""
}) => {
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    // Determine if simulation mode is active on backend
    let isMounted = true;
    fetch("/api/config/razorpay")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          // Double check both frontend env and backend response
          const isDev = Boolean(data.isDevSimulation || import.meta.env.DEV);
          setIsDevMode(isDev);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsDevMode(Boolean(import.meta.env.DEV));
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // PRODUCTION SAFETY GUARD: Render nothing if not in dev mode
  if (!isDevMode) {
    return null;
  }

  const handleSimulate = async (action: "success" | "failed" | "cancelled" | "pending") => {
    if (!projectId) {
      setMessage({ type: "error", text: "No active project ID found for simulation." });
      return;
    }

    setLoadingAction(action);
    setMessage(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/simulate-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken() || ""}`
        },
        body: JSON.stringify({ term, action })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Simulation ${action} failed.`);
      }

      if (action === "success") {
        setMessage({ type: "success", text: "✓ Simulated Payment Successful! Unlocking portal & updating status..." });
        if (onStatusChange) onStatusChange("success", "Payment simulated successfully.");
        setTimeout(() => {
          onSuccess(data.project);
        }, 800);
      } else if (action === "failed") {
        setMessage({ type: "error", text: "✕ Simulated Payment Failure recorded." });
        if (onStatusChange) onStatusChange("failed", "Simulated transaction failed.");
      } else if (action === "cancelled") {
        setMessage({ type: "info", text: "⚠ Simulated Payment Cancellation recorded." });
        if (onStatusChange) onStatusChange("cancelled", "Simulated transaction cancelled.");
      } else if (action === "pending") {
        setMessage({ type: "info", text: "⏳ Simulated Payment Pending state set." });
        if (onStatusChange) onStatusChange("pending", "Simulated transaction pending.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Simulation request error." });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className={`mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-left font-sans ${className}`}>
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
            DEV PAYMENT SIMULATION MODE
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 uppercase">
          DEV ONLY
        </span>
      </div>

      <p className="text-xs text-neutral-300 leading-relaxed mb-4">
        Simulate complete post-payment workflows without making real payments. Reuses the core backend payment success & audit flow.
      </p>

      {/* Main Success Trigger */}
      <button
        type="button"
        disabled={loadingAction !== null}
        onClick={() => handleSimulate("success")}
        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mb-3"
      >
        {loadingAction === "success" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            <span>Simulating Success Flow...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Simulate Successful Payment ({term === "upfront" ? "100% Upfront" : term === "final" ? "Final 50%" : "50% Milestone"})</span>
          </>
        )}
      </button>

      {/* Optional State Triggers */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => handleSimulate("failed")}
          className="flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-red-950/50 text-red-400 border border-red-500/30 font-semibold text-[10px] uppercase tracking-wider py-2 px-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {loadingAction === "failed" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <XCircle className="w-3 h-3 text-red-400" />
          )}
          <span>Simulate Failed</span>
        </button>

        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => handleSimulate("cancelled")}
          className="flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-amber-950/50 text-amber-400 border border-amber-500/30 font-semibold text-[10px] uppercase tracking-wider py-2 px-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {loadingAction === "cancelled" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <AlertTriangle className="w-3 h-3 text-amber-400" />
          )}
          <span>Simulate Cancelled</span>
        </button>

        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => handleSimulate("pending")}
          className="flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-blue-950/50 text-blue-400 border border-blue-500/30 font-semibold text-[10px] uppercase tracking-wider py-2 px-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {loadingAction === "pending" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Clock className="w-3 h-3 text-blue-400" />
          )}
          <span>Simulate Pending</span>
        </button>
      </div>

      {message && (
        <div
          className={`mt-3 p-2.5 rounded-lg text-xs font-mono ${
            message.type === "success"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : message.type === "error"
              ? "bg-red-500/20 text-red-300 border border-red-500/30"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};
