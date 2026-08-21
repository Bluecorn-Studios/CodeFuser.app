import React, { useState } from "react";
import { Coins, Check, FileText, Lock, AlertCircle, ShieldCheck, Download, Loader2 } from "lucide-react";
import { ProjectRecord, ExtraStore } from "./dashboardTypes";
import { supabase } from "../../lib/supabase";

interface PaymentsTabProps {
  project: ProjectRecord;
  selectedPackageName: string;
  finalPrice: number;
  paidFunds: number;
  unpaidFunds: number;
  handleFinalMilestonePayment: () => void;
  paymentLoading: boolean;
  paymentError: string | null;
  handleResetQuote: () => void;
  extraStore: ExtraStore;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  project,
  selectedPackageName,
  finalPrice,
  paidFunds,
  unpaidFunds,
  handleFinalMilestonePayment,
  paymentLoading,
  paymentError,
}) => {
  const isFullyPaid = project.paymentStatus === "paid" || unpaidFunds === 0;
  const isPartiallyPaid = !isFullyPaid && (project.paymentStatus === "partially_paid" || paidFunds > 0);
  const isUnpaid = !isFullyPaid && !isPartiallyPaid;

  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const displayReceiptNumber = project.payment?.receiptNumber || project.receiptNumber || `CF-REC-${(project.id || "CF").slice(0, 8).toUpperCase()}`;

  const handleDownloadReceipt = async () => {
    setDownloadingReceipt(true);
    setDownloadError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || localStorage.getItem("fuser_token") || "";

      const response = await fetch(`/api/projects/${project.id}/payment-receipt`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        let errorMsg = "Failed to download receipt statement.";
        try {
          const json = await response.json();
          if (json.error) errorMsg = json.error;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CodeFuser-Receipt-${displayReceiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Error downloading payment receipt:", err);
      setDownloadError(err.message || "Could not generate receipt PDF. Please try again.");
    } finally {
      setDownloadingReceipt(false);
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* SECTION HEADER */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block">
          Billing & Finances
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Your Payment Details
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Review your website package price, deposit confirmation, and remaining balance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Receipt Card */}
        <section className="p-6 sm:p-8 bg-neutral-950 border border-neutral-800/80 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <h2 className="text-base font-bold text-white">
              Payment Summary
            </h2>
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                isFullyPaid
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : isPartiallyPaid
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-amber-400 bg-amber-500/10 border-amber-500/20"
              }`}
            >
              {isFullyPaid ? "Fully Paid" : isPartiallyPaid ? "Deposit Received" : "Payment Pending"}
            </span>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-900">
              <span className="text-neutral-400">Website Package:</span>
              <span className="font-bold text-white text-sm">{selectedPackageName}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-neutral-900">
              <span className="text-neutral-400 font-medium">Total Website Price:</span>
              <span className="font-black text-white text-xl">₹{Math.round(finalPrice).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-neutral-900">
              <span className="text-emerald-400 font-bold">Amount Paid:</span>
              <span className="font-black text-emerald-400 text-xl">₹{Math.round(paidFunds).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center pb-2">
              <span className="text-neutral-300 font-bold">Remaining Balance:</span>
              <span className={`font-black text-xl ${unpaidFunds === 0 ? "text-emerald-400" : "text-white"}`}>
                {unpaidFunds === 0 ? "₹0 (Settled)" : `₹${Math.round(unpaidFunds).toLocaleString("en-IN")}`}
              </span>
            </div>
          </div>

          {paymentError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          {isPartiallyPaid ? (
            <div className="space-y-3 pt-2">
              <button
                onClick={handleFinalMilestonePayment}
                disabled={paymentLoading}
                className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-white/10"
              >
                {paymentLoading ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <Coins size={16} />
                    <span>Pay Remaining Balance (₹{Math.round(unpaidFunds).toLocaleString("en-IN")})</span>
                  </>
                )}
              </button>
              <p className="text-[11px] font-mono text-neutral-500 text-center flex items-center justify-center gap-1">
                <Lock size={12} />
                <span>Protected by 256-bit SSL Encryption</span>
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
              <ShieldCheck size={22} className="text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-400 block">
                  Payment Complete
                </span>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Thank you! Your website payment is fully settled.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: 50/50 Schedule & Statement */}
        <section className="p-6 sm:p-8 bg-neutral-950 border border-neutral-800/80 rounded-3xl space-y-6">
          <div className="border-b border-neutral-900 pb-4">
            <h2 className="text-base font-bold text-white">
              Payment Breakdown
            </h2>
          </div>

          <div className="space-y-4">
            {/* Deposit */}
            <div className="p-4 bg-black/60 border border-neutral-800 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">1. Initial Deposit (50%)</span>
                <span className={`text-xs block ${isPartiallyPaid || isFullyPaid ? "text-emerald-400" : "text-neutral-400"}`}>
                  ₹{Math.round(finalPrice * 0.5).toLocaleString("en-IN")} • {isPartiallyPaid || isFullyPaid ? "Received" : "Due"}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${
                isPartiallyPaid || isFullyPaid
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-amber-400 bg-amber-500/10 border-amber-500/20"
              }`}>
                {isPartiallyPaid || isFullyPaid ? "✓ Paid" : "Pending"}
              </span>
            </div>

            {/* Final Balance */}
            <div className="p-4 bg-black/60 border border-neutral-800 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">2. Final Payment (50%)</span>
                <span className={`text-xs block ${isFullyPaid ? "text-emerald-400" : "text-neutral-400"}`}>
                  ₹{Math.round(finalPrice * 0.5).toLocaleString("en-IN")} • {isFullyPaid ? "Paid" : "Due Before Launch"}
                </span>
              </div>
              {isFullyPaid ? (
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  ✓ Paid
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-neutral-300 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-700">
                  Due Before Launch
                </span>
              )}
            </div>
          </div>

          {/* Official Document Preview & Statement Download */}
          <div className="pt-4 border-t border-neutral-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                Official Business Receipt Preview
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                A4 PDF Ready
              </span>
            </div>

            {downloadError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}

            {/* Document Card Preview */}
            <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Header Dark Bar with CodeFuser Logo */}
              <div className="bg-black p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="CodeFuser" className="h-5 w-auto block select-none" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 block">
                    Digital Growth & Web Engineering
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-extrabold text-white block uppercase tracking-wider">
                    PAYMENT RECEIPT
                  </span>
                  <span className="text-[11px] font-mono font-bold text-white block">
                    #{displayReceiptNumber}
                  </span>
                </div>
              </div>

              {/* Document Body Details */}
              <div className="p-4 sm:p-5 space-y-4 text-xs">
                {/* FROM & BILL TO Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-zinc-900">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                      FROM / ISSUED BY
                    </span>
                    <span className="font-bold text-white block">CodeFuser Studio</span>
                    <span className="text-[11px] text-zinc-400 block">support@codefuser.com</span>
                    <span className="text-[11px] text-zinc-400 block">https://codefuser.in</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                      BILLED TO / CUSTOMER
                    </span>
                    <span className="font-bold text-white block">{project.clientName || "Valued Client"}</span>
                    <span className="text-[11px] text-zinc-300 font-medium block">{project.businessName || "Business Account"}</span>
                  </div>
                </div>

                {/* Status & Confirmation Banner */}
                <div className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                  isFullyPaid 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-white/5 border-white/10 text-zinc-200"
                }`}>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-extrabold uppercase block tracking-wider">
                      {isFullyPaid ? "✓ PAYMENT CONFIRMED — PAID IN FULL" : "✓ PARTIAL PAYMENT RECORDED"}
                    </span>
                    <p className="text-[11px] opacity-90">
                      {isFullyPaid
                        ? `Full project contract total of ₹${Math.round(finalPrice).toLocaleString("en-IN")} is settled. Balance due is ₹0.`
                        : `Received ₹${Math.round(paidFunds).toLocaleString("en-IN")}. Remaining balance due before launch is ₹${Math.round(unpaidFunds).toLocaleString("en-IN")}.`}
                    </p>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[10px] font-mono text-zinc-400">
                    Official System Generated Receipt • Instant PDF
                  </span>
                  <button
                    onClick={handleDownloadReceipt}
                    disabled={downloadingReceipt}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] min-h-[44px]"
                  >
                    {downloadingReceipt ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-black" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} className="text-black" />
                        <span>Download Official PDF Receipt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

