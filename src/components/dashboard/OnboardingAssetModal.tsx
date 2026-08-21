import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Upload,
  Image as ImageIcon,
  Globe,
  Building2,
  Sparkles,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Trash2,
  FileCode,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { ProjectRecord } from "./dashboardTypes";

import {
  getOnboardingStepStatus,
  OnboardingStepStatus,
  AssetStepKey,
  isValidUrl,
  isValidDomainName,
  isValidServicesContent,
  isValidFileOrImage
} from "../../lib/onboardingStatus";
export type { AssetStepKey };

interface OnboardingAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: AssetStepKey;
  project: ProjectRecord | null;
  onSaveProject: (updatedData: Partial<ProjectRecord>) => Promise<void>;
  getWhatsAppLink: (msg: string) => string;
}

export const OnboardingAssetModal: React.FC<OnboardingAssetModalProps> = ({
  isOpen,
  onClose,
  initialStep = "1",
  project,
  onSaveProject,
  getWhatsAppLink,
}) => {
  if (!isOpen) return null;

  const [activeStep, setActiveStep] = useState<AssetStepKey>(initialStep);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [validationErrorMsg, setValidationErrorMsg] = useState<string | null>(null);

  // Form states initialized from project
  const [businessName, setBusinessName] = useState("");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contactMode, setContactMode] = useState<"provide" | "help">("provide");

  const [logoMode, setLogoMode] = useState<"upload" | "link" | "help" | "none">("upload");
  const [logoLink, setLogoLink] = useState("");
  const [logoFilePreview, setLogoFilePreview] = useState<string | null>(null);

  const [galleryMode, setGalleryMode] = useState<"upload" | "link" | "help" | "none">("upload");
  const [galleryLink, setGalleryLink] = useState("");
  const [galleryFilesPreviews, setGalleryFilesPreviews] = useState<string[]>([]);

  const [servicesMode, setServicesMode] = useState<"text" | "help" | "none">("text");
  const [servicesText, setServicesText] = useState("");
  const [servicesDocName, setServicesDocName] = useState<string | null>(null);

  const [domainMode, setDomainMode] = useState<"own" | "buy_for_me" | "subdomain" | "none">("own");
  const [domainName, setDomainName] = useState("");

  // Sync state whenever project or initialStep changes
  useEffect(() => {
    if (initialStep) {
      setActiveStep(initialStep);
    }
  }, [initialStep, isOpen]);

  useEffect(() => {
    if (project) {
      setBusinessName(project.businessName || "");
      setClientName(project.clientName || "");
      setPhone(project.whatsapp || "");
      setEmail(project.email || "");
      setAddress(project.address || "");

      // Logo parser
      const rawLogo = project.hasLogo || "";
      if (rawLogo === "help" || rawLogo === "Confirmed: help" || rawLogo.includes("CodeFuser help") || rawLogo.includes("design logo")) {
        setLogoMode("help");
      } else if (rawLogo.includes("http://") || rawLogo.includes("https://") || rawLogo.startsWith("Provided:")) {
        setLogoMode("link");
        setLogoLink(rawLogo.replace(/^Provided:\s*/i, ""));
      } else if (rawLogo.startsWith("data:image")) {
        setLogoMode("upload");
        setLogoFilePreview(rawLogo);
      }

      // Gallery parser
      const rawGallery = project.galleryReady || "";
      if (rawGallery === "help" || rawGallery === "Confirmed: help" || rawGallery.toLowerCase().includes("stock")) {
        setGalleryMode("help");
      } else if (rawGallery.includes("http://") || rawGallery.includes("https://") || rawGallery.startsWith("Provided:")) {
        setGalleryMode("link");
        setGalleryLink(rawGallery.replace(/^Provided:\s*/i, ""));
      } else if (rawGallery.toLowerCase().includes("uploaded") || rawGallery.toLowerCase().includes("photo")) {
        setGalleryMode("upload");
      }

      // Services parser
      const rawCopy = project.contentReady || "";
      if (rawCopy === "help" || rawCopy === "Confirmed: help" || rawCopy.includes("CodeFuser write") || rawCopy === "no_help") {
        setServicesMode("help");
      } else if (rawCopy.startsWith("Provided:") || rawCopy.length > 0) {
        setServicesMode("text");
        setServicesText(rawCopy.replace(/^Provided:\s*/i, ""));
      }

      // Domain parser
      const rawDomain = project.hasDomain || "";
      if (rawDomain === "help" || rawDomain === "Confirmed: help" || rawDomain.includes("Register domain")) {
        setDomainMode("buy_for_me");
      } else if (rawDomain === "not_required" || rawDomain.includes("subdomain")) {
        setDomainMode("subdomain");
      } else if (rawDomain.length > 0) {
        setDomainMode("own");
        setDomainName(rawDomain.replace(/^Provided:\s*/i, ""));
      }
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  // File upload handlers
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoFilePreview(event.target.result as string);
          setLogoMode("upload");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPreviews: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newPreviews.push(event.target.result as string);
            if (newPreviews.length === files.length) {
              setGalleryFilesPreviews((prev) => [...prev, ...newPreviews]);
              setGalleryMode("upload");
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleServicesDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setServicesDocName(file.name);
      setServicesMode("text");
    }
  };

  // Status indicators for the step tabs
  const getStepStatus = (step: AssetStepKey): OnboardingStepStatus => {
    return getOnboardingStepStatus(step, project);
  };

  // Form save logic
  const handleSaveCurrentStep = async (advanceToNext: boolean = false) => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    setValidationErrorMsg(null);

    const payload: Partial<ProjectRecord> = {};

    // Build payload according to active step
    if (activeStep === "1") {
      const bName = businessName.trim() || project?.businessName || "";
      const cName = clientName.trim() || project?.clientName || "";
      const wPhone = phone.trim() || project?.whatsapp || "";
      const uEmail = email.trim() || project?.email || "";
      const bAddress = address.trim() || project?.address || "";
      payload.businessName = bName;
      payload.clientName = cName;
      payload.whatsapp = wPhone;
      payload.email = uEmail;
      payload.address = bAddress;
      payload.businessDetails = `Provided: ${bName} | Contact: ${cName} | Phone: ${wPhone} | Email: ${uEmail} | Address: ${bAddress}`;
    } else if (activeStep === "2") {
      if (logoMode === "help") {
        payload.hasLogo = "Confirmed: help";
      } else if (logoMode === "link") {
        if (isValidUrl(logoLink)) {
          payload.hasLogo = logoLink.startsWith("Provided:") ? logoLink.trim() : `Provided: ${logoLink.trim()}`;
        } else {
          payload.hasLogo = "link_pending";
          setValidationErrorMsg("Enter a valid link (e.g. https://drive.google.com/...).");
        }
      } else if (logoMode === "upload") {
        if (isValidFileOrImage(logoFilePreview)) {
          payload.hasLogo = logoFilePreview!.startsWith("data:") ? logoFilePreview! : "Provided: uploaded";
        } else {
          payload.hasLogo = "upload_pending";
          setValidationErrorMsg("Upload a logo file first.");
        }
      } else if (logoMode === "none") {
        payload.hasLogo = "Provided: not_required";
      } else {
        payload.hasLogo = project?.hasLogo || "upload_pending";
      }
    } else if (activeStep === "3") {
      if (galleryMode === "help") {
        payload.galleryReady = "Confirmed: help";
      } else if (galleryMode === "link") {
        if (isValidUrl(galleryLink)) {
          payload.galleryReady = galleryLink.startsWith("Provided:") ? galleryLink.trim() : `Provided: ${galleryLink.trim()}`;
        } else {
          payload.galleryReady = "link_pending";
          setValidationErrorMsg("Enter a valid link (e.g. https://drive.google.com/...).");
        }
      } else if (galleryMode === "upload") {
        if (galleryFilesPreviews.length > 0) {
          payload.galleryReady = `Provided: Uploaded ${galleryFilesPreviews.length} photo${galleryFilesPreviews.length > 1 ? "s" : ""}`;
        } else {
          payload.galleryReady = "upload_pending";
          setValidationErrorMsg("Upload at least one photo first.");
        }
      } else if (galleryMode === "none") {
        payload.galleryReady = "Provided: not_required";
      } else {
        payload.galleryReady = project?.galleryReady || "upload_pending";
      }
    } else if (activeStep === "4") {
      if (servicesMode === "help") {
        payload.contentReady = "Confirmed: help";
      } else if (servicesMode === "text") {
        let contentStr = servicesText.trim();
        if (servicesDocName) {
          contentStr += ` (Doc: ${servicesDocName})`;
        }
        if (isValidServicesContent(contentStr) || servicesDocName) {
          payload.contentReady = `Provided: ${contentStr}`;
        } else {
          payload.contentReady = "text_pending";
          setValidationErrorMsg("Enter your services details or attach a document.");
        }
      } else if (servicesMode === "none") {
        payload.contentReady = "Provided: not_required";
      } else {
        payload.contentReady = project?.contentReady || "text_pending";
      }
    } else if (activeStep === "5") {
      if (domainMode === "buy_for_me") {
        payload.hasDomain = domainName.trim() && isValidDomainName(domainName) ? `Provided: Help buy ${domainName.trim()}` : "Confirmed: help";
      } else if (domainMode === "subdomain") {
        payload.hasDomain = "Provided: not_required";
      } else if (domainMode === "own") {
        if (isValidDomainName(domainName) || isValidUrl(domainName)) {
          payload.hasDomain = domainName.startsWith("Provided:") ? domainName.trim() : `Provided: ${domainName.trim()}`;
        } else {
          payload.hasDomain = "domain_pending";
          setValidationErrorMsg("Add your domain first (e.g. example.com).");
        }
      } else {
        payload.hasDomain = project?.hasDomain || "domain_pending";
      }
    }

    try {
      await onSaveProject(payload);
      
      if (advanceToNext) {
        setSaveSuccessMsg("Step saved! Continuing to next step...");
        setTimeout(() => {
          setSaveSuccessMsg(null);
          const steps: AssetStepKey[] = ["1", "2", "3", "4", "5"];
          const currentIndex = steps.indexOf(activeStep);
          if (currentIndex < steps.length - 1) {
            setActiveStep(steps[currentIndex + 1]);
          } else {
            onClose();
          }
        }, 350);
      } else {
        setSaveSuccessMsg("Step saved successfully!");
        setTimeout(() => {
          setSaveSuccessMsg(null);
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to save step:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const stepsMeta = [
    { key: "1" as AssetStepKey, title: "1. Business Info", label: "Contact & Address", icon: Building2 },
    { key: "2" as AssetStepKey, title: "2. Your Logo", label: "Brand Logo", icon: ImageIcon },
    { key: "3" as AssetStepKey, title: "3. Photos", label: "Gallery & Media", icon: Upload },
    { key: "4" as AssetStepKey, title: "4. Services", label: "Text & Offerings", icon: FileText },
    { key: "5" as AssetStepKey, title: "5. Domain", label: "Website Address", icon: Globe },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-900 bg-black/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Provide Onboarding Assets</span>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-200 text-[10px] font-mono uppercase tracking-widest font-extrabold">
                  Quick Setup
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Complete these 5 simple steps so we can build and launch your custom website.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-neutral-900 bg-neutral-950 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {stepsMeta.map((s) => {
            const status = getStepStatus(s.key);
            const isActive = activeStep === s.key;
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => {
                  setActiveStep(s.key);
                  setValidationErrorMsg(null);
                  setSaveSuccessMsg(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                  isActive
                    ? "bg-white text-black border-white shadow-lg shadow-white/10"
                    : status === "Complete"
                    ? "bg-zinc-900 text-white border-white/20 hover:bg-zinc-850"
                    : status === "Needs Review"
                    ? "bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-850"
                    : "bg-neutral-950 text-neutral-400 border-neutral-900 hover:text-neutral-200"
                }`}
              >
                <Icon size={13} className={isActive ? "text-black" : status === "Complete" ? "text-white" : "text-neutral-400"} />
                <span>{s.title}</span>
                {status === "Complete" ? (
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold ${isActive ? "bg-black/10 text-black" : "bg-white/10 text-white border border-white/20"}`}>✓</span>
                ) : status === "Needs Review" ? (
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold ${isActive ? "bg-black/10 text-black" : "bg-zinc-800 text-zinc-300 border border-zinc-700"}`}>Review</span>
                ) : (
                  <span className="text-[9px] font-mono text-zinc-500">•</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1 bg-black/40">
          {/* Success Banner */}
          {saveSuccessMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 size={16} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationErrorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{validationErrorMsg}</span>
            </div>
          )}

          {/* STEP 1: Business Info & Contact */}
          {activeStep === "1" && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Step 1 of 5</span>
                <h3 className="text-base font-bold text-white">Business Name & Contact Details</h3>
                <p className="text-xs text-neutral-400">
                  Tell us your business details so we can display correct branding and contact links on your site.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Business / Brand Name <span className="text-white">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apex Legal Solutions"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">Your Full Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Jonathan Smith"
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Phone Number / WhatsApp <span className="text-white">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Business Email Address <span className="text-white">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. contact@apexlegal.com"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">Physical Address or Location (Optional)</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Anna Nagar, Chennai, Tamil Nadu (or Online / Pan-India)"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Business Logo */}
          {activeStep === "2" && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Step 2 of 5</span>
                <h3 className="text-base font-bold text-white">Your Business Logo</h3>
                <p className="text-xs text-neutral-400">
                  Select an option below: upload a logo file, provide a cloud link, or have CodeFuser designers create one for you.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setLogoMode("upload")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    logoMode === "upload"
                      ? "bg-zinc-900 border-white text-white ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                      : "bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Upload size={20} className={logoMode === "upload" ? "text-white" : "text-zinc-500"} />
                    {logoMode === "upload" ? (
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-extrabold uppercase tracking-tight">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">Upload Logo File</div>
                    <div className="text-[11px] text-zinc-400">PNG, SVG, or JPG format</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoMode("link")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    logoMode === "link"
                      ? "bg-zinc-900 border-white text-white ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                      : "bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <LinkIcon size={20} className={logoMode === "link" ? "text-white" : "text-zinc-500"} />
                    {logoMode === "link" ? (
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-extrabold uppercase tracking-tight">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">Drive / Dropbox Link</div>
                    <div className="text-[11px] text-zinc-400">Cloud folder or Canva URL</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoMode("help")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    logoMode === "help"
                      ? "bg-zinc-900 border-white text-white ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                      : "bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Sparkles size={20} className={logoMode === "help" ? "text-white" : "text-zinc-500"} />
                    {logoMode === "help" ? (
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-extrabold uppercase tracking-tight">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">Design Logo For Me</div>
                    <div className="text-[11px] text-zinc-400">CodeFuser custom design</div>
                  </div>
                </button>
              </div>

              {/* Mode Details Container */}
              {logoMode === "upload" && (
                <div className="space-y-3 p-5 bg-zinc-950 border border-white/20 rounded-2xl">
                  {logoFilePreview ? (
                    <div className="flex items-center justify-between p-3.5 bg-black border border-white/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img src={logoFilePreview} alt="Logo preview" className="w-14 h-14 object-contain bg-zinc-900 border border-white/10 rounded-lg p-1.5" />
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-white" /> Logo file attached & ready
                          </p>
                          <p className="text-[11px] text-neutral-400">Click Save & Continue below to submit</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLogoFilePreview(null)}
                        className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/20 hover:border-white/50 rounded-2xl p-7 text-center space-y-3 bg-black transition-all">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-white">
                        <ImageIcon size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">Drag & drop your logo file here, or click browse</p>
                        <p className="text-[11px] text-neutral-400">Supports PNG (transparent), SVG, or high-res JPG</p>
                      </div>
                      <input
                        type="file"
                        id="modal-logo-uploader"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoFileUpload}
                      />
                      <label
                        htmlFor="modal-logo-uploader"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
                      >
                        <Upload size={14} />
                        <span>Browse Logo File</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {logoMode === "link" && (
                <div className="space-y-3 p-5 bg-zinc-950 border border-white/20 rounded-2xl">
                  <label className="block text-xs font-semibold text-white">Google Drive, Dropbox, or Canva Share Link</label>
                  <div className="relative">
                    <LinkIcon size={15} className="absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      type="url"
                      value={logoLink}
                      onChange={(e) => setLogoLink(e.target.value)}
                      placeholder="https://drive.google.com/file/d/... or https://canva.com/..."
                      className="w-full bg-black border border-white/20 focus:border-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Make sure the link sharing setting is set to "Anyone with the link can view".
                  </p>
                </div>
              )}

              {logoMode === "help" && (
                <div className="p-5 bg-zinc-950 border border-white/20 rounded-2xl space-y-2.5 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Sparkles size={16} className="text-white" />
                    <span>CodeFuser Professional Design Team Assigned</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Our graphics team will design clean, high-visibility logo concepts for your business based on your brand name, industry, and aesthetic preferences.
                  </p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Status: Included with your project onboarding</span>
                    <span className="font-mono text-white font-bold">✓ Active</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Business Photos & Gallery */}
          {activeStep === "3" && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Step 3 of 5</span>
                <h3 className="text-base font-bold text-white">Business Photos & Gallery</h3>
                <p className="text-xs text-neutral-400">
                  Select how you'd like to provide photos: upload store/work pictures, share a cloud folder, or use our curated stock photos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setGalleryMode("upload")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    galleryMode === "upload"
                      ? "bg-zinc-900 border-white text-white ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                      : "bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Upload size={20} className={galleryMode === "upload" ? "text-white" : "text-zinc-500"} />
                    {galleryMode === "upload" ? (
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-extrabold uppercase tracking-tight">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">Upload Photos Directly</div>
                    <div className="text-[11px] text-zinc-400">Attach multiple files</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGalleryMode("link")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    galleryMode === "link"
                      ? "bg-zinc-900 border-white text-white ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                      : "bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <LinkIcon size={20} className={galleryMode === "link" ? "text-white" : "text-zinc-500"} />
                    {galleryMode === "link" ? (
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-extrabold uppercase tracking-tight">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">Cloud Folder Link</div>
                    <div className="text-[11px] text-zinc-400">Google Drive / Dropbox</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGalleryMode("help")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    galleryMode === "help"
                      ? "bg-zinc-900 border-white text-white ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                      : "bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Sparkles size={20} className={galleryMode === "help" ? "text-white" : "text-zinc-500"} />
                    {galleryMode === "help" ? (
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-extrabold uppercase tracking-tight">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">Use Curated Stock Photos</div>
                    <div className="text-[11px] text-zinc-400">CodeFuser licensed HD media</div>
                  </div>
                </button>
              </div>

              {galleryMode === "upload" && (
                <div className="space-y-3 p-5 bg-zinc-950 border border-white/20 rounded-2xl">
                  {galleryFilesPreviews.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-white" /> {galleryFilesPreviews.length} Photo(s) Attached
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {galleryFilesPreviews.map((src, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20">
                            <img src={src} alt="Gallery item" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-white/20 hover:border-white/50 rounded-2xl p-7 text-center space-y-3 bg-black transition-all">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-white">
                      <Upload size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">Select photos of your shop, products, or work</p>
                      <p className="text-[11px] text-neutral-400">You can select multiple photos at once</p>
                    </div>
                    <input
                      type="file"
                      id="modal-gallery-uploader"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGalleryFilesUpload}
                    />
                    <label
                      htmlFor="modal-gallery-uploader"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
                    >
                      <Upload size={14} />
                      <span>Browse & Attach Photos</span>
                    </label>
                  </div>
                </div>
              )}

              {galleryMode === "link" && (
                <div className="space-y-3 p-5 bg-zinc-950 border border-white/20 rounded-2xl">
                  <label className="block text-xs font-semibold text-white">Google Drive or Dropbox Folder Link</label>
                  <div className="relative">
                    <LinkIcon size={15} className="absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      type="url"
                      value={galleryLink}
                      onChange={(e) => setGalleryLink(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full bg-black border border-white/20 focus:border-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Ensure link access is set to "Anyone with the link can view".
                  </p>
                </div>
              )}

              {galleryMode === "help" && (
                <div className="p-5 bg-zinc-950 border border-white/20 rounded-2xl space-y-2.5 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Sparkles size={16} className="text-white" />
                    <span>Professional Stock Photography Selected</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    CodeFuser will curate high-resolution, commercial-licensed imagery specifically tailored to your industry, aesthetic, and services.
                  </p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Status: Curated by CodeFuser content team</span>
                    <span className="font-mono text-white font-bold">✓ Active</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Services / Products Provided */}
          {activeStep === "4" && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Step 4 of 5</span>
                <h3 className="text-base font-bold text-white">Services / Products Provided</h3>
                <p className="text-xs text-neutral-400">
                  Describe what your business offers, list services & prices, or let CodeFuser copywriters structure them for you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setServicesMode("text")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    servicesMode === "text"
                      ? "bg-zinc-900 border-white text-white ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                      : "bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <FileText size={20} className={servicesMode === "text" ? "text-white" : "text-zinc-500"} />
                    {servicesMode === "text" ? (
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-extrabold uppercase tracking-tight">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">Type Services / Attach Document</div>
                    <div className="text-[11px] text-zinc-400">List offerings, prices, menu, or PDF</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setServicesMode("help")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    servicesMode === "help"
                      ? "bg-zinc-900 border-white text-white ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                      : "bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Sparkles size={20} className={servicesMode === "help" ? "text-white" : "text-zinc-500"} />
                    {servicesMode === "help" ? (
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-extrabold uppercase tracking-tight">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">CodeFuser Copywriting Help</div>
                    <div className="text-[11px] text-zinc-400">We research and write copy for you</div>
                  </div>
                </button>
              </div>

              {servicesMode === "text" && (
                <div className="space-y-3 p-5 bg-zinc-950 border border-white/20 rounded-2xl">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-white">Type or Paste Your Offerings & Details</label>
                    <textarea
                      rows={4}
                      value={servicesText}
                      onChange={(e) => setServicesText(e.target.value)}
                      placeholder="e.g.&#10;1. General Consultation - ₹500&#10;2. Premium Styling Package - ₹2,500&#10;3. Annual Maintenance Plan"
                      className="w-full bg-black border border-white/20 focus:border-white rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 resize-none font-sans"
                    />
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs text-neutral-400">Or attach a menu/brochure file (PDF, Word, Image):</span>
                    <input
                      type="file"
                      id="modal-services-doc-uploader"
                      className="hidden"
                      onChange={handleServicesDocUpload}
                    />
                    <label
                      htmlFor="modal-services-doc-uploader"
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white rounded-xl border border-white/20 hover:border-white/40 transition-all cursor-pointer inline-flex items-center gap-1.5 self-start"
                    >
                      <Upload size={14} />
                      <span>{servicesDocName ? servicesDocName : "Attach Document File"}</span>
                    </label>
                  </div>
                </div>
              )}

              {servicesMode === "help" && (
                <div className="p-5 bg-zinc-950 border border-white/20 rounded-2xl space-y-2.5 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Sparkles size={16} className="text-white" />
                    <span>CodeFuser Professional Copywriting Assigned</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Our agency copywriters will research standard offerings in your domain and craft clear, engaging, customer-focused text for your website.
                  </p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Status: Included with your project onboarding</span>
                    <span className="font-mono text-white font-bold">✓ Active</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Preferred Website Address (Domain) */}
          {activeStep === "5" && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Step 5 of 5</span>
                <h3 className="text-base font-bold text-white">Preferred Website Address (Domain)</h3>
                <p className="text-xs text-neutral-400">
                  Where should your website live on the web? Choose your preferred domain address or let CodeFuser register one for you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDomainMode("own")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    domainMode === "own"
                      ? "bg-zinc-900 border-white text-white ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                      : "bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Globe size={20} className={domainMode === "own" ? "text-white" : "text-zinc-500"} />
                    {domainMode === "own" ? (
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-extrabold uppercase tracking-tight">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">I Have A Domain</div>
                    <div className="text-[11px] text-zinc-400">e.g. mybusiness.com</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDomainMode("buy_for_me")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    domainMode === "buy_for_me"
                      ? "bg-zinc-900 border-white text-white ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                      : "bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Sparkles size={20} className={domainMode === "buy_for_me" ? "text-white" : "text-zinc-500"} />
                    {domainMode === "buy_for_me" ? (
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-extrabold uppercase tracking-tight">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">Buy / Register Domain</div>
                    <div className="text-[11px] text-zinc-400">CodeFuser domain setup</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDomainMode("subdomain")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    domainMode === "subdomain"
                      ? "bg-zinc-900 border-white text-white ring-2 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                      : "bg-zinc-950/80 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <FileCode size={20} className={domainMode === "subdomain" ? "text-white" : "text-zinc-500"} />
                    {domainMode === "subdomain" ? (
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-extrabold uppercase tracking-tight">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">Free Subdomain</div>
                    <div className="text-[11px] text-zinc-400">mybrand.codefuser.app</div>
                  </div>
                </button>
              </div>

              {domainMode === "own" && (
                <div className="space-y-3 p-5 bg-zinc-950 border border-white/20 rounded-2xl">
                  <label className="block text-xs font-semibold text-white">Enter Your Registered Domain Name</label>
                  <div className="relative">
                    <Globe size={15} className="absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      type="text"
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      placeholder="e.g. apexlegal.com"
                      className="w-full bg-black border border-white/20 focus:border-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    We'll provide straightforward DNS linking instructions when your site preview is approved.
                  </p>
                </div>
              )}

              {domainMode === "buy_for_me" && (
                <div className="space-y-3 p-5 bg-zinc-950 border border-white/20 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Sparkles size={16} className="text-white" />
                    <span>CodeFuser Domain Concierge</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Tell us your preferred domain name below and CodeFuser will assist you in acquiring, configuring SSL, and linking it to your website.
                  </p>
                  <div className="relative">
                    <Globe size={15} className="absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      type="text"
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      placeholder="e.g. apexlegalsolutions.com"
                      className="w-full bg-black border border-white/20 focus:border-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 font-mono"
                    />
                  </div>
                </div>
              )}

              {domainMode === "subdomain" && (
                <div className="p-5 bg-zinc-950 border border-white/20 rounded-2xl text-xs text-neutral-300 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <FileCode size={16} className="text-white" />
                    <span>Free CodeFuser Subdomain Address</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Your website will be published on a clean, fast CodeFuser web address (e.g. <span className="font-mono text-white font-bold">{((businessName || project?.businessName || "yourbusiness").toLowerCase().replace(/[^a-z0-9]/g, "") || "mybrand")}.codefuser.app</span>). You can connect a custom .com or .in domain at any time later!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-neutral-900 bg-neutral-950 flex items-center justify-between gap-3 shrink-0">
          <a
            href={getWhatsAppLink(`Hi CodeFuser, I am filling out my onboarding assets for ${project?.businessName || "My Business"} and have a question about Step ${activeStep}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle size={15} />
            <span className="hidden sm:inline">Ask Concierge Help</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveCurrentStep(false)}
              disabled={isSaving}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl border border-neutral-800 transition-all cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Step"}
            </button>

            <button
              type="button"
              onClick={() => handleSaveCurrentStep(true)}
              disabled={isSaving}
              className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{activeStep === "5" ? "Save & Complete All" : "Save & Continue"}</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
