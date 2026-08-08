import React from "react";
import { ArrowRight, Check, Sparkles, Clock, Globe, ShieldCheck, Coins, ExternalLink, MessageSquare, AlertCircle } from "lucide-react";
import { ProjectRecord, PlanInfo } from "./dashboardTypes";
import { TabType } from "./ClientHeader";

interface OverviewTabProps {
  project: ProjectRecord;
  currentStageIndex: number;
  getCustomerStatusLabel: (index: number) => string;
  primaryActionDetails: {
    title: string;
    description: string;
    btnText: string;
    action: () => void;
  };
  selectedPackageName: string;
  planInfo: PlanInfo;
  hasEmptyAssets: boolean;
  finalPrice: number;
  paidFunds: number;
  unpaidFunds: number;
  onNavigateTab: (tab: TabType) => void;
  handleFinalMilestonePayment: () => void;
  paymentLoading: boolean;
  paymentError: string | null;
  getWhatsAppLink: (msg: string) => string;
  getStageExpectations: (index: number) => {
    happening: string;
    waitingFor: string;
    doing: string;
    next: string;
  };
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  project,
  currentStageIndex,
  getCustomerStatusLabel,
  primaryActionDetails,
  selectedPackageName,
  planInfo,
  hasEmptyAssets,
  finalPrice,
  paidFunds,
  unpaidFunds,
  onNavigateTab,
  handleFinalMilestonePayment,
  paymentLoading,
  paymentError,
  getWhatsAppLink,
  getStageExpectations,
}) => {
  const expectations = getStageExpectations(currentStageIndex);
  const isLive = currentStageIndex >= 5 || project.websiteUrl;

  return (
    <div className="space-y-6">
      {/* 1. HERO SECTION */}
      <section className="bg-black border border-neutral-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-900">
          <div>
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold block mb-1">
              Client Portal Overview
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight uppercase">
              Hello, {project.clientName || "Partner"} 👋
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-sans">
              Workspace for <strong className="text-white">{project.businessName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full uppercase border border-emerald-500/20">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> Website Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-full uppercase border border-amber-500/20">
                <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-ping" /> Website In Progress
              </span>
            )}
          </div>
        </div>

        {/* 2. THE NEXT ACTION CARD (MOST IMPORTANT COMPONENT) */}
        <div className="mt-6 bg-gradient-to-r from-amber-500/10 via-neutral-950 to-neutral-950 border-2 border-amber-500/30 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                RECOMMENDED ACTION
              </span>
            </div>
            <span className="text-[9px] font-mono text-neutral-500 uppercase font-semibold hidden sm:inline">
              Step 1 of 1 Priority
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white font-display tracking-tight leading-snug">
            {primaryActionDetails.title}
          </h2>

          <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed font-sans max-w-2xl">
            {primaryActionDetails.description}
          </p>

          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={primaryActionDetails.action}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold uppercase tracking-wider text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_16px_rgba(245,158,11,0.25)]"
            >
              <span>{primaryActionDetails.btnText}</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>

            {project.stagingUrl && (
              <a
                href={project.stagingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold text-xs font-sans flex items-center justify-center gap-1.5 border border-neutral-800 transition-all"
              >
                <span>View Staging Draft</span>
                <ExternalLink size={13} className="text-neutral-400" />
              </a>
            )}

            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-semibold text-xs font-sans flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Visit Live Website</span>
                <Globe size={13} className="text-emerald-400" />
              </a>
            )}
          </div>
        </div>

        {/* 3. QUICK SUMMARY STATS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-900">
            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">Package</span>
            <span className="text-xs font-bold text-amber-500 font-mono block mt-1 uppercase truncate">
              {selectedPackageName.replace(" Package", "")}
            </span>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-900">
            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">Current Phase</span>
            <span className="text-xs font-bold text-white block mt-1 uppercase truncate">
              {getCustomerStatusLabel(currentStageIndex)}
            </span>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-900">
            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">Payment</span>
            <span className="text-xs font-bold text-emerald-400 font-mono block mt-1 uppercase">
              {unpaidFunds === 0 ? "100% Paid" : `₹${paidFunds.toLocaleString("en-IN")} Paid`}
            </span>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-900">
            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">Est. Delivery</span>
            <span className="text-xs font-bold text-white block mt-1 truncate">
              {hasEmptyAssets ? "Awaiting Assets" : planInfo.timeline.replace(" after asset submission", "")}
            </span>
          </div>
        </div>
      </section>

      {/* 4. PROJECT JOURNEY STEPPER */}
      <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div>
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider font-bold block">
              Project Roadmap
            </span>
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-tight">
              Website Creation Journey
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab("project")}
            className="text-xs font-mono font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none"
          >
            Full Progress Details →
          </button>
        </div>

        {/* 5-Stage Visual Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {[
            { step: 0, title: "1. Project Started", desc: "Requirements & Intake" },
            { step: 1, title: "2. Design Draft", desc: "Layout & Visuals" },
            { step: 2, title: "3. Development", desc: "Interactions & Mobile" },
            { step: 3, title: "4. Review & Approval", desc: "Client Sign-off" },
            { step: 4, title: "5. Website Live", desc: "Domain & Launch" },
          ].map((st) => {
            const isCompleted = currentStageIndex > st.step;
            const isActive = currentStageIndex === st.step;
            return (
              <div
                key={st.step}
                className={`p-3 rounded-2xl border transition-all ${
                  isActive
                    ? "bg-amber-500/10 border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                    : isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-neutral-950 border-neutral-900 text-neutral-500"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold">
                    {isCompleted ? "✓ DONE" : isActive ? "IN PROGRESS" : "UPCOMING"}
                  </span>
                  {isCompleted ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : isActive ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  ) : null}
                </div>
                <div className="text-xs font-bold font-sans text-white leading-tight">{st.title}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5 truncate">{st.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CONCIERGE PROJECT GUIDE */}
      <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-900 pb-3">
          <Sparkles size={15} className="text-amber-500 animate-pulse" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            WHAT'S HAPPENING RIGHT NOW?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider block">
              Current Activity
            </span>
            <p className="text-neutral-200 font-medium leading-relaxed">{expectations.happening}</p>
          </div>

          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider block">
              What CodeFuser Is Doing
            </span>
            <p className="text-neutral-200 font-medium leading-relaxed">{expectations.doing}</p>
          </div>

          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider block">
              What We Need From You
            </span>
            <p className="text-neutral-200 font-medium leading-relaxed">{expectations.waitingFor}</p>
          </div>

          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider block">
              What Happens Next
            </span>
            <p className="text-neutral-200 font-medium leading-relaxed">{expectations.next}</p>
          </div>
        </div>
      </section>

      {/* 6. PAYMENTS & SUPPORT SUMMARY (TWO COLUMN GRID ON DESKTOP) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Card Snapshot */}
        <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Coins size={14} className="text-amber-500" />
              Payment Summary
            </h3>
            <button
              onClick={() => onNavigateTab("payments")}
              className="text-[10px] font-mono text-amber-500 font-bold hover:underline cursor-pointer bg-transparent border-none"
            >
              Full Details →
            </button>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
              <span className="text-neutral-400">Total Project Rate:</span>
              <span className="font-bold text-white font-mono">₹{Math.round(finalPrice).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
              <span className="text-emerald-400">Amount Paid:</span>
              <span className="font-bold text-emerald-400 font-mono">₹{Math.round(paidFunds).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center pb-1">
              <span className="text-neutral-400">Remaining Balance:</span>
              <span className={`font-bold font-mono ${unpaidFunds === 0 ? "text-emerald-400" : "text-amber-500"}`}>
                {unpaidFunds === 0 ? "₹0 (Fully Paid)" : `₹${Math.round(unpaidFunds).toLocaleString("en-IN")}`}
              </span>
            </div>

            {paymentError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {unpaidFunds > 0 && (
              <button
                onClick={handleFinalMilestonePayment}
                disabled={paymentLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.2)] mt-3"
              >
                {paymentLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Coins size={14} />
                    <span>Pay Remaining Balance (₹{Math.round(unpaidFunds).toLocaleString("en-IN")})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </section>

        {/* Support Direct Help */}
        <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <MessageSquare size={14} className="text-emerald-400" />
              Need Quick Help?
            </h3>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
              Direct Support
            </span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Have questions about your design, content, or launch? Chat with CodeFuser support directly on WhatsApp.
          </p>

          <a
            href={getWhatsAppLink(`Hi CodeFuser, I have a question about my website project: ${project.businessName}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-neutral-800"
          >
            <MessageSquare size={14} className="text-emerald-400" />
            <span>Chat on WhatsApp</span>
          </a>
        </section>
      </div>
    </div>
  );
};
