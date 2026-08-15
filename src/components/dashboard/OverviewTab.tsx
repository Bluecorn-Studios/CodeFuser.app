import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  Check, 
  Globe, 
  ExternalLink, 
  MessageSquare, 
  ChevronRight, 
  ChevronDown,
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Layers,
  Phone,
  CreditCard,
  Zap,
  ArrowUpRight,
  Copy,
  Calendar,
  Lock,
  Upload,
  X,
  Send,
  Smartphone,
  Search,
  Building2,
  Server,
  RefreshCw,
  Clock,
  AlertTriangle,
  Activity
} from "lucide-react";
import { ProjectRecord, PlanInfo, ChangeRequestItem } from "./dashboardTypes";
import { TabType } from "./ClientHeader";
import { AssetStepKey } from "./OnboardingAssetModal";
import { getAuthToken } from "../../utils/auth";

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

  // Status strings
  const statusStr = (project.status || "").toLowerCase();
  const isExplicitLive = statusStr.includes("live");
  
  // Real lifecycle determination: 100% completed milestone defaults to READY_TO_LAUNCH, NOT automatically LAUNCHED
  const launchStatus = project.launchStatus || (isExplicitLive ? "LAUNCHED" : currentStageIndex >= 8 ? "READY_TO_LAUNCH" : "IN_PROGRESS");
  const websiteStatus = project.websiteStatus || (launchStatus === "LAUNCHED" ? "ONLINE" : "OFFLINE");
  const healthStatus = String(project.healthStatus || (launchStatus === "LAUNCHED" ? "healthy" : "unknown")).toLowerCase();

  // Website is LIVE strictly when launchStatus is LAUNCHED and websiteStatus is ONLINE (and not degraded/unhealthy)
  const isLive = launchStatus === "LAUNCHED" && websiteStatus === "ONLINE" && healthStatus !== "degraded" && healthStatus !== "unhealthy" && healthStatus !== "unreachable";

  // State for 100% Live Workspace interactions
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [changeRequestText, setChangeRequestText] = useState("");
  const [attachedPhotoName, setAttachedPhotoName] = useState<string | null>(null);
  const [attachedPhotoPreview, setAttachedPhotoPreview] = useState<string | null>(null);
  const [changeRequestStatus, setChangeRequestStatus] = useState<string | null>(null);
  const [changeRequests, setChangeRequests] = useState<ChangeRequestItem[]>(() => {
    return (project.quote?.changeRequests as ChangeRequestItem[]) || [];
  });
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isSubmittingChange, setIsSubmittingChange] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestSectionRef = useRef<HTMLDivElement>(null);

  // Fetch change requests from server
  useEffect(() => {
    if (!project.id) return;
    const fetchRequests = async () => {
      setIsLoadingRequests(true);
      try {
        const token = getAuthToken();
        const res = await fetch(`/api/projects/${project.id}/change-requests`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const body = await res.json();
          if (body.success && Array.isArray(body.data)) {
            setChangeRequests(body.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch change requests:", err);
      } finally {
        setIsLoadingRequests(false);
      }
    };
    fetchRequests();
  }, [project.id]);

  // Growth feature inquiry modal/state
  const [selectedGrowthFeature, setSelectedGrowthFeature] = useState<{ title: string; desc: string } | null>(null);

  // Resolve authentic live website URL
  const getLiveWebsiteUrl = (): string => {
    if (project.websiteUrl && project.websiteUrl.trim() !== "") {
      return project.websiteUrl.startsWith("http") ? project.websiteUrl : `https://${project.websiteUrl}`;
    }
    const rawDomain = project.hasDomain || "";
    if (rawDomain && rawDomain !== "help" && rawDomain !== "not_required" && rawDomain !== "pending" && rawDomain !== "no") {
      const cleanDomain = rawDomain.replace("Provided: ", "").replace("Help buy: ", "").trim();
      if (cleanDomain.includes(".")) {
        return cleanDomain.startsWith("http") ? cleanDomain : `https://${cleanDomain}`;
      }
    }
    if (project.stagingUrl && project.stagingUrl.trim() !== "") {
      return project.stagingUrl.startsWith("http") ? project.stagingUrl : `https://${project.stagingUrl}`;
    }
    const cleanName = (project.businessName || "yourbusiness").toLowerCase().replace(/[^a-z0-9]/g, "");
    return `https://${cleanName || "mywebsite"}.codefuser.com`;
  };

  const liveUrl = getLiveWebsiteUrl();
  const displayUrl = liveUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Real completion date formatting
  const getCompletionDate = (): string => {
    const rawDate = project.purchaseDate || project.timestamp;
    if (rawDate) {
      try {
        const d = new Date(rawDate);
        return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
      } catch {}
    }
    return new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  // Real free hosting end date (1 year / 12 months free with CodeFuser packages)
  const getFreeHostingEndDate = (): string => {
    const rawDate = project.purchaseDate || project.timestamp || new Date().toISOString();
    try {
      const d = new Date(rawDate);
      d.setFullYear(d.getFullYear() + 1);
      return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "1 Year from Launch";
    }
  };

  const handleCopyLiveUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(liveUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleOpenStep = (stepKey: AssetStepKey) => {
    if (onOpenAssetModal) {
      onOpenAssetModal(stepKey);
    } else {
      onNavigateTab("project");
    }
  };

  // 5 Website Content items
  const checklistItems = [
    {
      stepKey: "1" as AssetStepKey,
      icon: Phone,
      title: "1. Business Name & Contact Details",
      status: project.businessName && (project.whatsapp || project.email) ? "provided" : "needed",
      detail: project.businessName
        ? `${project.businessName} • ${project.whatsapp || project.email || "Contact active"}`
        : "Official shop name, phone number, email and address.",
    },
    {
      stepKey: "2" as AssetStepKey,
      icon: Sparkles,
      title: "2. Business Logo & Branding",
      status: project.hasLogo && project.hasLogo !== "pending" ? "provided" : "needed",
      detail: project.hasLogo === "help"
        ? "Custom CodeFuser brand design active."
        : project.hasLogo && project.hasLogo !== "pending"
        ? "Official logo branding active."
        : "Upload your logo or shop signboard image.",
    },
    {
      stepKey: "3" as AssetStepKey,
      icon: ImageIcon,
      title: "3. Photos of Your Work & Shop",
      status: project.galleryReady && project.galleryReady !== "pending" ? "provided" : "needed",
      detail: project.galleryReady === "help"
        ? "Curated high-resolution stock photo gallery."
        : project.galleryReady && project.galleryReady !== "pending"
        ? "Store & work photo gallery active."
        : "Store photos, shop gallery, or stock images.",
    },
    {
      stepKey: "4" as AssetStepKey,
      icon: FileText,
      title: "4. Services, Products & Price List",
      status: project.contentReady && project.contentReady !== "pending" ? "provided" : "needed",
      detail: project.contentReady === "help"
        ? "Professional copywriting & service menu active."
        : project.contentReady && project.contentReady !== "pending"
        ? "Custom services and pricing catalog active."
        : "Services list, product offerings, and prices.",
    },
    {
      stepKey: "5" as AssetStepKey,
      icon: Globe,
      title: "5. Official Website Address (Domain)",
      status: project.hasDomain && project.hasDomain !== "pending" ? "provided" : "needed",
      detail: project.hasDomain && project.hasDomain !== "pending"
        ? displayUrl
        : "Custom domain address connected to live servers.",
    },
  ];

  const completedCount = checklistItems.filter((i) => i.status === "provided").length;

  // Dynamic progress percentage calculation for build state
  let computedPercent = 20;
  if (isLive) {
    computedPercent = 100;
  } else if (currentStageIndex <= 2) {
    computedPercent = Math.round(20 + (completedCount / checklistItems.length) * 30);
  } else {
    computedPercent = Math.min(95, Math.max(55, Math.round(((currentStageIndex + 1) / 6) * 100)));
  }
  const progressPercent = computedPercent;

  // 6-step build timeline
  const humanSteps = [
    { label: "Project Started", index: 0 },
    { label: "Business Info", index: 1 },
    { label: "Website Design", index: 2 },
    { label: "Development", index: 3 },
    { label: "Review & Polish", index: 4 },
    { label: "Website Live", index: 5 },
  ];

  // Quick Change Request handling
  const quickChips = [
    "Change our opening hours",
    "Change our phone number",
    "Add a new photo",
    "Update our prices",
    "Change something on our homepage"
  ];

  const handleChipClick = (chip: string) => {
    if (changeRequestText.includes(chip)) return;
    setChangeRequestText((prev) => (prev ? `${prev}\n• ${chip}` : `• ${chip}: `));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAttachedPhotoName(null);
    setAttachedPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendChangeRequest = async () => {
    if (!changeRequestText.trim() && !attachedPhotoName) return;
    setIsSubmittingChange(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/projects/${project.id}/change-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          requestText: changeRequestText.trim() || (attachedPhotoName ? `Photo update: ${attachedPhotoName}` : "Website update request"),
          category: "General Update",
          photoName: attachedPhotoName || undefined,
          photoUrl: attachedPhotoPreview || undefined,
          priority: "NORMAL"
        })
      });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          setChangeRequests(prev => [body.data, ...prev]);
        }
      }

      setChangeRequestStatus("Your request has been received! Our team will update your live website within 24 hours.");
      setTimeout(() => {
        setChangeRequestText("");
        setAttachedPhotoName(null);
        setAttachedPhotoPreview(null);
        setIsSubmittingChange(false);
      }, 1000);
      setTimeout(() => setChangeRequestStatus(null), 6000);
    } catch (err) {
      console.error("Error submitting change request:", err);
      // Fallback local update
      const fallbackItem: ChangeRequestItem = {
        id: `REQ-${Date.now()}`,
        projectId: project.id,
        requestText: changeRequestText.trim() || "Website update request",
        category: "General Update",
        status: "SUBMITTED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        photoName: attachedPhotoName || undefined
      };
      setChangeRequests(prev => [fallbackItem, ...prev]);
      setChangeRequestStatus("Your request has been received! Our team will update your live website within 24 hours.");
      setTimeout(() => {
        setChangeRequestText("");
        setAttachedPhotoName(null);
        setAttachedPhotoPreview(null);
        setIsSubmittingChange(false);
      }, 1000);
      setTimeout(() => setChangeRequestStatus(null), 6000);
    }
  };

  const scrollToChangeRequest = () => {
    if (requestSectionRef.current) {
      requestSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Growth Feature cards
  const growthFeatures = [
    {
      id: "booking",
      title: "Online Booking",
      desc: "Let customers book appointments and consultations directly on your website 24/7.",
      icon: Calendar
    },
    {
      id: "whatsapp",
      title: "WhatsApp Automation",
      desc: "Help customers get quick instant replies and receive direct lead alerts on your phone.",
      icon: MessageSquare
    },
    {
      id: "payments",
      title: "Online Payments",
      desc: "Accept Google Pay, PhonePe, credit cards, and QR payments seamlessly.",
      icon: CreditCard
    },
    {
      id: "seo",
      title: "SEO Growth",
      desc: "Help more local customers find your business at the top of Google search and Maps.",
      icon: Zap
    },
    {
      id: "dashboard",
      title: "Business Dashboard",
      desc: "See useful monthly customer visitor counts, popular pages, and lead inquiries.",
      icon: Layers
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8 py-2 max-w-6xl mx-auto font-sans"
    >
      {/* ========================================================================= */}
      {/* 100% LIVE WEBSITE STATE OR BUILD IN-PRODUCTION STATE                     */}
      {/* ========================================================================= */}

      {isLive ? (
        /* ======================================================================= */
        /* MODE: 100% LIVE WEBSITE OWNERSHIP & GROWTH WORKSPACE                    */
        /* ======================================================================= */
        <>
          {/* 1. HERO AREA — YOUR WEBSITE IS LIVE */}
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
                  Your website is ready for customers. It is fully live, secure, and open worldwide.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white shadow-[0_0_25px_rgba(255,255,255,0.15)]">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  WEBSITE IS LIVE
                </span>
              </div>
            </div>

            {/* DOMINANT LIVE LAUNCH CARD */}
            <motion.div 
              whileHover={{ borderColor: "rgba(255,255,255,0.25)" }}
              className="p-6 sm:p-8 bg-zinc-950 border border-white/15 rounded-2xl relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)] backdrop-blur-xl"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="absolute top-0 right-1/4 w-96 h-32 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-mono font-extrabold text-zinc-300 tracking-widest uppercase">
                      Official Launch
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    YOUR WEBSITE IS LIVE
                  </h2>

                  <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                    Your website is ready for customers. You can visit it right now, share it with clients, or request any text and photo changes below.
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs flex items-center gap-2 max-w-md truncate">
                      <Lock size={12} className="text-emerald-400 shrink-0" />
                      <span className="truncate">{displayUrl}</span>
                    </div>

                    <button
                      onClick={handleCopyLiveUrl}
                      className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-xs transition-colors cursor-pointer"
                      title="Copy website address"
                    >
                      {copiedUrl ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <motion.a
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-4 bg-white text-black hover:bg-zinc-100 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.25)] transition-all cursor-pointer text-center"
                  >
                    <Globe size={16} />
                    <span>Visit My Website ↗</span>
                  </motion.a>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={scrollToChangeRequest}
                    className="px-5 py-4 bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <span>Request a Change</span>
                    <ArrowRight size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </section>

          {/* 2. LIVE WEBSITE CARD & PREVIEW SNAPSHOT */}
          <section className="space-y-4">
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-white" />
                    <h3 className="text-lg font-bold text-white tracking-tight">Website Snapshot</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Live production instance running on high-speed cloud infrastructure.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    <span>Visit Website</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Browser Window Frame */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-2xl">
                {/* Browser top address bar */}
                <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>

                  <div className="flex-1 max-w-lg mx-auto bg-black/60 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 font-mono flex items-center justify-center gap-2 truncate">
                    <Lock size={12} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{liveUrl}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white p-1 text-xs"
                      title="Open in new window"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* Browser visual preview container */}
                <div className="p-8 sm:p-12 bg-[#080808] flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow-[0_0_25px_rgba(255,255,255,0.1)]">
                    <Globe size={28} />
                  </div>

                  <div className="space-y-1 max-w-md">
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      {project.businessName || "Your Official Business Website"}
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono">
                      {displayUrl}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 font-extrabold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2"
                    >
                      <span>Open Live Website</span>
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. WEBSITE HEALTH STATUS */}
          <section>
            <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-white" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Website Health</h3>
                </div>
                <span className="text-[11px] font-mono font-medium text-zinc-400">
                  {project.lastHealthCheck
                    ? `Verified ${new Date(project.lastHealthCheck).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
                    : "Verified Live"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Website Status</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${websiteStatus === "ONLINE" && healthStatus !== "degraded" ? "bg-emerald-400" : "bg-zinc-400"}`} />
                    <span className="text-xs font-bold text-white">{websiteStatus === "ONLINE" ? "Online" : "Attention"}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Domain / DNS</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${project.dnsStatus === "connected" || websiteStatus === "ONLINE" ? "bg-emerald-400" : "bg-zinc-500"}`} />
                    <span className="text-xs font-bold text-white">{project.dnsStatus === "connected" || websiteStatus === "ONLINE" ? "Connected" : "Pending"}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Security & SSL</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${project.sslStatus === "active" || liveUrl.startsWith("https://") ? "bg-emerald-400" : "bg-zinc-500"}`} />
                    <span className="text-xs font-bold text-white">{project.sslStatus === "active" || liveUrl.startsWith("https://") ? "Active SSL" : "Standard"}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Search Index</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${websiteStatus === "ONLINE" ? "bg-emerald-400" : "bg-zinc-500"}`} />
                    <span className="text-xs font-bold text-white">{websiteStatus === "ONLINE" ? "Ready" : "In Queue"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. PRESERVED COMPLETED PROJECT JOURNEY */}
          <section>
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-white tracking-tight">Project completed</span>
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Completed and launched on {getCompletionDate()}
                  </p>
                </div>

                <button
                  onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-200 hover:text-white border border-zinc-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isTimelineOpen ? "Hide launch timeline" : "View launch timeline"}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isTimelineOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              <AnimatePresence>
                {isTimelineOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-zinc-900 space-y-2 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {[
                        { label: "Website started", desc: "Project initiated & secured" },
                        { label: "Content received", desc: "Logo, details & photos gathered" },
                        { label: "Website built", desc: "Responsive pages coded & styled" },
                        { label: "Review completed", desc: "Design inspected & approved" },
                        { label: "Website launched", desc: "Live domain & SSL activated" }
                      ].map((step, idx) => (
                        <div key={idx} className="p-3 bg-zinc-900/60 border border-white/10 rounded-xl space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                            <Check size={13} strokeWidth={3} className="text-emerald-400 shrink-0" />
                            <span className="truncate">{step.label}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 truncate">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 5. QUICK ACTIONS: REQUEST A CHANGE */}
          <section ref={requestSectionRef}>
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                  Quick actions
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                  Request a Change
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Need to update your opening hours, phone number, prices, or photos? Type your request below and we will update your live website.
                </p>
              </div>

              {/* Suggestion Chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 font-bold block">Quick suggestions:</span>
                <div className="flex flex-wrap gap-2">
                  {quickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChipClick(chip)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Request Textarea */}
              <div className="space-y-3">
                <textarea
                  value={changeRequestText}
                  onChange={(e) => setChangeRequestText(e.target.value)}
                  placeholder="Type your request here (e.g., Please change our Sunday closing time to 8:00 PM, and update our contact phone number)..."
                  rows={4}
                  className="w-full p-4 bg-zinc-900/70 border border-zinc-800 focus:border-white/30 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition-all resize-none leading-relaxed"
                />

                {/* Attached Photo Display */}
                {attachedPhotoName && (
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {attachedPhotoPreview ? (
                        <img src={attachedPhotoPreview} alt="Preview" className="w-9 h-9 object-cover rounded-lg border border-zinc-700 shrink-0" />
                      ) : (
                        <ImageIcon size={18} className="text-zinc-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{attachedPhotoName}</span>
                        <span className="text-[10px] text-zinc-400 block">Attached photo</span>
                      </div>
                    </div>

                    <button
                      onClick={handleRemovePhoto}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* File input (hidden) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-xs rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload size={14} />
                      <span>{attachedPhotoName ? "Change Photo" : "Upload Photo"}</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendChangeRequest}
                      disabled={isSubmittingChange || (!changeRequestText.trim() && !attachedPhotoName)}
                      className={`px-6 py-2.5 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        changeRequestText.trim() || attachedPhotoName
                          ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                          : "bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed"
                      }`}
                    >
                      <Send size={14} />
                      <span>{isSubmittingChange ? "Sending..." : "Send Request"}</span>
                    </motion.button>

                    <a
                      href={getWhatsAppLink(`Hi CodeFuser, I'd like to request a website update for ${project.businessName || "My Business"}:\n\n${changeRequestText || "I have an update for my website."}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={14} />
                      <span>Send on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {changeRequestStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-medium"
                  >
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{changeRequestStatus}</span>
                  </motion.div>
                )}

                {/* Submitted Change Requests List */}
                {changeRequests.length > 0 && (
                  <div className="pt-4 border-t border-zinc-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                        Recent Update Requests ({changeRequests.length})
                      </span>
                      {isLoadingRequests && (
                        <RefreshCw size={12} className="text-zinc-500 animate-spin" />
                      )}
                    </div>

                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {changeRequests.map((req) => {
                        const statusBadge = 
                          req.status === "COMPLETED" ? { label: "✓ Completed", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" } :
                          req.status === "IN_PROGRESS" ? { label: "In Progress", bg: "bg-white/10 text-white border-white/20" } :
                          req.status === "REJECTED" ? { label: "Declined", bg: "bg-red-500/10 text-red-400 border-red-500/20" } :
                          { label: "Submitted • In Queue", bg: "bg-zinc-800 text-zinc-300 border-zinc-700" };

                        return (
                          <div
                            key={req.id}
                            className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 min-w-0">
                                <span className="font-semibold text-zinc-200 block break-words whitespace-pre-wrap leading-relaxed">
                                  {req.requestText}
                                </span>
                                {req.photoName && (
                                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                    <ImageIcon size={12} />
                                    <span>Attachment: {req.photoName}</span>
                                  </div>
                                )}
                              </div>

                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0 ${statusBadge.bg}`}>
                                {statusBadge.label}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                              <span>Submitted {new Date(req.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                              {req.completedAt && (
                                <span className="text-emerald-400">Completed {new Date(req.completedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                              )}
                            </div>

                            {req.adminNotes && (
                              <div className="p-2 bg-black/40 border border-zinc-800 rounded-lg text-[11px] text-zinc-300">
                                <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold block">Developer Note:</span>
                                <span>{req.adminNotes}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 6. WEBSITE CONTENT & ASSETS (TRANSFORMED ONBOARDING CHECKLIST) */}
          <section>
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Website Content</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    The active business information and media currently published on your website. Click Edit to make updates anytime.
                  </p>
                </div>

                <button
                  onClick={() => handleOpenStep("1")}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-xs rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Sparkles size={14} />
                  <span>Open Content Editor</span>
                </button>
              </div>

              {/* 5 Content Cards */}
              <div className="space-y-2.5">
                {checklistItems.map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.02)" }}
                      className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border bg-white text-black border-white">
                          <Check size={16} strokeWidth={3} />
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white truncate">{item.title}</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold">
                              ✓ Active
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">{item.detail}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                        <button
                          onClick={() => handleOpenStep(item.stepKey)}
                          className="px-3.5 py-2 text-xs font-bold rounded-lg border bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>Edit Details</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 7. HOSTING SECTION */}
          <section>
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Server size={18} className="text-white" />
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Website Hosting</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    High-speed cloud hosting, daily backups, and SSL encryption.
                  </p>
                </div>

                <button
                  onClick={() => onNavigateTab("hosting")}
                  className="text-xs text-zinc-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Manage Hosting</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-zinc-400 block text-[11px] font-mono uppercase">Hosting Status</span>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-lg font-black text-white">Active</span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-zinc-400 block text-[11px] font-mono uppercase">Current Paid</span>
                  <span className="text-lg font-black text-white block pt-1">
                    ₹0 (Included)
                  </span>
                </div>

                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-zinc-400 block text-[11px] font-mono uppercase">Free Hosting Until</span>
                  <span className="text-lg font-black text-white block pt-1">
                    {getFreeHostingEndDate()}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-zinc-900/80 border border-white/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-xs font-bold text-white block">
                    No automatic recurring charges or surprise fees.
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    When renewal is due, you can renew manually via one-time UPI or Card payment.
                  </span>
                </div>

                <button
                  onClick={() => onNavigateTab("hosting")}
                  className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs rounded-xl border border-zinc-800 transition-all cursor-pointer shrink-0"
                >
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </section>

          {/* 8. GROW YOUR WEBSITE — ADD-ON FEATURE CARDS */}
          <section>
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                  Upgrade & Expand
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                  Grow your website
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Add powerful capabilities to attract more customers, automate replies, and collect payments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {growthFeatures.map((feat) => {
                  const FeatIcon = feat.icon;
                  return (
                    <motion.div
                      key={feat.id}
                      whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.25)" }}
                      className="p-5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl space-y-3.5 flex flex-col justify-between transition-all duration-200"
                    >
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                          <FeatIcon size={20} />
                        </div>
                        <h4 className="text-sm font-bold text-white tracking-tight">{feat.title}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
                      </div>

                      <a
                        href={getWhatsAppLink(`Hi CodeFuser, I'd like to request the "${feat.title}" feature for my website (${project.businessName || "My Business"}).`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-xs rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        <span>Request this feature</span>
                        <ChevronRight size={13} />
                      </a>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 9. PAYMENTS & RECEIPTS */}
          <section>
            <div className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-white" />
                  <h3 className="text-base font-bold text-white tracking-tight">Payments & Receipts</h3>
                </div>
                
                <button
                  onClick={() => onNavigateTab("payments")}
                  className="text-xs text-zinc-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All Invoices</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white">Your website order is 100% fully settled</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block">
                    Plan: {selectedPackageName} • Total Paid: ₹{Math.round(finalPrice).toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  onClick={() => onNavigateTab("payments")}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-xs rounded-xl border border-zinc-700 transition-all cursor-pointer"
                >
                  <span>Download Invoice & Receipt</span>
                </button>
              </div>
            </div>
          </section>

          {/* 10. DIRECT WHATSAPP & SUPPORT ASSISTANCE */}
          <section>
            <motion.div 
              whileHover={{ borderColor: "rgba(255,255,255,0.25)" }}
              className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-[0_0_40px_rgba(0,0,0,0.6)]"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Need Any Help With Your Live Website?</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Have a question? Want to add new products? Message your CodeFuser project manager on WhatsApp anytime for fast support.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                <motion.a
                  whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  href={getWhatsAppLink(`Hi CodeFuser, I have a question about my live website for ${project.businessName || "My Business"}.`)}
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
        </>
      ) : (
        /* ======================================================================= */
        /* MODE: BUILD WORKSPACE (WHEN MILESTONE PROGRESS < 100%)                  */
        /* ======================================================================= */
        <>
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
                  {launchStatus === "READY_TO_LAUNCH"
                    ? "Your website development is 100% complete! Our team is preparing your custom domain connection and production servers."
                    : launchStatus === "DEPLOYING"
                    ? "We are currently provisioning your high-speed cloud server, SSL certificate, and live database."
                    : launchStatus === "VERIFYING"
                    ? "Running final domain DNS, mobile optimization, and security health checks before opening to public visitors."
                    : launchStatus === "ATTENTION"
                    ? "We noticed an item that needs your input before we can finalize launch. Please review the note below or message us."
                    : "Your website is currently in production. We are organizing your details and building your custom pages."}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-white/10 text-xs font-bold text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  {launchStatus === "READY_TO_LAUNCH"
                    ? "READY FOR LAUNCH"
                    : launchStatus === "DEPLOYING"
                    ? "LAUNCHING SERVERS"
                    : launchStatus === "VERIFYING"
                    ? "VERIFYING LIVE SITE"
                    : launchStatus === "ATTENTION"
                    ? "ATTENTION NEEDED"
                    : "IN PRODUCTION"}
                </span>
              </div>
            </div>

            {/* Dynamic Progress Card with Ambient White Glow */}
            <motion.div 
              whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
              className="p-6 sm:p-8 bg-zinc-950 border border-white/10 rounded-2xl relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300"
            >
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
                  const isDone = currentStageIndex > step.index;
                  const isCurrent = currentStageIndex === step.index;

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

          {/* 2. ONE DOMINANT ACTION BOX */}
          <section>
            <motion.div 
              whileHover={{ borderColor: "rgba(255,255,255,0.3)" }}
              className="p-6 sm:p-8 bg-zinc-950 border border-white/15 rounded-2xl relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.04)] space-y-4"
            >
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
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={primaryActionDetails.action}
                  className="px-6 py-3.5 bg-white text-black hover:bg-zinc-100 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <span>{primaryActionDetails.btnText}</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </motion.button>

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
              </div>
            </motion.div>
          </section>

          {/* 3. WHAT WE ARE DOING & WHAT HAPPENS NEXT */}
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

          {/* 5. PAYMENT SUMMARY */}
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

          {/* 6. DIRECT WHATSAPP & SUPPORT ASSISTANCE */}
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
        </>
      )}
    </motion.div>
  );
};
