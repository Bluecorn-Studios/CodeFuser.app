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
  const isPartiallyPaid = project.paymentStatus === "partially_paid" || unpaidFunds > 0;
  const isFullyPaid = project.paymentStatus === "paid" || unpaidFunds === 0;

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
                  : "text-white bg-neutral-900 border-neutral-700"
              }`}
            >
              {isFullyPaid ? "Fully Paid" : "Deposit Received"}
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
                <span className="text-xs text-emerald-400 block">
                  ₹{Math.round(finalPrice * 0.5).toLocaleString("en-IN")} • Received
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ✓ Paid
              </span>
            </div>

            {/* Final Balance */}
            <div className="p-4 bg-black/60 border border-neutral-800 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">2. Final Payment (50%)</span>
                <span className="text-xs text-neutral-400 block">
                  ₹{Math.round(finalPrice * 0.5).toLocaleString("en-IN")} • Due Before Launch
                </span>
              </div>
              {unpaidFunds === 0 ? (
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

          {/* Statement */}
          <div className="pt-2 border-t border-neutral-900 space-y-3">
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">
              Official Payment Statement
            </span>

            {downloadError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}

            <div className="p-4 bg-black/60 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block truncate">
                  CodeFuser Receipt #{displayReceiptNumber}
                </span>
                <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
                  Verified Payment Record
                </span>
              </div>
              <button
                onClick={handleDownloadReceipt}
                disabled={downloadingReceipt}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-white rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2 shadow-lg"
              >
                {downloadingReceipt ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-amber-400" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} className="text-amber-400" />
                    <span>Download Statement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

