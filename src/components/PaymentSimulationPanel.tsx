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
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [isProduction, setIsProduction] = useState<boolean>(false);
  const [devPaymentMode, setDevPaymentMode] = useState<"auto_simulate" | "razorpay_test" | "live_production">("auto_simulate");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isChangingMode, setIsChangingMode] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const fetchDevConfig = () => {
    fetch("/api/config/dev-payment-mode")
      .then((res) => res.json())
      .then((data) => {
        setIsProduction(Boolean(data.isProduction));
        setIsDevMode(!data.isProduction || Boolean(import.meta.env.DEV));
        if (data.mode) {
          setDevPaymentMode(data.mode);
        }
      })
      .catch(() => {
        setIsDevMode(Boolean(import.meta.env.DEV));
      });
  };

  useEffect(() => {
    fetchDevConfig();
  }, []);

  // PRODUCTION SAFETY GUARD: Render nothing if strictly production
  if (isProduction) {
    return null;
  }

  const handleModeChange = async (newMode: "auto_simulate" | "razorpay_test" | "live_production") => {
    if (newMode === devPaymentMode || isChangingMode) return;
    setIsChangingMode(true);
    setMessage(null);

    try {
      const res = await fetch("/api/config/dev-payment-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDevPaymentMode(newMode);
        setMessage({
          type: "info",
          text: `Updated Development Payment Mode to: ${
            newMode === "auto_simulate"
              ? "Automatic Success Simulation (No Razorpay Popup)"
              : newMode === "razorpay_test"
              ? "Razorpay Test Mode"
              : "Live Production Mode"
          }`
        });
      } else {
        throw new Error(data.error || "Failed to update payment mode.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to change payment mode." });
    } finally {
      setIsChangingMode(false);
    }
  };

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

      {/* Development Payment Mode Single Toggle */}
      <div className="mb-5 p-3.5 rounded-xl bg-black/60 border border-amber-500/25 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Development Payment Mode
          </label>
          <span className="text-[9px] font-mono font-bold text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
            {devPaymentMode === "auto_simulate" ? "⚡ AUTO SIMULATE" : devPaymentMode === "razorpay_test" ? "🧪 TEST MODE" : "🔒 LIVE MODE"}
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {/* Option 1: Automatic Success Simulation */}
          <label className={`flex items-start gap-2.5 text-xs text-neutral-200 cursor-pointer p-2 rounded-lg transition-colors ${devPaymentMode === 'auto_simulate' ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-neutral-900/60'}`}>
            <input
              type="radio"
              name="devPaymentMode"
              value="auto_simulate"
              checked={devPaymentMode === "auto_simulate"}
              disabled={isProduction || isChangingMode}
              onChange={() => handleModeChange("auto_simulate")}
              className="mt-0.5 accent-amber-500 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <div>
              <span className="font-bold text-white block">Automatic Success Simulation</span>
              <span className="text-[10px] text-neutral-400 leading-tight block">
                Skips Razorpay checkout popup completely. Instantly triggers backend payment success flow, unlocks client portal & advances pages.
              </span>
            </div>
          </label>

          {/* Option 2: Razorpay Test Mode */}
          <label className={`flex items-start gap-2.5 text-xs text-neutral-200 cursor-pointer p-2 rounded-lg transition-colors ${devPaymentMode === 'razorpay_test' ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-neutral-900/60'}`}>
            <input
              type="radio"
              name="devPaymentMode"
              value="razorpay_test"
              checked={devPaymentMode === "razorpay_test"}
              disabled={isProduction || isChangingMode}
              onChange={() => handleModeChange("razorpay_test")}
              className="mt-0.5 accent-amber-500 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <div>
              <span className="font-bold text-white block">Razorpay Test Mode</span>
              <span className="text-[10px] text-neutral-400 leading-tight block">
                Opens the standard Razorpay checkout modal using test keys for manual test card transactions.
              </span>
            </div>
          </label>

          {/* Option 3: Live Production Mode (disabled in development) */}
          <label className={`flex items-start gap-2.5 text-xs text-neutral-400 p-2 rounded-lg transition-colors ${!isProduction ? 'opacity-50 cursor-not-allowed bg-neutral-950/40' : devPaymentMode === 'live_production' ? 'bg-emerald-500/10 border border-emerald-500/30' : ''}`}>
            <input
              type="radio"
              name="devPaymentMode"
              value="live_production"
              checked={devPaymentMode === "live_production"}
              disabled={!isProduction || isChangingMode}
              onChange={() => handleModeChange("live_production")}
              className="mt-0.5 accent-amber-500 text-amber-500 focus:ring-amber-500 cursor-not-allowed"
            />
            <div>
              <span className="font-bold block text-neutral-300">
                Live Production Mode <span className="text-[9px] uppercase font-mono text-amber-500 font-extrabold ml-1">(disabled in development)</span>
              </span>
              <span className="text-[10px] text-neutral-500 leading-tight block">
                Full production checkout with live Razorpay signature verification and strict payment gateway enforcement.
              </span>
            </div>
          </label>
        </div>
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
