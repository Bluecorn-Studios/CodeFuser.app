import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Clock, Loader2, ShieldAlert, Settings, Zap } from "lucide-react";

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
  const [isVerificationOn, setIsVerificationOn] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const fetchConfig = () => {
    fetch("/api/config/razorpay")
      .then((res) => res.json())
      .then((data) => {
        setIsVerificationOn(Boolean(data.verificationEnabled));
      })
      .catch(() => {
        setIsVerificationOn(false);
      });
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // PRODUCTION / VERIFICATION GUARD: Render nothing if RAZORPAY_VERIFICATION=true
  if (isVerificationOn) {
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
            DEVELOPER SETTINGS
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 uppercase flex items-center gap-1">
          <Settings className="w-2.5 h-2.5" /> DEV ONLY
        </span>
      </div>

      {/* Development Payment Mode Status Banner */}
      <div className="mb-5 p-3.5 rounded-xl bg-black/60 border border-amber-500/25 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Payment Mode: Simulation Engine Active
          </label>
          <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
            RAZORPAY_VERIFICATION=false
          </span>
        </div>
        <p className="text-[10px] text-neutral-400 leading-normal">
          Razorpay checkout is disabled. Payments automatically trigger the simulation engine, unlock the portal, and record transactions without requiring real card data.
        </p>
      </div>

      {/* Manual Immediate Trigger Button */}
      <div className="pt-1">
        <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-2">
          Manual Test Triggers
        </span>
        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => handleSimulate("success")}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mb-2.5"
        >
          {loadingAction === "success" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Simulating Success Flow...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Run Success Simulation Now ({term === "upfront" ? "100% Upfront" : term === "final" ? "Final 50%" : "50% Milestone"})</span>
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
