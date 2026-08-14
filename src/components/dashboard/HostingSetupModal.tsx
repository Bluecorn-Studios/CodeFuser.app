import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Server, Check, ArrowRight, ShieldCheck, Lock, Sparkles, X, Clock } from "lucide-react";
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg overflow-hidden bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left space-y-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Close setup modal"
          >
            <X size={18} />
          </button>

          {/* Header Banner */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest">
              <Sparkles size={13} />
              <span>Hosting Benefits Ready • {planTitle}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              YOUR HOSTING IS READY
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Your website project includes <strong className="text-emerald-400">{freeMonths} Month{freeMonths > 1 ? "s" : ""} FREE Promotional Hosting</strong>.
            </p>
          </div>

          {/* Offer Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">CodeFuser Cloud Hosting ({planTitle})</span>
                <span className="text-base font-extrabold text-white">₹{monthlyPrice.toLocaleString("en-IN")} / month</span>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
                First {freeMonths} Month{freeMonths > 1 ? "s" : ""} FREE (₹0 Charged Today)
              </span>
            </div>

            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>First payment date: <strong className="text-white">{formattedBillingDate}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Fast, reliable server to keep your website running 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Automatic backups & free website security lock (SSL)</span>
              </div>
            </div>
          </div>

          {/* Explanation Text */}
          <p className="text-xs text-neutral-400 leading-relaxed">
            After your free hosting period ends on <span className="text-neutral-200 font-semibold">{formattedBillingDate}</span>, hosting renewal invoices will be generated for manual payment so your website remains active and offline-free.
          </p>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenHostingTab();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/15 cursor-pointer"
            >
              <span>VIEW HOSTING DETAILS</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer text-center block"
            >
              I&apos;ll do this later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
