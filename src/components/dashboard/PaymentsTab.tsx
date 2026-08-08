import React from "react";
import { Coins, Check, FileText, Lock, AlertCircle, ShieldCheck } from "lucide-react";
import { ProjectRecord, ExtraStore } from "./dashboardTypes";

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
  handleResetQuote,
  extraStore,
}) => {
  const isPartiallyPaid = project.paymentStatus === "partially_paid" || unpaidFunds > 0;
  const isFullyPaid = project.paymentStatus === "paid" || unpaidFunds === 0;

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="bg-black border border-neutral-900 rounded-3xl p-6">
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold block mb-1">
          Financial Center
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight uppercase">
          Payments & Billing Summary
        </h2>
        <p className="text-xs text-neutral-400 mt-1 font-sans">
          Review your package rate, deposit status, milestone payments, and secure Razorpay payment receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Price Summary & Pay Action */}
        <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Coins size={15} className="text-amber-500" />
              Package Billing Status
            </h3>
            <span
              className={`text-[9px] font-mono px-2.5 py-0.5 rounded border uppercase font-bold ${
                isFullyPaid
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-amber-400 bg-amber-500/10 border-amber-500/20"
              }`}
            >
              {isFullyPaid ? "Fully Settled" : "50% Advance Paid"}
            </span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
              <span className="text-neutral-400">Selected Package:</span>
              <span className="font-bold text-white uppercase">{selectedPackageName}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
              <span className="text-neutral-400">Total Project Rate:</span>
              <span className="font-bold text-white font-mono text-sm">₹{Math.round(finalPrice).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
              <span className="text-emerald-400 font-semibold">Amount Paid To Date:</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">₹{Math.round(paidFunds).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
              <span className="text-neutral-400 font-semibold">Outstanding Balance:</span>
              <span className={`font-black font-mono text-sm ${unpaidFunds === 0 ? "text-emerald-400" : "text-amber-500"}`}>
                {unpaidFunds === 0 ? "₹0 (Fully Paid)" : `₹${Math.round(unpaidFunds).toLocaleString("en-IN")}`}
              </span>
            </div>
          </div>

          {paymentError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400 font-sans flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          {isPartiallyPaid ? (
            <div className="space-y-3 pt-2">
              <button
                onClick={handleFinalMilestonePayment}
                disabled={paymentLoading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(245,158,11,0.25)]"
              >
                {paymentLoading ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <Coins size={15} />
                    <span>Pay Final Balance (₹{Math.round(unpaidFunds).toLocaleString("en-IN")})</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-neutral-500 font-sans text-center">
                🔒 Secure 256-bit encrypted transaction processed via Razorpay Gateway.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
              <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block">
                  Payment Fully Settled
                </span>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  Thank you! Your website project is 100% paid and secured.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Milestone Schedule & Receipts */}
        <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <FileText size={15} className="text-neutral-400" />
              Milestone Schedule
            </h3>
            <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold">Billing Split</span>
          </div>

          <div className="space-y-3 font-sans">
            {/* Milestone 1 */}
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">1. Onboarding Deposit (50%)</span>
                <span className="text-[11px] font-mono text-emerald-400 mt-0.5 block">
                  ₹{Math.round(finalPrice * 0.5).toLocaleString("en-IN")} • Confirmed & Received
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">
                PAID
              </span>
            </div>

            {/* Milestone 2 */}
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">2. Final Milestone (50%)</span>
                <span className="text-[11px] font-mono text-neutral-400 mt-0.5 block">
                  ₹{Math.round(finalPrice * 0.5).toLocaleString("en-IN")} • Due Before Website Launch
                </span>
              </div>
              {unpaidFunds === 0 ? (
                <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">
                  PAID
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase">
                  DUE
                </span>
              )}
            </div>
          </div>

          {/* Receipt Statement */}
          <div className="pt-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-2 font-bold">
              Official Payment Receipt
            </span>
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block truncate">
                  Receipt #{(project.id || "CF").slice(0, 8).toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
                  Verified CodeFuser Transaction
                </span>
              </div>
              <button
                onClick={() => alert("Your receipt is logged on CodeFuser servers. You can request a PDF copy from support.")}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-xl text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                Download Statement
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
