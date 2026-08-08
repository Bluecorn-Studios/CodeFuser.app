import React from "react";
import { ArrowRight, Check, Sparkles, Globe, ExternalLink, MessageSquare, AlertCircle, Clock, ShieldCheck, ChevronRight } from "lucide-react";
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
  const isLive = currentStageIndex >= 5 || Boolean(project.websiteUrl);

  // Calculate dynamic progress percent
  const progressPercent = Math.min(
    100,
    Math.max(15, Math.round(((currentStageIndex + 1) / 5) * 100))
  );

  return (
    <div className="space-y-8 py-2">
      {/* 1. GREETING & PROGRESS HERO HEADER */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">
              {project.businessName || "Your Website Project"}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Hello, {project.clientName || "Partner"}
            </h1>
            <p className="text-sm text-neutral-300 max-w-xl leading-relaxed pt-1">
              {isLive
                ? "Your website is live and active for your customers worldwide."
                : "Your website is currently in production. We are building your custom layout and domain setup."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {isLive ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                WEBSITE LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                IN PRODUCTION
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Progress Indicator - Minimal & Big Display Typography */}
        <div className="p-8 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-neutral-900 pb-4">
            <div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block">Current Build Status</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {getCustomerStatusLabel(currentStageIndex)}
              </span>
            </div>
            {/* BIG DISPLAY NUMBER */}
            <div className="text-left sm:text-right">
              <span className="text-4xl sm:text-6xl font-black text-white tracking-tight block">
                {progressPercent}%
              </span>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Completed</span>
            </div>
          </div>

          <div className="w-full bg-neutral-900 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500 shadow-[0_0_16px_rgba(255,255,255,0.3)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs pt-2">
            <div>
              <span className="text-neutral-500 block text-[11px] font-bold uppercase tracking-wider">Current Stage</span>
              <span className="text-white font-bold block mt-1 text-sm">
                Stage {currentStageIndex + 1} of 5
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-bold uppercase tracking-wider">Up Next</span>
              <span className="text-neutral-300 font-medium block mt-1">
                {expectations.next.split(".")[0] || "Website Review"}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-bold uppercase tracking-wider">Target Delivery</span>
              <span className="text-neutral-300 font-medium block mt-1">
                {hasEmptyAssets ? "Awaiting your details" : planInfo.timeline.replace(" after asset submission", "")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ONE DOMINANT RECOMMENDED ACTION CARD (WHITE CHROME THEME) */}
      <section className="p-8 bg-neutral-950 border border-neutral-800 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-bold text-white tracking-widest uppercase">
            Recommended Action
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {primaryActionDetails.title}
        </h2>

        <p className="text-sm text-neutral-300 mt-2 max-w-2xl leading-relaxed">
          {primaryActionDetails.description}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* WHITE BUTTON */}
          <button
            onClick={primaryActionDetails.action}
            className="px-6 py-4 bg-white hover:bg-[#EAE5D9] text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-white/5"
          >
            <span>{primaryActionDetails.btnText}</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => onNavigateTab("help")}
            className="px-5 py-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs rounded-2xl border border-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare size={15} className="text-neutral-400" />
            <span>Need Assistance</span>
          </button>

          {project.stagingUrl && (
            <a
              href={project.stagingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl border border-neutral-800 transition-all flex items-center justify-center gap-2"
            >
              <span>View Staging Preview</span>
              <ExternalLink size={14} className="text-neutral-400" />
            </a>
          )}

          {project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-4 bg-white text-black font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Globe size={15} />
              <span>Visit Live Website</span>
            </a>
          )}
        </div>
      </section>

      {/* 3. "RIGHT NOW" & "NEXT" EXPLANATION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-2">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block">
            Current Phase
          </span>
          <h3 className="text-base font-bold text-white">What our team is working on</h3>
          <p className="text-xs text-neutral-300 leading-relaxed pt-1">
            {expectations.doing || "We are currently organizing your website layout and setting up your domain structure."}
          </p>
        </div>

        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-2">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block">
            Upcoming Phase
          </span>
          <h3 className="text-base font-bold text-white">What happens next</h3>
          <p className="text-xs text-neutral-300 leading-relaxed pt-1">
            {expectations.next || "We'll build your interactive website preview and send it for your review."}
          </p>
        </div>
      </section>

      {/* 4. COMPACT PAYMENT SUMMARY WITH WHITE BUTTON */}
      <section className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
            Payment Status
          </span>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-white font-bold text-sm">{selectedPackageName}</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-300 font-medium">Total: ₹{Math.round(finalPrice).toLocaleString("en-IN")}</span>
            <span className="text-neutral-600">•</span>
            <span className="text-emerald-400 font-bold">Paid: ₹{Math.round(paidFunds).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unpaidFunds > 0 ? (
            <button
              onClick={handleFinalMilestonePayment}
              disabled={paymentLoading}
              className="px-5 py-3 bg-white hover:bg-[#EAE5D9] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0 shadow-md"
            >
              {paymentLoading ? "Processing..." : `Pay Balance (₹${Math.round(unpaidFunds).toLocaleString("en-IN")})`}
            </button>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              ✓ Fully Settled
            </span>
          )}

          <button
            onClick={() => onNavigateTab("payments")}
            className="text-xs text-neutral-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none"
          >
            <span>View breakdown</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </section>

      {/* 5. DIRECT WHATSAPP ASSISTANCE */}
      <section className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">Have questions or custom requests?</h3>
          <p className="text-xs text-neutral-400">
            Chat directly with your CodeFuser project manager on WhatsApp.
          </p>
        </div>

        <a
          href={getWhatsAppLink(`Hi CodeFuser, I have a question about my website for ${project.businessName}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl border border-neutral-800 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <MessageSquare size={15} className="text-emerald-400" />
          <span>Chat on WhatsApp</span>
        </a>
      </section>
    </div>
  );
};
