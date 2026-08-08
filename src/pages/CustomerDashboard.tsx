import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Check, 
  AlertCircle, 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  UploadCloud, 
  Clock, 
  Globe, 
  LogOut, 
  Layers, 
  Coins, 
  User,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  FileText,
  BadgeAlert,
  BadgeCheck,
  BadgeHelp,
  ArrowUpRight
} from "lucide-react";
import { useAppRouter } from "../components/Reveal";
import { getAuthUser, clearAuthSession, getAuthToken } from "../utils/auth";
import { supabase } from "../lib/supabase";
import { safeLocalStorage } from "../utils/safeStorage";
import { useAuth } from "../context/AuthContext";
import { useProject } from "../context/ProjectContext";
import { apiClient } from "../lib/apiClient";
import { PaymentSimulationPanel } from "../components/PaymentSimulationPanel";
import { ClientHeader, TabType } from "../components/dashboard/ClientHeader";
import { OverviewTab } from "../components/dashboard/OverviewTab";
import { MyProjectTab } from "../components/dashboard/MyProjectTab";
import { FilesTab } from "../components/dashboard/FilesTab";
import { PaymentsTab } from "../components/dashboard/PaymentsTab";
import { NeedHelpTab } from "../components/dashboard/NeedHelpTab";

interface ProjectRecord {
  id: string;
  clientName: string;
  businessName: string;
  email: string;
  whatsapp: string;
  selectedPackage: string;
  ownershipChoice: string;
  industry: string;
  customIndustry: string;
  goal: string;
  customGoal: string;
  hasDomain: string;
  hasLogo: string;
  contentReady: string;
  timestamp: string;
  status: string;
  paymentStatus?: string;
  portalAccess?: boolean;
  paymentProvider?: string;
  paymentId?: string;
  orderId?: string;
  purchasedPlan?: string;
  purchaseDate?: string;
  portalAccessSource?: "automatic" | "manual";
}

interface AssetFileRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  timestamp: string;
}

interface OfficialQuoteRecord {
  packageName: string;
  price: number;
  finalPrice?: number;
  discount: number;
  features: string[];
  summary: string;
  timestamp: string;
  expiryDate: string;
  status: "active" | "expiring" | "expired";
  proposal?: {
    content: string;
    status: "draft" | "sent";
    timestamp: string;
  } | null;
  checklist?: {
    id: string;
    task: string;
    completed: boolean;
  }[] | null;
  deliverables?: {
    id: string;
    name: string;
    category: string;
    size: number;
    url: string;
    timestamp: string;
  }[] | null;
}

interface ExtraProjectData {
  projectId: string;
  quote: OfficialQuoteRecord | null;
  assets: AssetFileRecord[];
}

class SectionErrorBoundary extends React.Component<{ name: string; children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { name: string; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SECTION EXCEPTION] ${this.props.name} threw during render:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs font-mono my-2">
          <strong>Section Error ({this.props.name}):</strong> {this.state.error?.message || String(this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}

function parseMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      return <h4 key={idx} className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider mt-4 mb-2">{trimmed.replace("### ", "")}</h4>;
    }
    if (trimmed.startsWith("## ")) {
      return <h3 key={idx} className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest border-b border-neutral-900 pb-1.5 mt-5 mb-2">{trimmed.replace("## ", "")}</h3>;
    }
    if (trimmed.startsWith("# ")) {
      return <h2 key={idx} className="text-sm font-black text-white uppercase tracking-tight mt-6 mb-3">{trimmed.replace("# ", "")}</h2>;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return (
        <div key={idx} className="flex gap-2 text-xs text-neutral-300 leading-relaxed mt-1 pl-2">
          <span className="text-amber-500">•</span>
          <span>{trimmed.replace(/^[-*]\s+/, "")}</span>
        </div>
      );
    }
    if (trimmed === "") {
      return <div key={idx} className="h-2" />;
    }
    return <p key={idx} className="text-xs text-neutral-400 leading-relaxed mt-1">{trimmed}</p>;
  });
}

export default function CustomerDashboard() {
  const { navigate } = useAppRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const handleDownloadAsset = async (assetId: string, fallbackUrl: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/projects/${projectId}/assets/${assetId}/download-url`, {
        headers: {
          "Authorization": `Bearer ${token || ""}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) {
          window.open(result.url, "_blank");
          return;
        }
      }
      window.open(fallbackUrl, "_blank");
    } catch (err) {
      console.error("Failed to fetch secure download link:", err);
      window.open(fallbackUrl, "_blank");
    }
  };

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Extra metadata (assets & quotes) state hooks
  const [extraStore, setExtraStore] = useState<ExtraProjectData>({ projectId: "", quote: null, assets: [] });
  const [extraLoading, setExtraLoading] = useState<boolean>(false);
  const [extraError, setExtraError] = useState<string | null>(null);

  // Upload micro-interaction states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Interactive Modal/Sections State
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState<string>("");
  const [logoInput, setLogoInput] = useState<string>("");
  const [copyInput, setCopyInput] = useState<string>("");
  const [isUpdatingField, setIsUpdatingField] = useState<string | null>(null);
  const [successIndicator, setSuccessIndicator] = useState<string | null>(null);

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [activeWorkspaceModal, setActiveWorkspaceModal] = useState<"settings" | "billing" | "support" | null>(null);

  const [settingsName, setSettingsName] = useState<string>("");
  const [settingsBusiness, setSettingsBusiness] = useState<string>("");
  const [settingsWhatsapp, setSettingsWhatsapp] = useState<string>("");
  const [settingsIndustry, setSettingsIndustry] = useState<string>("");
  const [settingsGoal, setSettingsGoal] = useState<string>("");
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  useEffect(() => {
    if (project) {
      setSettingsName(project.clientName || "");
      setSettingsBusiness(project.businessName || "");
      setSettingsWhatsapp(project.whatsapp || "");
      setSettingsIndustry(project.industry || "");
      setSettingsGoal(project.goal || "");
    }
  }, [project]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setIsSavingSettings(true);
    setSuccessIndicator(null);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken() || ""}`
        },
        body: JSON.stringify({
          clientName: settingsName,
          businessName: settingsBusiness,
          whatsapp: settingsWhatsapp,
          industry: settingsIndustry,
          goal: settingsGoal
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProject(result.data);
          setSuccessIndicator("Workspace settings saved live!");
          safeLocalStorage.setItem("codefuser_current_project", JSON.stringify(result.data));
          setActiveWorkspaceModal(null);
        }
      }
    } catch (err) {
      console.error("Failed to save workspace settings:", err);
    } finally {
      setIsSavingSettings(false);
      setTimeout(() => setSuccessIndicator(null), 3000);
    }
  };

  const assetCenterRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const { signOut } = useAuth();
  const { project: ctxProject, isLoading: projLoading, refreshProject } = useProject();

  console.log(`[TRACING] CustomerDashboard rendered | timestamp: ${new Date().toISOString()}`, {
    ctxProject: ctxProject ? { id: ctxProject.id, name: ctxProject.name } : null,
    projLoading,
    localIsLoading: isLoading
  });

  useEffect(() => {
    console.log(`[TRACING] CustomerDashboard useEffect sync triggered | projLoading: ${projLoading} | ctxProject: ${ctxProject ? ctxProject.id : 'null'}`);
    if (!projLoading) {
      if (ctxProject) {
        setProject(ctxProject as any);
        setProjectId(ctxProject.id);
        setDomainInput(getDisplayValue(ctxProject.hasDomain || ""));
        setLogoInput(getDisplayValue(ctxProject.hasLogo || ""));
        setCopyInput(getDisplayValue(ctxProject.contentReady || ""));
        fetchExtraData(ctxProject.id);
      } else {
        // Fallback check from local storage if available
        const localData = safeLocalStorage.getItem("codefuser_current_project");
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (parsed && parsed.id) {
              setProject(parsed);
              setProjectId(parsed.id);
              fetchExtraData(parsed.id);
            }
          } catch (e) {
            console.warn("Failed to parse local stored project:", e);
          }
        }
      }
      setIsLoading(false);
      console.log(`[TRACING] CustomerDashboard setIsLoading(false) executed`);
    }
  }, [ctxProject, projLoading]);

  const fetchExtraData = async (projId: string) => {
    setExtraLoading(true);
    setExtraError(null);
    try {
      const res = await apiClient<{ success: boolean; data: ExtraProjectData }>(`/api/projects/${projId}/extra`);
      if (res && res.success && res.data) {
        setExtraStore(res.data);
      }
    } catch (err) {
      console.error("Fetch extra project data failed:", err);
      setExtraError("Connection lost. Synchronization paused.");
    } finally {
      setExtraLoading(false);
    }
  };
  
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [verificationEnabled, setVerificationEnabled] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/config/razorpay')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.verificationEnabled === 'boolean') {
          setVerificationEnabled(data.verificationEnabled);
        }
      })
      .catch(() => {});
  }, []);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleFinalMilestonePayment = async () => {
    if (!project || !projectId) return;
    setPaymentLoading(true);
    setPaymentError(null);
    
    try {
      // 1. Check RAZORPAY_VERIFICATION configuration from server
      let isVerificationOn = verificationEnabled;
      try {
        const modeRes = await fetch("/api/config/razorpay");
        const modeData = await modeRes.json();
        if (modeData && typeof modeData.verificationEnabled === 'boolean') {
          isVerificationOn = modeData.verificationEnabled;
          setVerificationEnabled(isVerificationOn);
        }
      } catch (err) {
        console.warn("Could not check payment verification configuration:", err);
      }

      if (!isVerificationOn) {
        // AUTOMATIC SUCCESS SIMULATION MODE: Skip Razorpay checkout popup completely!
        const simRes = await fetch(`/api/projects/${projectId}/simulate-payment`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAuthToken() || ""}`
          },
          body: JSON.stringify({ term: "final", action: "success" })
        });
        const simData = await simRes.json();
        if (simData.success) {
          await refreshProject();
          setSuccessIndicator("Milestone payment simulated successfully! Client portal fully unlocked.");
          setTimeout(() => setSuccessIndicator(null), 5000);
        } else {
          throw new Error("Automatic payment simulation failed: " + (simData.error || "Unknown error"));
        }
        setPaymentLoading(false);
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to load the Razorpay checkout SDK. Please check your internet connection.");
      }
      
      const orderRes = await fetch(`/api/projects/${projectId}/razorpay-order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken() || ""}`
        },
        body: JSON.stringify({ term: "final" })
      });
      
      const orderData = await orderRes.json();
      if (!orderData || !orderData.success) {
        throw new Error(orderData?.error || "Failed to create final milestone payment order.");
      }
      
      const { order } = orderData;
      
      let keyId = "";
      try {
        const configRes = await fetch("/api/config/razorpay");
        const configData = await configRes.json();
        keyId = configData.keyId;
      } catch (err) {
        console.warn("Could not load public key configuration.");
      }
      
      const options = {
        key: keyId || "rzp_test_placeholder",
        amount: order.amount,
        currency: order.currency,
        name: "CodeFuser",
        description: `${extraStore.quote?.packageName || "Custom Package"} (Final 50% Milestone)`,
        order_id: order.id,
        prefill: {
          name: project.clientName || "",
          email: project.email || "",
          contact: project.whatsapp || ""
        },
        theme: {
          color: "#F59E0B"
        },
        handler: async function (response: any) {
          setPaymentLoading(true);
          try {
            const verifyRes = await fetch(`/api/projects/${projectId}/verify-payment`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getAuthToken() || ""}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                term: "final"
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              await refreshProject();
              setSuccessIndicator("Milestone payment successful! Thank you.");
              setTimeout(() => setSuccessIndicator(null), 5000);
            } else {
              setPaymentError("Payment verification failed: " + (verifyData.error || "Please contact support."));
            }
          } catch (err) {
            setPaymentError("Could not verify transaction signature.");
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
            setPaymentError("Payment cancelled by customer.");
          }
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        setPaymentError(`Transaction failed: ${resp.error.description || "Action rejected"}`);
        setPaymentLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setPaymentError(err.message || "Failed to initiate payment. Please try again.");
      setPaymentLoading(false);
    }
  };

  const logoutClient = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    clearAuthSession();
    setProjectId(null);
    setProject(null);
    navigate("/login");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !project) return;
    const file = files[0];
    await uploadSingleFile(file);
  };

  const uploadSingleFile = async (file: File) => {
    if (!project) return;
    setUploadProgress(10);
    setUploadStatus("Reading file binary stream...");
    setUploadError(null);

    const reader = new FileReader();
    reader.onloadstart = () => {
      setUploadProgress(20);
    };
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 55);
        setUploadProgress(20 + percent); // Up to 75%
      }
    };
    reader.onload = async () => {
      try {
        setUploadProgress(80);
        setUploadStatus("Transmitting raw bytes to workspace...");
        
        const rawContent = reader.result as string;
        // Strip out the data:mimetype;base64, segment
        const base64Data = rawContent.split(',')[1] || rawContent;
        
        const response = await fetch(`/api/projects/${project.id}/upload`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAuthToken() || ""}`
          },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            size: file.size,
            content: base64Data
          })
        });

        if (!response.ok) throw new Error("Upload chunk was refused.");
        
        const body = await response.json();
        if (body.success && body.data) {
          setUploadProgress(100);
          setUploadStatus("Asset registered successfully!");
          setExtraStore(body.data);
          
          // Clear progressive overlay after short pause
          setTimeout(() => {
            setUploadProgress(null);
            setUploadStatus(null);
          }, 2000);
        } else {
          throw new Error(body.error || "Upload failed on cloud repository.");
        }
      } catch (err: any) {
        setUploadError(err.message || "Upload failed. Server unavailable.");
        setUploadProgress(null);
        setUploadStatus(null);
      }
    };
    
    reader.onerror = () => {
      setUploadError("Failed to parse local file stream.");
      setUploadProgress(null);
      setUploadStatus(null);
    };

    reader.readAsDataURL(file);
  };

  const handleUpdateAssetField = async (field: "domain" | "logo" | "copy", value: string) => {
    if (!project) return;
    setIsUpdatingField(field);
    setSuccessIndicator(null);

    const payload: Partial<ProjectRecord> = {};
    if (field === "domain") payload.hasDomain = value;
    if (field === "logo") payload.hasLogo = value;
    if (field === "copy") payload.contentReady = value;

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken() || ""}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Sync failure.");

      const result = await response.json();
      if (result.success) {
        setProject(result.data);
        setSuccessIndicator(`${field === "domain" ? "Domain address" : field === "logo" ? "Brand logo" : "Copywriting docs"} updated live!`);
        safeLocalStorage.setItem("codefuser_current_project", JSON.stringify(result.data));
      }
    } catch (err) {
      console.warn("Server unavailable, updating local client state gracefully.", err);
      const mockUpdated = {
        ...project,
        hasDomain: field === "domain" ? value : project.hasDomain,
        hasLogo: field === "logo" ? value : project.hasLogo,
        contentReady: field === "copy" ? value : project.contentReady
      };
      setProject(mockUpdated);
      safeLocalStorage.setItem("codefuser_current_project", JSON.stringify(mockUpdated));
      setSuccessIndicator(`Offline fallback state updated successfully.`);
    } finally {
      setIsUpdatingField(null);
      setTimeout(() => setSuccessIndicator(null), 3500);
    }
  };  const getCleanPackageName = (name: string): string => {
    if (!name || typeof name !== "string") return "Package";
    const n = name.toLowerCase();
    if (n.includes("foundation") || n.includes("ignite")) {
      return "Ignite Package";
    }
    if (n.includes("growth") || n.includes("fusion")) {
      return "Fusion Package";
    }
    if (n.includes("dominance") || n.includes("catalyst")) {
      return "Catalyst Package";
    }
    return name;
  };

  const getPlanDetails = (packageId: string) => {
    const p = (packageId && typeof packageId === "string") ? packageId.toLowerCase() : "";
    if (p.includes("ignite") || p.includes("foundation")) {
      return { name: "Ignite Package", price: 9999, originalPrice: 9999, timeline: "5-7 days after asset submission" };
    }
    if (p.includes("growth") || p.includes("fusion")) {
      return { name: "Fusion Package", price: 19999, originalPrice: 19999, timeline: "10-14 days after asset submission" };
    }
    if (p.includes("dominance") || p.includes("catalyst")) {
      return { name: "Catalyst Package", price: 39999, originalPrice: 39999, timeline: "21-30 days after asset submission" };
    }
    return { name: `${packageId || "Fusion"} Package`, price: 19999, originalPrice: 19999, timeline: "10-14 days after asset submission" };
  };

  const getAssetCategory = (val: string | undefined): "provided" | "help" | "not_required" | "pending" => {
    if (!val || typeof val !== "string" || val === "" || val === "no") return "pending";
    if (val === "help" || val === "no_help") return "help";
    const valLower = val.toLowerCase();
    if (val === "not_required" || valLower.includes("not_required") || valLower.includes("not required")) return "not_required";
    return "provided";
  };

  const getDisplayValue = (val: string) => {
    if (!val || typeof val !== "string" || val === "yes" || val === "no" || val === "help" || val === "no_help" || val === "not_required") return "";
    if (val.startsWith("Provided: ")) return val.replace("Provided: ", "");
    return val;
  };

  const customerTimelineStages = [
    { label: "Payment Received" },
    { label: "Project Created" },
    { label: "Asset Collection" },
    { label: "Design Started" },
    { label: "Development" },
    { label: "Client Review" },
    { label: "Revisions (if required)" },
    { label: "Testing" },
    { label: "Launch" },
    { label: "Delivery" }
  ];

  const getCustomerStageIndex = (statusStr: string, hasEmptyAssets: boolean): number => {
    const s = (statusStr && typeof statusStr === "string") ? statusStr.toLowerCase() : "";
    if (s.includes("completed") || s.includes("delivery") || s.includes("delivered")) return 9; // Delivery
    if (s.includes("launch") || s.includes("live") || s.includes("launched")) return 8; // Launch
    if (s.includes("testing") || s.includes("qa")) return 7; // Testing
    if (s.includes("revision") || s.includes("revisions")) return 6; // Revisions (if required)
    if (s.includes("review") || s.includes("checklist ready") || s.includes("client review")) return 5; // Client Review
    if (s.includes("dev") || s.includes("development") || s.includes("core development")) return 4; // Development
    if (s.includes("design") || s.includes("wireframe") || s.includes("designing") || s.includes("specs audited")) return 3; // Design Started
    
    // Onboarding fallback stage
    if (hasEmptyAssets) {
      return 2; // Asset Collection
    } else {
      return 3; // Transition immediately to Design Started when assets are complete
    }
  };

  const getCustomerStatusLabel = (stageIndex: number): string => {
    switch (stageIndex) {
      case 0: return "Payment Received";
      case 1: return "Project Created";
      case 2: return "Asset Collection";
      case 3: return "Design Started";
      case 4: return "Development";
      case 5: return "Client Review";
      case 6: return "Revisions (if required)";
      case 7: return "Testing";
      case 8: return "Launch";
      case 9: return "Delivery";
      default: return "Onboarding";
    }
  };

  const getStageExpectations = (stageIndex: number) => {
    switch (stageIndex) {
      case 0: // Payment Received
        return {
          status: "Payment Received & Confirmed",
          happening: "Your premium onboarding fee has been fully processed and confirmed.",
          waitingFor: "Setting up your custom high-speed cloud project workspace.",
          doing: "Provisioning your secure developer sandbox environment and template repository.",
          next: "Creating your custom website project specifications draft.",
        };
      case 1: // Project Created
        return {
          status: "Project Created",
          happening: "Your secure project environment is fully initialized and active.",
          waitingFor: "Your preference selections and business information assets.",
          doing: "Analyzing your selected package specs and aligning our design specialists.",
          next: "Onboarding and digital assets collection session.",
        };
      case 2: // Asset Collection
        return {
          status: "Asset Collection",
          happening: "We're waiting for your business details or help selections before starting design.",
          waitingFor: "Providing your assets (logo, domain, copywriting) OR selecting 'Need Help' below.",
          doing: "Preparing visual style placeholders and copywriting guides where assistance is selected.",
          next: "Initiating custom visual interface design and mock wireframes.",
        };
      case 3: // Design Started
        return {
          status: "Design Started",
          happening: "Our creative design team is drafting your custom visual mockups and layouts.",
          waitingFor: "Our professional designers to finalize high-fidelity responsive page layouts.",
          doing: "Fine-tuning colors, typography schemes, layout structures, and visual page stylings.",
          next: "Handing over the approved layout specs to our frontend engineering team.",
        };
      case 4: // Development
        return {
          status: "Development",
          happening: "Our engineers are actively coding your high-performance responsive website.",
          waitingFor: "Our dev team to complete full component codes and search optimization.",
          doing: "Writing semantic React components, setting up clean motion animations, and programming route codes.",
          next: "Opening the interactive draft link for your official client review and approval.",
        };
      case 5: // Client Review
        return {
          status: "Client Review",
          happening: "Your custom interactive website draft is complete and ready for your official review.",
          waitingFor: "Your critical feedback on layouts, page visual appeal, text copywriting, and animations.",
          doing: "Preparing our engineers to address any feedback or refinement requests you submit.",
          next: "Applying necessary revision updates or moving directly into final quality assurance.",
        };
      case 6: // Revisions (if required)
        return {
          status: "Revisions (if required)",
          happening: "We are actively implementing your revision requests and fine-tuning specified details.",
          waitingFor: "Our visual engineers and content copywriters to complete your requested edits.",
          doing: "Polishing interface details, updating text assets, and updating layout components.",
          next: "Publishing the updated layout and moving to final testing.",
        };
      case 7: // Testing
        return {
          status: "Testing",
          happening: "We are performing comprehensive quality assurance and device testing checks.",
          waitingFor: "Our specialists to verify all responsive, speed, and security check criteria.",
          doing: "Auditing page load speeds, testing mobile responsiveness, verifying contact forms, and security.",
          next: "Publishing to your production domain for the official live public release.",
        };
      case 8: // Launch
        return {
          status: "Launch",
          happening: "Your website is fully optimized, verified, and ready to go live to the world.",
          waitingFor: "Your green-light confirmation to trigger DNS propagation and publish.",
          doing: "Preparing live server routing, cache optimization, and search engine registrations.",
          next: "Official project handover and population of your deliverables vault.",
        };
      case 9: // Delivery
        return {
          status: "Delivery",
          happening: "Congratulations! Your premium website project is successfully completed and live.",
          waitingFor: "Nothing! Your website is fully active and driving brand authority.",
          doing: "Actively monitoring live page metrics, secure backups, and platform stability.",
          next: "Explore your deliverables archive folder and celebrate your beautiful new website!",
        };
      default:
        return {
          status: "Onboarding In Progress",
          happening: "Welcome to CodeFuser! We are setting up your website project space.",
          waitingFor: "Your assets to be configured.",
          doing: "Pre-allocating space in our cloud architecture.",
          next: "Unlocking your asset collection workspace.",
        };
    }
  };

  const getWhatsAppLink = (textStr: string) => {
    return `https://wa.me/917449100307?text=${encodeURIComponent(textStr)}`;
  };

  const getComposeEmailLink = (pkgName: string) => {
    const subject = `Website Assets: Project onboarding for ${project?.businessName || "My Business"}`;
    const body = `Hi CodeFuser Team,\n\nI have prepared my business details for ${project?.businessName || "My Business"}! Ready to start our website journey.\n\nProject ID: ${project?.id}\nPlan: ${pkgName}`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=aicodefuser@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getQuoteTimeRemaining = (expiryStr?: string) => {
    if (!expiryStr) return "Expired";
    const diff = new Date(expiryStr).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h ${minutes}m remaining`;
  };

  const handleResetQuote = async () => {
    if (!project) return;
    if (!confirm("Are you sure you want to reset your quotation? Standard packages will resume.")) return;
    try {
      const res = await fetch(`/api/projects/${project.id}/quote/reset`, { 
        method: "POST",
        headers: {
          "Authorization": `Bearer ${getAuthToken() || ""}`
        }
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success) {
          setExtraStore(body.data);
          alert("Quotation has been reset successfully.");
        } else {
          alert(body.error || "Failed to reset quote.");
        }
      } else {
        alert("Failed to reset standard quotation.");
      }
    } catch(err) {
      console.error("Failed to reset standard quotation:", err);
      alert("Error resetting standard quotation.");
    }
  };

  const isApprovedClient = !!project && (project.portalAccess === true || project.paymentStatus === "paid" || project.paymentStatus === "partially_paid" || !!project.id);

  if (isLoading) {
    console.log("[TRACING RENDER] CustomerDashboard rendering isLoading state");
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="h-9 w-9 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Loading Your Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isApprovedClient) {
    console.log("[TRACING RENDER] CustomerDashboard rendering Access Denied state | project:", project);
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#050505] border border-neutral-900 rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
          
          <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-6">
            <Lock size={20} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-100 font-sans">
            Access Denied
          </h2>
          <p className="text-sm text-neutral-300 mt-4 leading-relaxed font-sans">
            This account is not linked to an active website project.
          </p>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-sans">
            Please make sure you are signed in with your registered email, or contact us to authorize your workspace.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-white hover:bg-neutral-100 text-black py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs font-sans cursor-pointer transition-all"
            >
              Return Home
            </button>
            
            <button
              onClick={() => window.open(`https://wa.me/917449100307?text=${encodeURIComponent("Hi, I am trying to access my client dashboard and need help.")}`, "_blank")}
              className="w-full bg-neutral-900 hover:bg-neutral-850 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs border border-neutral-800 font-sans cursor-pointer transition-all"
            >
              Contact Support
            </button>
          </div>

          <button 
            onClick={logoutClient}
            className="text-xs text-neutral-500 hover:text-red-400 transition-colors uppercase font-mono tracking-widest mt-6 block mx-auto cursor-pointer"
          >
            Switch Accounts
          </button>
        </motion.div>
      </div>
    );
  }

  // Pre-calculate financial details
  const planInfo = getPlanDetails(project.selectedPackage);
  const quoteData = extraStore.quote;
  
  const rawPackageName = quoteData ? quoteData.packageName : planInfo.name;
  const selectedPackageName = getCleanPackageName(rawPackageName);
  const finalPrice = (quoteData?.finalPrice ?? quoteData?.price ?? planInfo?.price) || 0;
  const isFullySettled = project.ownershipChoice === "full";
  
  const paidFunds = isFullySettled ? finalPrice * 0.9 : finalPrice / 2;
  const unpaidFunds = isFullySettled ? 0 : finalPrice / 2;

  const isDomainComplete = getAssetCategory(project.hasDomain) !== "pending";
  const isLogoComplete = getAssetCategory(project.hasLogo) !== "pending";
  const isCopyComplete = getAssetCategory(project.contentReady) !== "pending";

  const domainState = getAssetCategory(project.hasDomain);
  const logoState = getAssetCategory(project.hasLogo);
  const copyState = getAssetCategory(project.contentReady);

  const btnClass = (isActive: boolean) => 
    `flex-1 py-1.5 px-2 text-[10px] font-mono font-bold uppercase rounded-lg border text-center transition-all cursor-pointer ${
      isActive 
        ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)] font-extrabold" 
        : "bg-[#050505] text-neutral-400 border-neutral-900 hover:text-white hover:border-neutral-850"
    }`;

  const hasEmptyAssets = !isDomainComplete || !isLogoComplete || !isCopyComplete;

  const currentStageIndex = getCustomerStageIndex(project.status, hasEmptyAssets);

  // Formulate exactly ONE primary action details
  const getPrimaryAction = () => {
    if (currentStageIndex === 0) {
      return {
        title: "Payment Received & Confirmed",
        description: "Thank you! We've successfully received and verified your payment. We are setting up your project space.",
        btnText: "Configure Onboarding Assets",
        action: () => {
          setActiveQuickAction("assets");
          setTimeout(() => {
            assetCenterRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      };
    }
    if (currentStageIndex === 1) {
      return {
        title: "Your Project Sandbox is Active",
        description: "Your secure workspace has been initialized. Let's configure your branding assets and copywriting preferences.",
        btnText: "Configure Onboarding Assets Now",
        action: () => {
          setActiveQuickAction("assets");
          setTimeout(() => {
            assetCenterRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      };
    }
    if (currentStageIndex === 2) {
      return {
        title: "Waiting for Onboarding Assets",
        description: "Please complete your asset selections (logo, domain, and copy) or request our professional help below.",
        btnText: "Provide Onboarding Assets",
        action: () => {
          setActiveQuickAction("assets");
          setTimeout(() => {
            assetCenterRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      };
    }
    if (currentStageIndex === 3) {
      return {
        title: "Your Website Design is in Progress",
        description: "Our professional design specialists are drafting custom high-fidelity visuals, mock layouts, and typography grids.",
        btnText: "Discuss Styling on WhatsApp",
        action: () => {
          window.open(getWhatsAppLink(`Hi CodeFuser, I'd like to check on the design layouts for my website project: ${project.businessName}.`), "_blank");
        }
      };
    }
    if (currentStageIndex === 4) {
      return {
        title: "Your Website is in Active Development",
        description: "Our software engineers are writing clean React code and adding fluid motion animations. No actions are required.",
        btnText: "Request Progress Update",
        action: () => {
          window.open(getWhatsAppLink(`Hi CodeFuser, let's sync on the website development progress for ${project.businessName}.`), "_blank");
        }
      };
    }
    if (currentStageIndex === 5) {
      return {
        title: "Review Your Website Draft Link",
        description: "Your interactive draft website is ready! Please review the layout and either submit revision requests or approve it.",
        btnText: "Review Interactive Website Draft",
        action: () => {
          window.open(getWhatsAppLink(`Hi CodeFuser, I am ready to review my website draft and live sandbox for ${project.businessName}!`), "_blank");
        }
      };
    }
    if (currentStageIndex === 6) {
      return {
        title: "Revisions in Progress",
        description: "We are actively implementing your revision feedback, polishing layouts, and updating content assets.",
        btnText: "Submit Additional Feedback",
        action: () => {
          window.open(getWhatsAppLink(`Hi CodeFuser, I have some additional feedback/revisions for ${project.businessName}.`), "_blank");
        }
      };
    }
    if (currentStageIndex === 7) {
      return {
        title: "Performing Quality Testing Audits",
        description: "Our QA team is conducting cross-device audits, page speed metrics checks, SSL activations, and contact form tests.",
        btnText: "Chat with QA Coordinator",
        action: () => {
          window.open(getWhatsAppLink(`Hi CodeFuser, I'd like to sync on the final QA testing status of my website ${project.businessName}.`), "_blank");
        }
      };
    }
    if (currentStageIndex === 8) {
      return {
        title: "Your Website is Ready to Go Live!",
        description: "All audits passed! We are ready to launch your live website and map it to your custom production domain address.",
        btnText: "Authorize Live Launch",
        action: () => {
          window.open(getWhatsAppLink(`Hi CodeFuser, I'm ready to take my website live! Please propagate the DNS routing for ${project.businessName}.`), "_blank");
        }
      };
    }
    if (currentStageIndex === 9) {
      return {
        title: "Congratulations! Your Project is Delivered",
        description: "Your premium website is fully live, secure, and completed. You can access your final delivered assets below.",
        btnText: "Visit Live Production Website",
        action: () => {
          const domain = typeof project?.hasDomain === "string" && project.hasDomain !== "no" ? project.hasDomain.replace("Provided: ", "").trim() : "";
          if (domain && domain !== "help" && domain !== "not_required") {
            window.open(domain.startsWith("http") ? domain : `https://${domain}`, "_blank");
          } else {
            window.open(getWhatsAppLink(`Hi CodeFuser, my website is launched! Can you send me the final live link?`), "_blank");
          }
        }
      };
    }
    return {
      title: "Onboarding In Progress",
      description: "Welcome to CodeFuser! We are setting up your website project space.",
      btnText: "Configure Your Assets",
      action: () => {
        setActiveQuickAction("assets");
        setTimeout(() => {
          assetCenterRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    };
  };

  const primaryActionDetails = getPrimaryAction();

  // Simple, welcoming, conversational notifications
  const getNotificationsList = () => {
    const list = [];
    
    list.push({
      id: "onboard-act",
      title: "Onboarding Active",
      text: "Your payment has been received successfully. Your project onboarding is now active.",
      type: "success"
    });

    if (hasEmptyAssets) {
      list.push({
        id: "assets-pend",
        title: "Waiting for Assets",
        text: "We are waiting for your logo, images and business details before starting development.",
        type: "warning"
      });
    } else {
      list.push({
        id: "assets-confirmed",
        title: "Assets Configured",
        text: "All required assets are completed (provided, requested from CodeFuser, or not required).",
        type: "success"
      });
    }

    if (currentStageIndex === 3) {
      list.push({
        id: "stage-notice",
        title: "Design Phase Active",
        text: "Our designers are crafting your custom page layouts and visuals.",
        type: "info"
      });
    } else if (currentStageIndex === 4) {
      list.push({
        id: "stage-notice",
        title: "Development Phase Active",
        text: "We are actively coding your responsive full-stack web pages.",
        type: "info"
      });
    } else if (currentStageIndex === 5) {
      list.push({
        id: "stage-notice",
        title: "Review Phase Active",
        text: "Your website interactive draft is ready for review and feedback.",
        type: "info"
      });
    } else if (currentStageIndex === 6) {
      list.push({
        id: "stage-notice",
        title: "Revisions Phase Active",
        text: "We are fine-tuning layouts based on your feedback notes.",
        type: "info"
      });
    } else if (currentStageIndex === 7) {
      list.push({
        id: "stage-notice",
        title: "Testing Phase Active",
        text: "We are conducting final device responsiveness, security, and speed audits.",
        type: "info"
      });
    }

    return list;
  };

  const notificationList = getNotificationsList();

  console.log("[TRACING RENDER] Rendering CustomerDashboard main return");
  return (
    <div className="min-h-screen bg-black text-white font-sans select-none relative overflow-x-hidden pb-12">
      {/* Decorative subtle ambient backdrop */}
      <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-amber-500/[0.02] to-transparent pointer-events-none" />

      {/* Navigation Header with 5 Tabs */}
      <SectionErrorBoundary name="Header">
        <ClientHeader
          businessName={project?.businessName || ""}
          clientName={project?.clientName || ""}
          clientEmail={project?.email || ""}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentStageIndex={currentStageIndex}
          getCustomerStatusLabel={getCustomerStatusLabel}
          isProfileDropdownOpen={isProfileDropdownOpen}
          setIsProfileDropdownOpen={setIsProfileDropdownOpen}
          setActiveWorkspaceModal={setActiveWorkspaceModal}
          logoutClient={logoutClient}
        />
      </SectionErrorBoundary>

      {/* Main Tab Content */}
      <main className="pt-16 sm:pt-20 transition-all duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 font-sans">
        {successIndicator && (
          <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold">
            <Check size={14} className="text-emerald-400 animate-bounce" />
            <span>{successIndicator}</span>
          </div>
        )}

        <SectionErrorBoundary name="ActiveTab">
          {activeTab === "overview" && (
            <OverviewTab
              project={project}
              currentStageIndex={currentStageIndex}
              getCustomerStatusLabel={getCustomerStatusLabel}
              primaryActionDetails={primaryActionDetails}
              selectedPackageName={selectedPackageName}
              planInfo={planInfo}
              hasEmptyAssets={hasEmptyAssets}
              finalPrice={finalPrice}
              paidFunds={paidFunds}
              unpaidFunds={unpaidFunds}
              onNavigateTab={(tab) => setActiveTab(tab)}
              handleFinalMilestonePayment={handleFinalMilestonePayment}
              paymentLoading={paymentLoading}
              paymentError={paymentError}
              getWhatsAppLink={getWhatsAppLink}
              getStageExpectations={getStageExpectations}
            />
          )}

          {activeTab === "project" && (
            <MyProjectTab
              project={project}
              currentStageIndex={currentStageIndex}
              customerTimelineStages={customerTimelineStages}
              getCustomerStatusLabel={getCustomerStatusLabel}
              extraStore={extraStore}
              handleUpdateAssetField={handleUpdateAssetField}
              handleFileUpload={handleFileUpload}
              uploadStatus={uploadStatus}
              uploadProgress={uploadProgress}
              uploadError={uploadError}
              domainState={domainState}
              logoState={logoState}
              copyState={copyState}
              domainInput={domainInput}
              setDomainInput={setDomainInput}
              logoInput={logoInput}
              setLogoInput={setLogoInput}
              copyInput={copyInput}
              setCopyInput={setCopyInput}
              isUpdatingField={isUpdatingField}
              btnClass={btnClass}
            />
          )}

          {activeTab === "files" && (
            <FilesTab
              project={project}
              extraStore={extraStore}
              handleDownloadAsset={handleDownloadAsset}
              handleFileUpload={handleFileUpload}
              uploadStatus={uploadStatus}
              uploadProgress={uploadProgress}
              uploadError={uploadError}
            />
          )}

          {activeTab === "payments" && (
            <PaymentsTab
              project={project}
              selectedPackageName={selectedPackageName}
              finalPrice={finalPrice}
              paidFunds={paidFunds}
              unpaidFunds={unpaidFunds}
              handleFinalMilestonePayment={handleFinalMilestonePayment}
              paymentLoading={paymentLoading}
              paymentError={paymentError}
              handleResetQuote={handleResetQuote}
              extraStore={extraStore}
            />
          )}

          {activeTab === "help" && (
            <NeedHelpTab
              project={project}
              getWhatsAppLink={getWhatsAppLink}
              getComposeEmailLink={getComposeEmailLink}
            />
          )}
        </SectionErrorBoundary>
        </div>
      </main>

      {/* Workspace Settings Modal */}
      <SectionErrorBoundary name="Modals">
      <AnimatePresence>
        {activeWorkspaceModal === "settings" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={() => setActiveWorkspaceModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-5">
                <h3 className="text-sm font-mono font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  <User size={15} /> Workspace Settings
                </h3>
                <button 
                  onClick={() => setActiveWorkspaceModal(null)}
                  className="text-neutral-500 hover:text-white transition-colors text-sm font-mono focus:outline-none bg-transparent border-none cursor-pointer"
                >
                  [Close]
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">Client Full Name</label>
                  <input 
                    type="text" 
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">Business Name</label>
                  <input 
                    type="text" 
                    value={settingsBusiness}
                    onChange={(e) => setSettingsBusiness(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">WhatsApp Contact No</label>
                  <input 
                    type="text" 
                    value={settingsWhatsapp}
                    onChange={(e) => setSettingsWhatsapp(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    placeholder="+91..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">Industry Profile</label>
                    <input 
                      type="text" 
                      value={settingsIndustry}
                      onChange={(e) => setSettingsIndustry(e.target.value)}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">Growth Goal</label>
                    <input 
                      type="text" 
                      value={settingsGoal}
                      onChange={(e) => setSettingsGoal(e.target.value)}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceModal(null)}
                    className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-neutral-850/60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
                  >
                    {isSavingSettings ? "Saving Changes..." : "Save Workspace"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Billing & Payments Modal */}
      <AnimatePresence>
        {activeWorkspaceModal === "billing" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={() => setActiveWorkspaceModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-5">
                <h3 className="text-sm font-mono font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  <Coins size={15} /> Billing & Payments
                </h3>
                <button 
                  onClick={() => setActiveWorkspaceModal(null)}
                  className="text-neutral-500 hover:text-white transition-colors text-sm font-mono focus:outline-none bg-transparent border-none cursor-pointer"
                >
                  [Close]
                </button>
              </div>

              <div className="space-y-4 text-left font-sans">
                <div className="p-4 bg-[#050505] border border-neutral-900 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs border-b border-neutral-900/60 pb-2">
                    <span className="text-neutral-400">Selected Package</span>
                    <span className="font-bold text-white uppercase">{selectedPackageName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-neutral-900/60 pb-2">
                    <span className="text-neutral-400">Total Price</span>
                    <span className="font-bold text-white font-mono">₹{Math.round(finalPrice).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Settlement Choice</span>
                    <span className="font-bold text-amber-400 uppercase">
                      {project?.ownershipChoice === "full" ? "Full Ownership (10% Off)" : "Managed / Milestone Split"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">Milestone Summary</h4>
                  <div className="space-y-2">
                    {/* Milestone 1 */}
                    <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">Milestone 1: Project Initiation</span>
                        <span className="text-[10px] font-mono text-emerald-400 mt-0.5 block">₹{Math.round(project?.paymentStatus === "partially_paid" ? finalPrice * 0.5 : (project?.ownershipChoice === "full" ? finalPrice : finalPrice * 0.5)).toLocaleString("en-IN")} • Confirmed</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">PAID</span>
                    </div>

                    {/* Milestone 2 */}
                    <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">Milestone 2: Final Handover</span>
                        <span className="text-[10px] font-mono mt-0.5 block text-neutral-400">
                          ₹{Math.round(project?.paymentStatus === "partially_paid" ? finalPrice * 0.5 : (project?.ownershipChoice === "full" ? 0 : finalPrice * 0.5)).toLocaleString("en-IN")} 
                          {project?.paymentStatus === "partially_paid" ? " • Outstanding" : " • Settled"}
                        </span>
                      </div>
                      {project?.paymentStatus === "partially_paid" ? (
                        <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">DUE</span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">PAID</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setActiveWorkspaceModal(null)}
                    className="w-full py-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-neutral-850/60"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Support & Concierge Modal */}
      <AnimatePresence>
        {activeWorkspaceModal === "support" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={() => setActiveWorkspaceModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-5">
                <h3 className="text-sm font-mono font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  <MessageSquare size={15} /> Support & Concierge
                </h3>
                <button 
                  onClick={() => setActiveWorkspaceModal(null)}
                  className="text-neutral-500 hover:text-white transition-colors text-sm font-mono focus:outline-none bg-transparent border-none cursor-pointer"
                >
                  [Close]
                </button>
              </div>

              <div className="space-y-4 text-left font-sans text-xs">
                <p className="text-neutral-400 leading-relaxed font-medium">
                  As a premium CodeFuser client, you have direct, prioritized access to our creative team and engineering leads.
                </p>

                <div className="space-y-2.5 pt-2">
                  <a
                    href={`https://wa.me/917449100307?text=${encodeURIComponent(`Hi CodeFuser, I am logged in to my workspace for ${project?.businessName || "My Business"} and would like to speak to a project concierge.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/35 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <MessageSquare size={15} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Immediate WhatsApp Chat</span>
                        <span className="block text-[10px] text-neutral-500 mt-0.5">Average response time: &lt; 15 minutes</span>
                      </div>
                    </div>
                  </a>

                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=aicodefuser@gmail.com&su=${encodeURIComponent(`Priority Support Request: ${project?.businessName || "My Business"}`)}&body=${encodeURIComponent(`Hi CodeFuser Concierge Team,\n\nI need priority support for my active website project.\n\nProject ID: ${project?.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/35 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <FileText size={15} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Direct Support Email</span>
                        <span className="block text-[10px] text-neutral-500 mt-0.5">aicodefuser@gmail.com</span>
                      </div>
                    </div>
                  </a>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setActiveWorkspaceModal(null)}
                    className="w-full py-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-neutral-850/60"
                  >
                    Close Support
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </SectionErrorBoundary>
    </div>
  );
}
