import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight, X } from "lucide-react";
import { ProjectRecord } from "./dashboardTypes";

interface HostingSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRecord;
  onOpenHostingTab: () => void;
}

export const HostingSetupModal: React.FC<HostingSetupModalProps> = ({
  isOpen,
  onClose,
  project,
  onOpenHostingTab,
}) => {
  if (!isOpen) return null;

  const pkg = String(project?.selectedPackage || "").toLowerCase();
  const isDominance = pkg.includes("dominance") || pkg.includes("catalyst");
  const isGrowth = pkg.includes("growth") || pkg.includes("fusion");
  const monthlyPrice = isDominance ? 1999 : isGrowth ? 999 : 499;
  const freeMonths = isDominance ? 3 : isGrowth ? 2 : 1;
  const planTitle = isDominance ? "Catalyst" : isGrowth ? "Fusion" : "Ignite";

  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + freeMonths);
  const formattedBillingDate = nextDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <AnimatePresence>
      <div 
        id="hosting-setup-modal-overlay" 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      >
        <motion.div
          id="hosting-setup-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-zinc-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-left space-y-6"
        >
          {/* Close button */}
          <button
            id="hosting-setup-modal-close-btn"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Close hosting modal"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-mono font-bold uppercase tracking-wider">
              <span>HOSTING INCLUDED</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-display">
              Your hosting is ready
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Your {planTitle} plan includes {freeMonths} month{freeMonths > 1 ? "s" : ""} of free hosting.
            </p>
          </div>

          {/* Simple Pricing & Billing Block */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-lg sm:text-xl font-extrabold text-emerald-400 font-display tracking-tight block">
                  {freeMonths} MONTHS FREE
                </span>
                <span className="text-xs text-zinc-400 mt-0.5 block">
                  ₹{monthlyPrice.toLocaleString("en-IN")} / month after that
                </span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold rounded-full shrink-0">
                ₹0 today
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                FIRST BILLING
              </span>
              <span className="text-sm font-bold text-white font-mono block mt-0.5">
                {formattedBillingDate}
              </span>
              <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                Your first hosting payment will be due on this date.
              </p>
            </div>
          </div>

          {/* Concise Benefits */}
          <div className="space-y-2 text-xs text-zinc-300">
            <div className="flex items-center gap-2.5">
              <Check size={14} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
              <span className="font-medium">Fast hosting</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check size={14} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
              <span className="font-medium">Automatic backups</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check size={14} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
              <span className="font-medium">Free SSL security</span>
            </div>
          </div>

          {/* Renewal Summary */}
          <p className="text-xs text-zinc-400 leading-relaxed pt-1">
            After your {freeMonths} free month{freeMonths > 1 ? "s" : ""}, hosting renews at ₹{monthlyPrice.toLocaleString("en-IN")}/month.
          </p>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              id="hosting-setup-modal-view-details-btn"
              onClick={() => {
                onClose();
                onOpenHostingTab();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider rounded-full transition-all shadow-lg active:scale-98 cursor-pointer"
            >
              <span>View Hosting Details</span>
              <ArrowRight size={15} />
            </button>

            <button
              id="hosting-setup-modal-later-btn"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer text-center block"
            >
              I&apos;ll do this later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

