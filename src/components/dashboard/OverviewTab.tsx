import React from "react";
import { ArrowRight, Check, Globe, ExternalLink, MessageSquare, ChevronRight, Sparkles, Clock, ShieldCheck, AlertCircle, HelpCircle, CheckCircle2 } from "lucide-react";
import { ProjectRecord, PlanInfo } from "./dashboardTypes";
import { TabType } from "./ClientHeader";
import { AssetStepKey } from "./OnboardingAssetModal";

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
  onOpenAssetModal?: (stepKey?: AssetStepKey) => void;
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
  onOpenAssetModal,
  handleFinalMilestonePayment,
  paymentLoading,
  paymentError,
  getWhatsAppLink,
  getStageExpectations,
}) => {
  const expectations = getStageExpectations(currentStageIndex);
  const isLive = currentStageIndex >= 5 || Boolean(project.websiteUrl);

  // Dynamic progress percentage
  const progressPercent = isLive
    ? 100
    : Math.min(95, Math.max(20, Math.round(((currentStageIndex + 1) / 6) * 100)));

  // Simple human progress steps
  const humanSteps = [
    { label: "Project Started", index: 0 },
    { label: "Business Info", index: 1 },
    { label: "Website Design", index: 2 },
    { label: "Development", index: 3 },
    { label: "Website Review", index: 4 },
    { label: "Website Live", index: 5 },
  ];

  const handleOpenStep = (stepKey: AssetStepKey) => {
    if (onOpenAssetModal) {
      onOpenAssetModal(stepKey);
    } else {
      onNavigateTab("project");
    }
  };

  // What we need checklist state checks
  const checklistItems = [
    {
      stepKey: "1" as AssetStepKey,
      title: "1. Business Name & Contact Details",
      status: project.businessName && (project.whatsapp || project.email) ? "provided" : "needed",
      detail: project.businessName
        ? `${project.businessName} (${project.whatsapp || project.email || "Contact details saved"})`
        : "Provide business name, phone number, email & address",
    },
    {
      stepKey: "2" as AssetStepKey,
      title: "2. Business Logo or Shop Signboard",
      status: project.hasLogo && project.hasLogo !== "pending" ? "provided" : "needed",
      detail: project.hasLogo === "help"
        ? "🪄 CodeFuser custom logo design requested"
        : project.hasLogo && project.hasLogo !== "pending"
        ? "Logo provided"
        : "Upload your logo file, shop sign image, or ask us to design one",
    },
    {
      stepKey: "3" as AssetStepKey,
      title: "3. Photos of Your Work, Shop or Products",
      status: project.galleryReady && project.galleryReady !== "pending" ? "provided" : "needed",
      detail: project.galleryReady === "help"
        ? "🪄 Professional stock photos selected"
        : project.galleryReady && project.galleryReady !== "pending"
        ? project.galleryReady
        : "Upload store/work photos, Drive link, or use stock images",
    },
    {
      stepKey: "4" as AssetStepKey,
      title: "4. Services, Products & Price List",
      status: project.contentReady && project.contentReady !== "pending" ? "provided" : "needed",
      detail: project.contentReady === "help"
        ? "🪄 CodeFuser copywriting requested"
        : project.contentReady && project.contentReady !== "pending"
        ? "Services & text provided"
        : "Type your offerings & prices or ask us for writing help",
    },
    {
      stepKey: "5" as AssetStepKey,
      title: "5. Preferred Website Address (Domain)",
      status: project.hasDomain && project.hasDomain !== "pending" ? "provided" : "needed",
      detail: project.hasDomain === "help"
        ? "🪄 CodeFuser domain concierge setup requested"
        : project.hasDomain && project.hasDomain !== "pending"
        ? project.hasDomain
        : "Provide your domain name or let us register one for you",
    },
  ];

  const completedCount = checklistItems.filter((i) => i.status === "provided").length;

  return (
    <div className="space-y-8 py-2">
      {/* 1. HERO GREETING */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-extrabold text-neutral-400 uppercase tracking-widest block">
              {project.businessName || "Your Business Workspace"}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Hello, {project.clientName || "Partner"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed pt-1">
              {isLive
                ? "Your website is live and active for your customers worldwide!"
                : "Your website is in progress. We're currently collecting your business details and preparing your custom website design."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {isLive ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                WEBSITE LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-700 text-xs font-bold text-neutral-200">
                <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                IN PRODUCTION
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Progress Card */}
        <div className="p-6 sm:p-8 bg-neutral-950 border border-neutral-800/80 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-neutral-900 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block">Current Website Status</span>
              <span className="text-lg sm:text-xl font-extrabold text-white mt-1 block">
                {getCustomerStatusLabel(currentStageIndex)}
              </span>
            </div>
            {/* BIG DISPLAY NUMBER */}
            <div className="text-left sm:text-right">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight block">
                {progressPercent}%
              </span>
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">Website Completed</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-900 rounded-full h-3 overflow-hidden p-0.5 border border-neutral-800">
            <div
              className="bg-white h-full rounded-full transition-all duration-500 shadow-md shadow-white/20"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Simple 6-step timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {humanSteps.map((step) => {
              const isDone = currentStageIndex > step.index || isLive;
              const isCurrent = currentStageIndex === step.index && !isLive;

              return (
                <div
                  key={step.index}
                  className={`p-3 rounded-2xl border text-xs font-semibold transition-all ${
                    isDone
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : isCurrent
                      ? "bg-white text-black border-white font-extrabold shadow-md"
                      : "bg-neutral-900/50 border-neutral-900 text-neutral-500"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {isDone ? (
                      <span className="text-emerald-400 font-bold">✓</span>
                    ) : isCurrent ? (
                      <span className="h-2 w-2 rounded-full bg-black animate-pulse shrink-0" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-neutral-700 shrink-0" />
                    )}
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-80">
                      Stage {step.index + 1}
                    </span>
                  </div>
                  <span className="block truncate text-xs">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. ONE DOMINANT RECOMMENDED ACTION CARD */}
      <section className="p-6 sm:p-8 bg-neutral-950 border border-neutral-800 rounded-3xl relative overflow-hidden shadow-2xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-mono font-extrabold text-neutral-300 tracking-widest uppercase">
            {hasEmptyAssets ? "Action Needed From You" : "Project Progress Update"}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {primaryActionDetails.title}
        </h2>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
          {primaryActionDetails.description}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* MONOCHROME WHITE BUTTON */}
          <button
            onClick={primaryActionDetails.action}
            className="px-6 py-3.5 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl hover:scale-[1.01]"
          >
            <span>{primaryActionDetails.btnText}</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => onNavigateTab("help")}
            className="px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs rounded-2xl border border-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare size={15} className="text-neutral-400" />
            <span>I Need Help</span>
          </button>

          {project.stagingUrl && (
            <a
              href={project.stagingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl border border-neutral-800 transition-all flex items-center justify-center gap-2"
            >
              <span>View Website Preview</span>
              <ExternalLink size={14} className="text-neutral-400" />
            </a>
          )}

          {project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 bg-emerald-500 text-black font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Globe size={15} />
              <span>Visit Live Website</span>
            </a>
          )}
        </div>
      </section>

      {/* 3. "RIGHT NOW" & "NEXT" EXPLANATION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-neutral-950 border border-neutral-800/80 rounded-3xl space-y-3">
          <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block">
            Right Now
          </span>
          <h3 className="text-base font-bold text-white">What CodeFuser is working on</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {expectations.doing || "We are currently organizing your business information and setting up your custom website layout."}
          </p>

          <div className="pt-2 border-t border-neutral-900 space-y-1.5 text-xs text-neutral-400">
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">Details you can send:</span>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 bg-black rounded-lg border border-neutral-800 text-neutral-300 text-[11px] font-medium">✓ Business Info</span>
              <span className="px-2.5 py-1 bg-black rounded-lg border border-neutral-800 text-neutral-300 text-[11px] font-medium">✓ Logo & Photos</span>
              <span className="px-2.5 py-1 bg-black rounded-lg border border-neutral-800 text-neutral-300 text-[11px] font-medium">✓ Website Address</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-neutral-950 border border-neutral-800/80 rounded-3xl space-y-3">
          <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block">
            What Happens Next
          </span>
          <h3 className="text-base font-bold text-white">You'll see it before we launch</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {expectations.next || "We'll build your interactive website preview and send it for your review. You can request any updates before we make it live."}
          </p>

          <div className="pt-2 border-t border-neutral-900 text-xs text-neutral-300 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>100% Satisfaction Guarantee — unlimited initial design revisions.</span>
          </div>
        </div>
      </section>

      {/* 4. "WHAT WE NEED FROM YOU" CHECKLIST */}
      <section className="p-6 sm:p-8 bg-neutral-950 border border-neutral-800/80 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">What We Need From You</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-white text-xs font-bold">
                {completedCount} of 5 Complete
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Click "Send / Edit Details" on any item below to quickly type info or upload files.
            </p>
          </div>

          <button
            onClick={() => handleOpenStep("1")}
            className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles size={14} />
            <span>Open Asset Wizard</span>
          </button>
        </div>

        {/* Completion Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-neutral-400">
            <span>Onboarding Progress</span>
            <span className="text-white font-mono">{Math.round((completedCount / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden border border-neutral-800">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, (completedCount / 5) * 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {checklistItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-black/60 border border-neutral-800/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-700 hover:bg-neutral-900/40 transition-all"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  {item.status === "provided" ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Done
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] font-bold">
                      ● Action Needed
                    </span>
                  )}
                  <span className="text-xs font-bold text-white truncate">{item.title}</span>
                </div>
                <p className="text-xs text-neutral-400 pl-1">{item.detail}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => handleOpenStep(item.stepKey)}
                  className="px-3.5 py-2.5 bg-neutral-900 hover:bg-white hover:text-black text-xs font-bold text-white rounded-xl border border-neutral-800 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>{item.status === "provided" ? "Edit Details" : "Send Details"}</span>
                  <ChevronRight size={14} />
                </button>
                <a
                  href={getWhatsAppLink(`Hi CodeFuser, I need help with ${item.title} for my website.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white font-bold rounded-xl border border-neutral-800 transition-all flex items-center justify-center gap-1"
                >
                  <span>Need Help</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PAYMENT SUMMARY */}
      <section className="p-6 sm:p-8 bg-neutral-950 border border-neutral-800/80 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Your Payment</h2>
            <p className="text-xs text-neutral-400">Selected plan: {selectedPackageName}</p>
          </div>
          <button
            onClick={() => onNavigateTab("payments")}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View payment history</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-black/60 border border-neutral-900 rounded-2xl space-y-1">
            <span className="text-neutral-400 block text-[11px] font-medium uppercase">Website Price</span>
            <span className="text-xl font-extrabold text-[#EAE5D9] block">
              ₹{Math.round(finalPrice).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-4 bg-black/60 border border-neutral-900 rounded-2xl space-y-1">
            <span className="text-emerald-400 block text-[11px] font-bold uppercase">Amount Paid</span>
            <span className="text-xl font-extrabold text-emerald-400 block">
              ₹{Math.round(paidFunds).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-4 bg-black/60 border border-neutral-900 rounded-2xl space-y-1">
            <span className="text-amber-400 block text-[11px] font-bold uppercase">Remaining Balance</span>
            <span className={`text-xl font-extrabold block ${unpaidFunds === 0 ? "text-emerald-400" : "text-amber-400"}`}>
              {unpaidFunds === 0 ? "₹0 (Settled)" : `₹${Math.round(unpaidFunds).toLocaleString("en-IN")}`}
            </span>
          </div>
        </div>

        {unpaidFunds > 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <span className="text-xs text-amber-300 font-medium text-center sm:text-left">
              Remaining balance is due upon website completion or launch.
            </span>
            <button
              onClick={handleFinalMilestonePayment}
              disabled={paymentLoading}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0 shadow-lg shadow-amber-500/20"
            >
              {paymentLoading ? "Processing..." : `Pay Remaining ₹${Math.round(unpaidFunds).toLocaleString("en-IN")}`}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center text-xs text-emerald-400 font-bold">
            ✓ Your website payment is fully settled. Thank you!
          </div>
        )}
      </section>

      {/* 6. DIRECT WHATSAPP & SUPPORT ASSISTANCE */}
      <section className="p-6 sm:p-8 bg-neutral-950 border border-neutral-900 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-base font-bold text-[#EAE5D9]">Help With Your Website?</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Have a question? Need help sending information? Want to request a change? Message your CodeFuser project manager on WhatsApp anytime.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <a
            href={getWhatsAppLink(`Hi CodeFuser, I have a question about my website for ${project.businessName || "My Business"}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <MessageSquare size={16} />
            <span>Chat on WhatsApp</span>
          </a>

          <button
            onClick={() => onNavigateTab("help")}
            className="w-full sm:w-auto px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs rounded-2xl border border-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View FAQs & Email</span>
          </button>
        </div>
      </section>
    </div>
  );
};

