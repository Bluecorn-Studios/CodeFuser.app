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
  ShieldCheck
} from "lucide-react";
import { ProjectRecord } from "./dashboardTypes";

export type AssetStepKey = "1" | "2" | "3" | "4" | "5";

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
  const [activeStep, setActiveStep] = useState<AssetStepKey>(initialStep);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

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
  const isAssetProvided = (val?: string) => {
    if (!val) return false;
    const v = val.toLowerCase().trim();
    return v !== "pending" && v !== "yes" && v !== "no" && v !== "help" && v !== "no_help" && v !== "";
  };

  const getStepStatus = (step: AssetStepKey) => {
    if (!project) return "needed";
    if (step === "1") {
      return (businessName || project.businessName) && (clientName || project.clientName) && (phone || project.whatsapp) && (email || project.email)
        ? "done"
        : "needed";
    }
    if (step === "2") {
      return logoMode === "help" || logoFilePreview || logoLink.trim() || isAssetProvided(project.hasLogo)
        ? "done"
        : "needed";
    }
    if (step === "3") {
      return galleryMode === "help" || galleryFilesPreviews.length > 0 || galleryLink.trim() || isAssetProvided(project.galleryReady)
        ? "done"
        : "needed";
    }
    if (step === "4") {
      return servicesMode === "help" || servicesText.trim() || servicesDocName || isAssetProvided(project.contentReady)
        ? "done"
        : "needed";
    }
    if (step === "5") {
      return domainMode === "buy_for_me" || domainMode === "subdomain" || domainName.trim() || isAssetProvided(project.hasDomain)
        ? "done"
        : "needed";
    }
    return "needed";
  };

  // Form save logic
  const handleSaveCurrentStep = async (advanceToNext: boolean = false) => {
    setIsSaving(true);
    setSaveSuccessMsg(null);

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
      } else if (logoMode === "link" && logoLink.trim()) {
        payload.hasLogo = logoLink.startsWith("Provided:") ? logoLink : `Provided: ${logoLink}`;
      } else if (logoMode === "upload" && logoFilePreview) {
        payload.hasLogo = logoFilePreview;
      } else if (logoMode === "none") {
        payload.hasLogo = "not_required";
      } else if (logoLink.trim()) {
        payload.hasLogo = `Provided: ${logoLink}`;
      } else if (project?.hasLogo) {
        payload.hasLogo = project.hasLogo;
      } else {
        payload.hasLogo = "Confirmed: help";
      }
    } else if (activeStep === "3") {
      if (galleryMode === "help") {
        payload.galleryReady = "Confirmed: help";
      } else if (galleryMode === "link" && galleryLink.trim()) {
        payload.galleryReady = galleryLink.startsWith("Provided:") ? galleryLink : `Provided: ${galleryLink}`;
      } else if (galleryMode === "upload") {
        payload.galleryReady = galleryFilesPreviews.length > 0
          ? `Uploaded ${galleryFilesPreviews.length} photo${galleryFilesPreviews.length > 1 ? "s" : ""}`
          : (project?.galleryReady || "Uploaded photos");
      } else if (galleryMode === "none") {
        payload.galleryReady = "not_required";
      } else if (galleryLink.trim()) {
        payload.galleryReady = `Provided: ${galleryLink}`;
      } else if (project?.galleryReady) {
        payload.galleryReady = project.galleryReady;
      } else {
        payload.galleryReady = "Confirmed: help";
      }
    } else if (activeStep === "4") {
      if (servicesMode === "help") {
        payload.contentReady = "Confirmed: help";
      } else if (servicesMode === "text") {
        let contentStr = servicesText.trim();
        if (servicesDocName) {
          contentStr += ` (Doc attached: ${servicesDocName})`;
        }
        payload.contentReady = contentStr ? `Provided: ${contentStr}` : "Confirmed: help";
      } else if (servicesMode === "none") {
        payload.contentReady = "not_required";
      } else if (servicesText.trim()) {
        payload.contentReady = `Provided: ${servicesText.trim()}`;
      } else if (project?.contentReady) {
        payload.contentReady = project.contentReady;
      } else {
        payload.contentReady = "Confirmed: help";
      }
    } else if (activeStep === "5") {
      if (domainMode === "buy_for_me") {
        payload.hasDomain = domainName.trim() ? `Help buy: ${domainName.trim()}` : "Confirmed: help";
      } else if (domainMode === "subdomain") {
        payload.hasDomain = "not_required";
      } else if (domainMode === "own" && domainName.trim()) {
        payload.hasDomain = domainName.startsWith("Provided:") ? domainName : `Provided: ${domainName}`;
      } else if (domainName.trim()) {
        payload.hasDomain = `Provided: ${domainName.trim()}`;
      } else if (project?.hasDomain) {
        payload.hasDomain = project.hasDomain;
      } else {
        payload.hasDomain = "Confirmed: help";
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
                onClick={() => setActiveStep(s.key)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                  isActive
                    ? "bg-white text-black border-white shadow-lg shadow-white/10 scale-[1.02]"
                    : status === "done"
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                    : "bg-neutral-900/90 text-neutral-400 border-neutral-800 hover:text-neutral-200"
                }`}
              >
                <Icon size={14} className={isActive ? "text-black" : status === "done" ? "text-emerald-400" : "text-neutral-400"} />
                <span>{s.title}</span>
                {status === "done" && (
                  <CheckCircle2 size={13} className={isActive ? "text-black" : "text-emerald-400"} />
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

          {/* STEP 1: Business Info & Contact */}
          {activeStep === "1" && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Step 1 of 5</span>
                <h3 className="text-base font-bold text-[#EAE5D9]">Business Name & Contact Details</h3>
                <p className="text-xs text-neutral-400">
                  Tell us your business details so we can display correct branding and contact links on your site.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Business / Brand Name <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apex Legal Solutions"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#EAE5D9] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none"
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
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#EAE5D9] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Phone Number / WhatsApp <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 555-0192"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#EAE5D9] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Business Email Address <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. contact@apexlegal.com"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#EAE5D9] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none"
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
                      placeholder="e.g. 100 Main St, New York, NY 10001 (or Online / Nationwide)"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#EAE5D9] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none"
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
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Step 2 of 5</span>
                <h3 className="text-base font-bold text-[#EAE5D9]">Your Business Logo</h3>
                <p className="text-xs text-neutral-400">
                  Upload your brand logo file, send a link, or request CodeFuser designers to create one for you.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setLogoMode("upload")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                    logoMode === "upload"
                      ? "bg-zinc-900 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Upload size={18} className={logoMode === "upload" ? "text-white" : "text-zinc-500"} />
                  <div className="text-xs font-bold">Upload Logo File</div>
                  <div className="text-[11px] opacity-70">PNG, SVG, or JPG</div>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoMode("link")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                    logoMode === "link"
                      ? "bg-zinc-900 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <LinkIcon size={18} className={logoMode === "link" ? "text-white" : "text-zinc-500"} />
                  <div className="text-xs font-bold">Paste Drive/Dropbox Link</div>
                  <div className="text-[11px] opacity-70">Cloud folder or URL</div>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoMode("help")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                    logoMode === "help"
                      ? "bg-zinc-900 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Sparkles size={18} className={logoMode === "help" ? "text-white" : "text-zinc-500"} />
                  <div className="text-xs font-bold">Design Logo For Me</div>
                  <div className="text-[11px] opacity-70">CodeFuser custom design</div>
                </button>
              </div>

              {/* Mode Details */}
              {logoMode === "upload" && (
                <div className="space-y-3 p-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
                  {logoFilePreview ? (
                    <div className="flex items-center justify-between p-3 bg-black border border-neutral-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img src={logoFilePreview} alt="Logo preview" className="w-12 h-12 object-contain bg-neutral-900 rounded-lg p-1" />
                        <div>
                          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check size={14} /> Logo image ready
                          </p>
                          <p className="text-[11px] text-neutral-400">Click save below to submit</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setLogoFilePreview(null)}
                        className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-neutral-700 hover:border-amber-500/50 rounded-2xl p-6 text-center space-y-2 bg-neutral-950 transition-all">
                      <ImageIcon size={28} className="text-neutral-500 mx-auto" />
                      <p className="text-xs font-bold text-neutral-200">Drag & drop your logo here, or browse files</p>
                      <input
                        type="file"
                        id="modal-logo-uploader"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoFileUpload}
                      />
                      <label
                        htmlFor="modal-logo-uploader"
                        className="inline-block px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white rounded-xl transition-all cursor-pointer"
                      >
                        Browse Logo File
                      </label>
                    </div>
                  )}
                </div>
              )}

              {logoMode === "link" && (
                <div className="space-y-2 p-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
                  <label className="block text-xs font-semibold text-neutral-300">Google Drive, Dropbox, or Canva Link</label>
                  <input
                    type="url"
                    value={logoLink}
                    onChange={(e) => setLogoLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full bg-black border border-neutral-800 focus:border-[#EAE5D9] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              {logoMode === "help" && (
                <div className="p-4 bg-zinc-900 border border-white/20 rounded-2xl text-xs text-zinc-200 space-y-1 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                  <p className="font-bold flex items-center gap-1.5 text-white">
                    <Sparkles size={15} className="text-white" /> CodeFuser Design Team Assigned
                  </p>
                  <p className="leading-relaxed opacity-90 text-zinc-400">
                    Our graphics team will design clean, modern logo options for your business based on your industry and brand identity!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Business Photos & Gallery */}
          {activeStep === "3" && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Step 3 of 5</span>
                <h3 className="text-base font-bold text-[#EAE5D9]">Business Photos & Gallery</h3>
                <p className="text-xs text-neutral-400">
                  Upload photos of your business, store, products, or work samples. Or let us use licensed stock photos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setGalleryMode("upload")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                    galleryMode === "upload"
                      ? "bg-zinc-900 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Upload size={18} className={galleryMode === "upload" ? "text-white" : "text-zinc-500"} />
                  <div className="text-xs font-bold">Upload Photos Directly</div>
                  <div className="text-[11px] opacity-70">Multiple images</div>
                </button>

                <button
                  type="button"
                  onClick={() => setGalleryMode("link")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                    galleryMode === "link"
                      ? "bg-zinc-900 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <LinkIcon size={18} className={galleryMode === "link" ? "text-white" : "text-zinc-500"} />
                  <div className="text-xs font-bold">Cloud Folder Link</div>
                  <div className="text-[11px] opacity-70">Google Drive / Dropbox</div>
                </button>

                <button
                  type="button"
                  onClick={() => setGalleryMode("help")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                    galleryMode === "help"
                      ? "bg-zinc-900 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Sparkles size={18} className={galleryMode === "help" ? "text-white" : "text-zinc-500"} />
                  <div className="text-xs font-bold">Use Stock Photos</div>
                  <div className="text-[11px] opacity-70">CodeFuser curated HD media</div>
                </button>
              </div>

              {galleryMode === "upload" && (
                <div className="space-y-3 p-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
                  {galleryFilesPreviews.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Check size={14} /> {galleryFilesPreviews.length} Photo(s) Attached
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {galleryFilesPreviews.map((src, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-neutral-800 group">
                            <img src={src} alt="Gallery item" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border border-dashed border-neutral-700 hover:border-amber-500/50 rounded-2xl p-5 text-center space-y-2 bg-neutral-950 transition-all">
                    <Upload size={24} className="text-neutral-500 mx-auto" />
                    <p className="text-xs font-bold text-neutral-200">Select images from your device</p>
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
                      className="inline-block px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white rounded-xl transition-all cursor-pointer"
                    >
                      Browse & Attach Photos
                    </label>
                  </div>
                </div>
              )}

              {galleryMode === "link" && (
                <div className="space-y-2 p-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
                  <label className="block text-xs font-semibold text-neutral-300">Google Drive / Dropbox Folder Link</label>
                  <input
                    type="url"
                    value={galleryLink}
                    onChange={(e) => setGalleryLink(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full bg-black border border-neutral-800 focus:border-[#EAE5D9] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              {galleryMode === "help" && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Sparkles size={15} /> Professional Stock Photography Selected
                  </p>
                  <p className="leading-relaxed opacity-90">
                    CodeFuser will source high-resolution, royalty-free images tailored to your industry.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Services / Products Provided */}
          {activeStep === "4" && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Step 4 of 5</span>
                <h3 className="text-base font-bold text-[#EAE5D9]">Services / Products Provided</h3>
                <p className="text-xs text-neutral-400">
                  Describe what your business offers, list services & prices, or upload a brochure/menu PDF.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setServicesMode("text")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                    servicesMode === "text"
                      ? "bg-zinc-900 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <FileText size={18} className={servicesMode === "text" ? "text-white" : "text-zinc-500"} />
                  <div className="text-xs font-bold">Type Services / Upload Doc</div>
                  <div className="text-[11px] opacity-70">List offerings, prices, menu</div>
                </button>

                <button
                  type="button"
                  onClick={() => setServicesMode("help")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                    servicesMode === "help"
                      ? "bg-zinc-900 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Sparkles size={18} className={servicesMode === "help" ? "text-white" : "text-zinc-500"} />
                  <div className="text-xs font-bold">CodeFuser Copywriting Help</div>
                  <div className="text-[11px] opacity-70">We write professional copy for you</div>
                </button>
              </div>

              {servicesMode === "text" && (
                <div className="space-y-3 p-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-neutral-300">Type or Paste Your Offerings & Details</label>
                    <textarea
                      rows={4}
                      value={servicesText}
                      onChange={(e) => setServicesText(e.target.value)}
                      placeholder="e.g. 1. Corporate Consultation ($150) - 1hr session&#10;2. Contract Review ($300)&#10;3. Full Retainer Package"
                      className="w-full bg-black border border-neutral-800 focus:border-[#EAE5D9] rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs text-neutral-400">Or attach a document (PDF, Word, TXT):</span>
                    <input
                      type="file"
                      id="modal-services-doc-uploader"
                      className="hidden"
                      onChange={handleServicesDocUpload}
                    />
                    <label
                      htmlFor="modal-services-doc-uploader"
                      className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 self-start"
                    >
                      <Upload size={14} />
                      <span>{servicesDocName ? servicesDocName : "Attach File"}</span>
                    </label>
                  </div>
                </div>
              )}

              {servicesMode === "help" && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Sparkles size={15} /> CodeFuser Copywriting Service
                  </p>
                  <p className="leading-relaxed opacity-90">
                    Our copywriters will craft clear, engaging, sales-focused text for your website based on your industry!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Preferred Website Address (Domain) */}
          {activeStep === "5" && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Step 5 of 5</span>
                <h3 className="text-base font-bold text-[#EAE5D9]">Preferred Website Address (Domain)</h3>
                <p className="text-xs text-neutral-400">
                  Where should your website live on the web? Choose your preferred domain address.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDomainMode("own")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                    domainMode === "own"
                      ? "bg-zinc-900 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Globe size={18} className={domainMode === "own" ? "text-white" : "text-zinc-500"} />
                  <div className="text-xs font-bold">I Have A Domain</div>
                  <div className="text-[11px] opacity-70">e.g. mybusiness.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDomainMode("buy_for_me")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                    domainMode === "buy_for_me"
                      ? "bg-zinc-900 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Sparkles size={18} className={domainMode === "buy_for_me" ? "text-white" : "text-zinc-500"} />
                  <div className="text-xs font-bold">Buy/Register Domain For Me</div>
                  <div className="text-[11px] opacity-70">CodeFuser domain setup</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDomainMode("subdomain")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                    domainMode === "subdomain"
                      ? "bg-zinc-900 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <FileCode size={18} className={domainMode === "subdomain" ? "text-white" : "text-zinc-500"} />
                  <div className="text-xs font-bold">Free CodeFuser Domain</div>
                  <div className="text-[11px] opacity-70">mybusiness.codefuser.app</div>
                </button>
              </div>

              {domainMode === "own" && (
                <div className="space-y-2 p-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
                  <label className="block text-xs font-semibold text-neutral-300">Enter Your Registered Domain Name</label>
                  <input
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="e.g. apexlegal.com"
                    className="w-full bg-black border border-neutral-800 focus:border-[#EAE5D9] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-400">
                    We'll provide DNS setup instructions when your site preview is approved!
                  </p>
                </div>
              )}

              {domainMode === "buy_for_me" && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200 space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Sparkles size={15} /> CodeFuser Domain Concierge
                  </p>
                  <p className="leading-relaxed opacity-90">
                    Tell us your preferred domain name below and CodeFuser will assist you in acquiring and linking it seamlessly.
                  </p>
                  <input
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="e.g. apexlegalsolutions.com"
                    className="w-full bg-black/80 border border-amber-500/30 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              {domainMode === "subdomain" && (
                <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl text-xs text-neutral-300 space-y-1">
                  <p className="font-bold text-[#EAE5D9]">Free CodeFuser Subdomain</p>
                  <p className="text-neutral-400">
                    Your website will be published on a clean, fast CodeFuser web address. You can connect a custom domain at any time later!
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
