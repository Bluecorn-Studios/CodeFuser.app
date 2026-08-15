import React from "react";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  Check, 
  Globe, 
  ExternalLink, 
  MessageSquare, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Layers,
  Phone,
  CreditCard,
  Zap,
  ArrowUpRight
} from "lucide-react";
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

  // Simple 6-step timeline in plain English
  const humanSteps = [
    { label: "Project Started", index: 0 },
    { label: "Business Info", index: 1 },
    { label: "Website Design", index: 2 },
    { label: "Development", index: 3 },
    { label: "Review & Polish", index: 4 },
    { label: "Website Live", index: 5 },
  ];

  const handleOpenStep = (stepKey: AssetStepKey) => {
    if (onOpenAssetModal) {
      onOpenAssetModal(stepKey);
    } else {
      onNavigateTab("project");
    }
  };

  // 5 simple checklist items for everyday local business owners
  const checklistItems = [
    {
      stepKey: "1" as AssetStepKey,
      icon: Phone,
      title: "1. Business Name & Contact Details",
      status: project.businessName && (project.whatsapp || project.email) ? "provided" : "needed",
      detail: project.businessName
        ? `${project.businessName} (${project.whatsapp || project.email || "Contact saved"})`
        : "Your official shop name, phone number, email and address.",
    },
    {
      stepKey: "2" as AssetStepKey,
      icon: Sparkles,
      title: "2. Business Logo or Shop Signboard",
      status: project.hasLogo && project.hasLogo !== "pending" ? "provided" : "needed",
      detail: project.hasLogo === "help"
        ? "CodeFuser is creating a custom logo design for you."
        : project.hasLogo && project.hasLogo !== "pending"
        ? "Logo file received."
        : "Upload your logo, take a photo of your shop board, or ask us to design one.",
    },
    {
      stepKey: "3" as AssetStepKey,
      icon: ImageIcon,
      title: "3. Photos of Your Work, Shop or Products",
      status: project.galleryReady && project.galleryReady !== "pending" ? "provided" : "needed",
      detail: project.galleryReady === "help"
        ? "Professional high-quality stock photos chosen."
        : project.galleryReady && project.galleryReady !== "pending"
        ? "Photos & work gallery received."
        : "Upload store/work photos from your phone, Google Drive, or ask for stock images.",
    },
    {
      stepKey: "4" as AssetStepKey,
      icon: FileText,
      title: "4. Services, Products & Price List",
      status: project.contentReady && project.contentReady !== "pending" ? "provided" : "needed",
      detail: project.contentReady === "help"
        ? "CodeFuser is writing professional copy for your pages."
        : project.contentReady && project.contentReady !== "pending"
        ? "Services and pricing info received."
        : "Type what you offer and your prices, or let our writers draft it for you.",
    },
    {
      stepKey: "5" as AssetStepKey,
      icon: Globe,
      title: "5. Preferred Website Address (Domain)",
      status: project.hasDomain && project.hasDomain !== "pending" ? "provided" : "needed",
      detail: project.hasDomain === "help"
        ? "CodeFuser domain registration assistant requested."
        : project.hasDomain && project.hasDomain !== "pending"
        ? project.hasDomain
        : "Give us your website name (like yourbusiness.com) or let us buy one for you.",
    },
  ];

  const completedCount = checklistItems.filter((i) => i.status === "provided").length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8 py-2 max-w-6xl mx-auto"
    >
      {/* 1. HERO HEADER: CLEAN MONOCHROME HIGH CONTRAST */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-800">
                {project.businessName || "Your Business Portal"}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Hello, {project.clientName || "Partner"}</span>
              <motion.span 
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block origin-bottom-right select-none text-2xl sm:text-4xl"
              >
                👋
              </motion.span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              {isLive
                ? "Your official website is now live, fast, and open to customers worldwide."
                : "Your website is currently in production. We are organizing your details and building your custom pages."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {isLive ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                WEBSITE IS LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-white/10 text-xs font-bold text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                IN PRODUCTION
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Progress Card with Ambient White Glow */}
        <motion.div 
          whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
          className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300"
        >
          {/* Subtle Ambient Radial Glow on Top Edge */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute top-0 right-1/4 w-96 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-zinc-900 pb-5">
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                Current Website Status
              </span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block tracking-tight">
                {getCustomerStatusLabel(currentStageIndex)}
              </span>
            </div>

            {/* BIG CRISP DISPLAY NUMBER WITH GLOW */}
            <div className="text-left sm:text-right">
              <span className="text-4xl sm:text-6xl font-black text-white tracking-tighter block drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {progressPercent}%
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Website Completed
              </span>
            </div>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="my-5 w-full bg-zinc-900 rounded-full h-3 overflow-hidden p-0.5 border border-white/5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-zinc-300 via-white to-white h-full rounded-full shadow-[0_0_12px_rgba(255,255,255,0.7)]"
            />
          </div>

          {/* Clean 6-Step Minimalist Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {humanSteps.map((step) => {
              const isDone = currentStageIndex > step.index || isLive;
              const isCurrent = currentStageIndex === step.index && !isLive;

              return (
                <div
                  key={step.index}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                    isCurrent
                      ? "bg-white text-black border-white font-extrabold shadow-[0_0_25px_rgba(255,255,255,0.25)] scale-[1.02]"
                      : isDone
                      ? "bg-zinc-900/90 border-white/20 text-white"
                      : "bg-zinc-950 border-zinc-900 text-zinc-600"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {isCurrent ? (
                      <span className="h-2 w-2 rounded-full bg-black animate-pulse shrink-0" />
                    ) : isDone ? (
                      <Check size={13} strokeWidth={3} className="text-white shrink-0" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-800 shrink-0" />
                    )}
                    <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${isCurrent ? "text-zinc-700" : "text-zinc-500"}`}>
                      Step {step.index + 1}
                    </span>
                  </div>
                  <span className="block truncate text-xs font-bold">{step.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* 2. ONE DOMINANT ACTION BOX: MAXIMUM CONTRAST & SLEEK GLOW */}
      <section>
        <motion.div 
          whileHover={{ borderColor: "rgba(255,255,255,0.3)" }}
          className="p-6 sm:p-8 bg-zinc-950 border border-white/15 rounded-2xl relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.04)] space-y-4"
        >
          {/* Top subtle highlight beam */}
          <div className="absolute top-0 left-1/3 w-1/3 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-[10px] font-mono font-extrabold text-zinc-300 tracking-widest uppercase">
              {hasEmptyAssets ? "Next Step for You" : "Current Project Update"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {primaryActionDetails.title}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            {primaryActionDetails.description}
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* SOLID MONO WHITE BUTTON WITH SHARP GLOW */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={primaryActionDetails.action}
              className="px-6 py-3.5 bg-white text-black hover:bg-zinc-100 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <span>{primaryActionDetails.btnText}</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </motion.button>

            {/* SECONDARY MINIMAL BUTTON */}
            <motion.button
              whileHover={{ borderColor: "rgba(255,255,255,0.3)", backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateTab("help")}
              className="px-5 py-3.5 bg-zinc-900 text-zinc-200 hover:text-white font-bold text-xs rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare size={15} className="text-zinc-400" />
              <span>Need Help? Chat With Us</span>
            </motion.button>

            {project.stagingUrl && (
              <a
                href={project.stagingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                <span>View Website Preview</span>
                <ExternalLink size={14} className="text-zinc-400" />
              </a>
            )}

            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-white text-black font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:bg-zinc-200"
              >
                <Globe size={15} />
                <span>Visit Live Website</span>
              </a>
            )}
          </div>
        </motion.div>
      </section>

      {/* 3. WHAT WE ARE DOING & WHAT HAPPENS NEXT (MINIMAL DUAL CARDS) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.2)" }}
          className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
              Right Now
            </span>
          </div>
          
          <h3 className="text-base font-bold text-white tracking-tight">What CodeFuser is working on</h3>
          
          <p className="text-xs text-zinc-400 leading-relaxed">
            {expectations.doing || "We are currently organizing your business information and setting up your custom website layout."}
          </p>

          <div className="pt-3 border-t border-zinc-900 space-y-1.5 text-xs text-zinc-400">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">Details you can send:</span>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-300 text-[11px] font-medium">✓ Shop Details</span>
              <span className="px-2.5 py-1 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-300 text-[11px] font-medium">✓ Logo & Photos</span>
              <span className="px-2.5 py-1 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-300 text-[11px] font-medium">✓ Web Address</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.2)" }}
          className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
              What Happens Next
            </span>
          </div>
          
          <h3 className="text-base font-bold text-white tracking-tight">You'll see it before we launch</h3>
          
          <p className="text-xs text-zinc-400 leading-relaxed">
            {expectations.next || "We'll build your interactive website preview and send it for your review. You can request any updates before we make it live."}
          </p>

          <div className="pt-3 border-t border-zinc-900 text-xs text-zinc-300 flex items-center gap-2">
            <ShieldCheck size={16} className="text-white shrink-0" />
            <span>100% Satisfaction Guarantee — unlimited initial design revisions.</span>
          </div>
        </motion.div>
      </section>

      {/* 4. WHAT WE NEED FROM YOU (5-STEP CHECKLIST) */}
      <section>
        <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">What We Need From You</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-white text-xs font-bold">
                  {completedCount} of 5 Complete
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Click "Send Details" or "Edit" on any item below to type your info or upload photos.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenStep("1")}
              className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles size={14} />
              <span>Open Setup Wizard</span>
            </motion.button>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold text-zinc-400">
              <span>Onboarding Progress</span>
              <span className="text-white font-mono">{Math.round((completedCount / 5) * 100)}%</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className="bg-white h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ width: `${Math.max(5, (completedCount / 5) * 100)}%` }}
              />
            </div>
          </div>

          {/* List of 5 items */}
          <div className="space-y-2.5 pt-1">
            {checklistItems.map((item, idx) => {
              const isProvided = item.status === "provided";
              const ItemIcon = item.icon;

              return (
                <motion.div
                  key={idx}
                  whileHover={{ borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.02)" }}
                  className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                      isProvided ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}>
                      {isProvided ? <Check size={16} strokeWidth={3} /> : <ItemIcon size={16} />}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">{item.title}</span>
                        {isProvided ? (
                          <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold">
                            ✓ Done
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold">
                            Action Needed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">{item.detail}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOpenStep(item.stepKey)}
                      className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isProvided 
                          ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700" 
                          : "bg-white text-black hover:bg-zinc-200 border-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      }`}
                    >
                      <span>{isProvided ? "Edit Details" : "Send Details"}</span>
                      <ChevronRight size={14} />
                    </motion.button>

                    <a
                      href={getWhatsAppLink(`Hi CodeFuser, I need a quick hand with ${item.title} for my website.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white font-medium rounded-lg border border-zinc-800 transition-all flex items-center justify-center gap-1"
                    >
                      <span>Need Help</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. PAYMENT SUMMARY: CRISP MONO HIGH-CONTRAST (NO RANDOM AMBER) */}
      <section>
        <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Your Billing Summary</h2>
              <p className="text-xs text-zinc-400">Selected Plan: {selectedPackageName}</p>
            </div>
            
            <button
              onClick={() => onNavigateTab("payments")}
              className="text-xs text-zinc-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Invoice & Receipts</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-zinc-400 block text-[11px] font-mono font-medium uppercase">Total Website Price</span>
              <span className="text-2xl font-black text-white block tracking-tight">
                ₹{Math.round(finalPrice).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-zinc-400 block text-[11px] font-mono font-medium uppercase">Amount Paid</span>
              <span className="text-2xl font-black text-white block tracking-tight">
                ₹{Math.round(paidFunds).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-zinc-400 block text-[11px] font-mono font-medium uppercase">Remaining Balance</span>
              <span className="text-2xl font-black text-white block tracking-tight">
                {unpaidFunds === 0 ? "₹0 (Fully Paid)" : `₹${Math.round(unpaidFunds).toLocaleString("en-IN")}`}
              </span>
            </div>
          </div>

          {unpaidFunds > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-900/80 border border-white/10 rounded-xl">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-xs font-bold text-white block">
                  Remaining balance is due upon website completion or launch.
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  You can pay now or after inspecting your preview.
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFinalMilestonePayment}
                disabled={paymentLoading}
                className="w-full sm:w-auto px-6 py-3 bg-white text-black hover:bg-zinc-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
              >
                {paymentLoading ? "Processing..." : `Pay Remaining ₹${Math.round(unpaidFunds).toLocaleString("en-IN")}`}
              </motion.button>
            </div>
          ) : (
            <div className="p-4 bg-zinc-900/80 border border-white/10 rounded-xl text-center text-xs text-white font-bold flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className="text-white" />
              <span>Your website payment is fully settled. Thank you!</span>
            </div>
          )}
        </div>
      </section>

      {/* 6. DIRECT WHATSAPP & SUPPORT ASSISTANCE: MONO SHARP DESIGN */}
      <section>
        <motion.div 
          whileHover={{ borderColor: "rgba(255,255,255,0.25)" }}
          className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-[0_0_40px_rgba(0,0,0,0.6)]"
        >
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Need Any Help With Your Website?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Have a question? Need help sending photos? Want to request a change? Message your CodeFuser project manager on WhatsApp anytime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <motion.a
              whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(255,255,255,0.3)" }}
              whileTap={{ scale: 0.98 }}
              href={getWhatsAppLink(`Hi CodeFuser, I have a question about my website for ${project.businessName || "My Business"}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-black hover:bg-zinc-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <MessageSquare size={16} />
              <span>Chat on WhatsApp</span>
            </motion.a>

            <button
              onClick={() => onNavigateTab("help")}
              className="w-full sm:w-auto px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View FAQs & Email</span>
            </button>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
};
