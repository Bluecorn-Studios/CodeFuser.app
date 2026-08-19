import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Clock, Loader2, ShieldAlert, Settings, Zap } from "lucide-react";

interface PaymentSimulationPanelProps {
  projectId: string;
  term?: string;
  getAuthToken?: () => string | null;
  getAdminHeaders?: (extra?: Record<string, string>) => Record<string, string>;
  onSuccess: (project: any) => void;
  onStatusChange?: (status: string, message: string) => void;
  className?: string;
}

export const PaymentSimulationPanel: React.FC<PaymentSimulationPanelProps> = ({
  projectId,
  term = "upfront",
  getAuthToken,
  getAdminHeaders,
  onSuccess,
  onStatusChange,
  className = ""
}) => {
  const [isVerificationOn, setIsVerificationOn] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"success" | "failed" | "cancelled" | "pending" | null>(null);

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

  const handleSimulateConfirm = (action: "success" | "failed" | "cancelled" | "pending") => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const handleSimulate = async (action: "success" | "failed" | "cancelled" | "pending") => {
    setShowConfirmModal(false);
    if (!projectId) {
      setMessage({ type: "error", text: "We couldn't find an active project ID for this test." });
      return;
    }

    setLoadingAction(action);
    setMessage(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (getAdminHeaders) {
        Object.assign(headers, getAdminHeaders());
      } else {
        const token = getAuthToken ? getAuthToken() : null;
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const adminPass = sessionStorage.getItem("fuser_admin_password");
        if (adminPass) {
          headers["x-admin-password"] = adminPass;
        }
      }

      const res = await fetch(`/api/projects/${projectId}/simulate-payment`, {
        method: "POST",
        headers,
        body: JSON.stringify({ term, action })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Payment test ${action} failed.`);
      }

      if (action === "success") {
        setMessage({ type: "success", text: "✓ Payment test successful! Project marked as paid & portal unlocked." });
        if (onStatusChange) onStatusChange("success", "Payment test completed successfully.");
        setTimeout(() => {
          onSuccess(data.project);
        }, 800);
      } else if (action === "failed") {
        setMessage({ type: "error", text: "✕ Payment test failure recorded." });
        if (onStatusChange) onStatusChange("failed", "Payment test failed.");
      } else if (action === "cancelled") {
        setMessage({ type: "info", text: "⚠ Payment test cancellation recorded." });
        if (onStatusChange) onStatusChange("cancelled", "Payment test cancelled.");
      } else if (action === "pending") {
        setMessage({ type: "info", text: "⏳ Payment test pending state recorded." });
        if (onStatusChange) onStatusChange("pending", "Payment test pending.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "We couldn't complete the payment test." });
    } finally {
      setLoadingAction(null);
      setPendingAction(null);
    }
  };

  return (
    <div className={`mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-left font-sans ${className}`}>
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-white" />
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            DEVELOPER PAYMENT TEST SUITE
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold bg-neutral-900 text-neutral-300 px-2 py-0.5 rounded border border-neutral-800 uppercase flex items-center gap-1">
          <Settings className="w-2.5 h-2.5" /> TEST ONLY
        </span>
      </div>

      {/* Development Payment Mode Status Banner */}
      <div className="mb-5 p-3.5 rounded-xl bg-black border border-neutral-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-white" /> Payment Mode: Testing Sandbox Active
          </label>
          <span className="text-[9px] font-mono font-bold text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
            RAZORPAY_VERIFICATION=false
          </span>
        </div>
        <p className="text-[10px] text-neutral-400 leading-normal">
          Test only — no real payment is collected. Use this panel to verify project state transitions, receipt generation, and milestone unlocks without real gateway transactions.
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
          onClick={() => handleSimulateConfirm("success")}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mb-2.5"
        >
          {loadingAction === "success" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Running Payment Test...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Run Payment Test ({term === "upfront" ? "100% Upfront" : term === "final" ? "Final 50%" : "50% Milestone"})</span>
            </>
          )}
        </button>

        {/* Optional State Triggers */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={() => handleSimulateConfirm("failed")}
            className="flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-red-950/50 text-red-400 border border-red-500/30 font-semibold text-[10px] uppercase tracking-wider py-2 px-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingAction === "failed" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <XCircle className="w-3 h-3 text-red-400" />
            )}
            <span>Test Failed Flow</span>
          </button>

          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={() => handleSimulateConfirm("cancelled")}
            className="flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 font-semibold text-[10px] uppercase tracking-wider py-2 px-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingAction === "cancelled" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-white" />
            )}
            <span>Test Cancelled Flow</span>
          </button>

          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={() => handleSimulateConfirm("pending")}
            className="flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-blue-950/50 text-blue-400 border border-blue-500/30 font-semibold text-[10px] uppercase tracking-wider py-2 px-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingAction === "pending" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Clock className="w-3 h-3 text-blue-400" />
            )}
            <span>Test Pending Flow</span>
          </button>
        </div>
      </div>

      {/* CUSTOM CONFIRMATION MODAL FOR PAYMENT TEST */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-bold">
                ⚡
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Run payment test?</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Test only — no real payment is collected.</p>
              </div>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-900">
              This marks the selected project as paid for testing. It does not charge a customer.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => pendingAction && handleSimulate(pendingAction)}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-extrabold transition-all cursor-pointer"
              >
                Run Test
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mt-3 p-2.5 rounded-lg text-xs font-mono ${
            message.type === "success"
              ? "bg-neutral-900 text-white border border-neutral-800"
              : message.type === "error"
              ? "bg-red-950/40 text-red-300 border border-red-500/30"
              : "bg-neutral-900 text-neutral-300 border border-neutral-800"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};
