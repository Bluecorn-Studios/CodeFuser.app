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
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest block">
              {project.businessName || "Your Website Project"}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#EAE5D9] tracking-tight">
              Hello, {project.clientName || "Partner"}
            </h1>
            <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
              {isLive
                ? "Your website is live and ready for your customers!"
                : "Your website is in progress. We're currently building your visual structure and preparing your website launch."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {isLive ? (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Website Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Website In Progress
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-4">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-[#EAE5D9] font-semibold text-sm">Website Progress</span>
            <span className="text-[#EAE5D9] font-bold text-base">{progressPercent}% complete</span>
          </div>

          <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#EAE5D9] h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(234,229,217,0.4)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-900 text-xs">
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">Current step</span>
              <span className="text-[#EAE5D9] font-semibold block mt-0.5">
                {getCustomerStatusLabel(currentStageIndex)}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">Next step</span>
              <span className="text-neutral-300 font-medium block mt-0.5">
                {expectations.next.split(".")[0] || "Website Review"}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">Expected launch</span>
              <span className="text-neutral-300 font-medium block mt-0.5">
                {hasEmptyAssets ? "Awaiting your details" : planInfo.timeline.replace(" after asset submission", "")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ONE DOMINANT RECOMMENDED ACTION CARD */}
      <section className="p-6 sm:p-8 bg-gradient-to-br from-neutral-900/90 via-neutral-950 to-black border-2 border-[#EAE5D9]/30 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-semibold text-amber-400 tracking-wide uppercase">
            Action Needed From You
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#EAE5D9] tracking-tight">
          {primaryActionDetails.title}
        </h2>

        <p className="text-sm text-neutral-300 mt-2 max-w-2xl leading-relaxed">
          {primaryActionDetails.description}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={primaryActionDetails.action}
            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <span>{primaryActionDetails.btnText}</span>
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => onNavigateTab("help")}
            className="px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-medium text-xs rounded-2xl border border-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare size={14} className="text-amber-400" />
            <span>I Need Help</span>
          </button>

          {project.stagingUrl && (
            <a
              href={project.stagingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-2xl border border-neutral-800 transition-all flex items-center justify-center gap-2"
            >
              <span>View Staging Preview</span>
              <ExternalLink size={13} className="text-neutral-400" />
            </a>
          )}

          {project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs rounded-2xl border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Globe size={14} />
              <span>Visit Live Website</span>
            </a>
          )}
        </div>
      </section>

      {/* 3. "RIGHT NOW" & "NEXT" EXPLANATION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-2">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
            Right Now
          </span>
          <h3 className="text-sm font-bold text-[#EAE5D9]">What CodeFuser is working on</h3>
          <p className="text-xs text-neutral-300 leading-relaxed pt-1">
            {expectations.doing || "We are currently organizing your website layout and setting up your domain structure."}
          </p>
        </div>

        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-2">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Next Up
          </span>
          <h3 className="text-sm font-bold text-[#EAE5D9]">What happens after this</h3>
          <p className="text-xs text-neutral-300 leading-relaxed pt-1">
            {expectations.next || "We'll build your interactive website preview and send it for your review."}
          </p>
        </div>
      </section>

      {/* 4. COMPACT PAYMENT SUMMARY */}
      <section className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Payment Summary
          </span>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#EAE5D9] font-bold text-sm">{selectedPackageName}</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300 font-medium">Total: ₹{Math.round(finalPrice).toLocaleString("en-IN")}</span>
            <span className="text-neutral-500">•</span>
            <span className="text-emerald-400 font-semibold">Paid: ₹{Math.round(paidFunds).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unpaidFunds > 0 ? (
            <button
              onClick={handleFinalMilestonePayment}
              disabled={paymentLoading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0"
            >
              {paymentLoading ? "Processing..." : `Pay Balance (₹${Math.round(unpaidFunds).toLocaleString("en-IN")})`}
            </button>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              ✓ Fully Paid
            </span>
          )}

          <button
            onClick={() => onNavigateTab("payments")}
            className="text-xs text-neutral-400 hover:text-[#EAE5D9] font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none"
          >
            <span>View details</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </section>

      {/* 5. DIRECT WHATSAPP ASSISTANCE */}
      <section className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#EAE5D9]">Have questions or need to make changes?</h3>
          <p className="text-xs text-neutral-400">
            Chat directly with your CodeFuser developer on WhatsApp anytime.
          </p>
        </div>

        <a
          href={getWhatsAppLink(`Hi CodeFuser, I have a question about my website for ${project.businessName}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl border border-neutral-800 transition-all flex items-center gap-2 shrink-0"
        >
          <MessageSquare size={14} className="text-emerald-400" />
          <span>Chat on WhatsApp</span>
        </a>
      </section>
    </div>
  );
};
