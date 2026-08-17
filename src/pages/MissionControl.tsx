import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, 
  User, 
  Mail, 
  MessageSquare, 
  Clock, 
  Layers, 
  Globe, 
  Palette, 
  FileText, 
  Shield, 
  CheckCircle, 
  Database,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronRight,
  Sparkles,
  Inbox,
  Eye,
  EyeOff
} from "lucide-react";
import { useAppRouter, w as getWhatsAppLink } from "../components/Reveal";
import { getAuthUser, getAuthToken } from "../utils/auth";
import { safeLocalStorage } from "../utils/safeStorage";
import { PaymentSimulationPanel } from "../components/PaymentSimulationPanel";
import { normalizeProject, normalizeUser } from "../lib/schemaNormalizer";
import { ProjectRecord } from "../components/dashboard/dashboardTypes";

import { BusinessIntelligenceCRM } from "../components/BusinessIntelligenceCRM";
import { HostingAdminManager } from "../components/admin/HostingAdminManager";
import { CouponsAdminManager } from "../components/admin/CouponsAdminManager";

export const MissionControl: React.FC = () => {
  const { navigate } = useAppRouter();

  const getAdminHeaders = (extraHeaders: Record<string, string> = {}) => {
    return {
      "Authorization": `Bearer ${getAuthToken() || ""}`,
      "x-admin-password": sessionStorage.getItem("fuser_admin_password") || "",
      ...extraHeaders
    };
  };
  
  const handleDownloadAsset = async (projId: string, assetId: string, fallbackUrl: string) => {
    try {
      const response = await fetch(`/api/projects/${projId}/assets/${assetId}/download-url`, {
        headers: getAdminHeaders()
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

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const user = getAuthUser();
    const isAdminUser = user && (user.role === "admin" || user.role === "super_admin");
    return !!isAdminUser || sessionStorage.getItem("fuser_admin_authed") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorValue, setErrorValue] = useState<string | null>(null);
  const [dbSource, setDbSource] = useState<string>("Supabase");
  
  // Controls
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "users" | "crm" | "hosting" | "coupons">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>("all");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Users & RBAC state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // Extra project maps (Part 3 requirement)
  const [extraProjectMap, setExtraProjectMap] = useState<Record<string, any>>({});
  const [extraLoadingMap, setExtraLoadingMap] = useState<Record<string, boolean>>({});

  // Phase 6 Phase-Specific States
  const [adminSubTabs, setAdminSubTabs] = useState<Record<string, "proposal" | "checklist" | "deliverables" | "notes" | "comms" | "progress" | "lifecycle" | "requests" | "overrides">>({});
  const [isEmergencyMode, setIsEmergencyMode] = useState<boolean>(() => safeLocalStorage.getItem("fuser_emergency_mode") === "true");
  const [proposalEdits, setProposalEdits] = useState<Record<string, string>>({});
  const [proposalLoading, setProposalLoading] = useState<Record<string, boolean>>({});
  const [checklistDrafts, setChecklistDrafts] = useState<Record<string, any[]>>({});
  const [deliverablesDrafts, setDeliverablesDrafts] = useState<Record<string, any[]>>({});
  const [newChecklistTask, setNewChecklistTask] = useState<Record<string, string>>({});
  const [newDeliverableName, setNewDeliverableName] = useState<Record<string, string>>({});
  const [newDeliverableCategory, setNewDeliverableCategory] = useState<Record<string, string>>({});
  const [newDeliverableAssetId, setNewDeliverableAssetId] = useState<Record<string, string>>({});
  const [lifecycleActionLoading, setLifecycleActionLoading] = useState<Record<string, boolean>>({});
  const [changeRequestNotes, setChangeRequestNotes] = useState<Record<string, string>>({});

  // Founder Operations states
  const [founderNotesMap, setFounderNotesMap] = useState<Record<string, string>>({});
  const [commDraftsMap, setCommDraftsMap] = useState<Record<string, string>>({});
  const [commHistoryMap, setCommHistoryMap] = useState<Record<string, any[]>>({});

  const [activeAuditProjId, setActiveAuditProjId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);

  useEffect(() => {
    const user = getAuthUser();
    if (user && user.role) {
      setCurrentUserRole(user.role);
    }
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${getAuthToken()}`,
          "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.users)) {
          setUsersList(data.users.map(normalizeUser));
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profiles for RBAC management:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === "users") {
      fetchUsers();
    }
  }, [isAuthenticated, activeTab]);

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken()}`,
          "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        alert(`User role successfully updated to '${newRole}'.`);
      } else {
        alert(data.error || "Failed to update user role. Super Admin privileges required.");
      }
    } catch (err) {
      console.error("Failed to change user role:", err);
      alert("Error communicating with servers.");
    }
  };

  const handleFetchAuditTrail = async (projId: string) => {
    setActiveAuditProjId(projId);
    setAuditLoading(true);
    try {
      const response = await fetch(`/api/projects/${projId}/audit-trail`, {
        headers: getAdminHeaders()
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAuditLogs(result.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch project audit trail:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchProjectExtra = async (id: string) => {
    if (extraProjectMap[id] || extraLoadingMap[id]) return;
    setExtraLoadingMap(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/projects/${id}/extra`, {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          setExtraProjectMap(prev => ({ ...prev, [id]: payload.data }));
        }
      }
    } catch (err) {
      console.warn("Retrieve project details error:", err);
    } finally {
      setExtraLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleModifyProject = async (id: string, updates: Partial<ProjectRecord>) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        await fetchProjects(); // Refresh lists live
      }
    } catch (err) {
      console.error("Failed to update project configurations inside admin console:", err);
    }
  };

  const handleTriggerLaunch = async (projId: string) => {
    setLifecycleActionLoading(prev => ({ ...prev, [projId]: true }));
    try {
      const res = await fetch(`/api/projects/${projId}/launch/start`, {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" })
      });
      if (res.ok) {
        await fetchProjects();
        await fetchProjectExtra(projId);
        alert("Automated launch sequence initiated! Servers deploying.");
      }
    } catch (err) {
      console.error("Launch error:", err);
    } finally {
      setLifecycleActionLoading(prev => ({ ...prev, [projId]: false }));
    }
  };

  const handleVerifyLaunch = async (projId: string) => {
    setLifecycleActionLoading(prev => ({ ...prev, [projId]: true }));
    try {
      const res = await fetch(`/api/projects/${projId}/launch/verify`, {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchProjects();
        await fetchProjectExtra(projId);
        alert(`Verification Result: ${data.data?.isReachable ? "Site is REACHABLE & ONLINE!" : "Site not reachable yet"} (Status: ${data.data?.launchStatus})`);
      } else {
        alert(`Verification note: ${data.message || "Failed"}`);
      }
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setLifecycleActionLoading(prev => ({ ...prev, [projId]: false }));
    }
  };

  const handleHealthCheck = async (projId: string) => {
    setLifecycleActionLoading(prev => ({ ...prev, [projId]: true }));
    try {
      const res = await fetch(`/api/projects/${projId}/health-check`, {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchProjects();
        await fetchProjectExtra(projId);
        alert(`Health Check: ${data.data?.healthy ? "HEALTHY (200 OK)" : "UNHEALTHY / TIMEOUT"} - HTTP Status: ${data.data?.statusCode || "N/A"}`);
      }
    } catch (err) {
      console.error("Health check error:", err);
    } finally {
      setLifecycleActionLoading(prev => ({ ...prev, [projId]: false }));
    }
  };

  const handleUpdateChangeRequestStatus = async (projId: string, requestId: string, status: string, adminNotes?: string) => {
    try {
      const res = await fetch(`/api/projects/${projId}/change-requests/${requestId}`, {
        method: "PATCH",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status, adminNotes })
      });
      if (res.ok) {
        await fetchProjectExtra(projId);
        alert(`Change Request status updated to ${status}!`);
      }
    } catch (err) {
      console.error("Failed to update change request:", err);
    }
  };

  const getQuoteTimeRemaining = (expiryStr?: string) => {
    if (!expiryStr) return "Expired";
    const diff = new Date(expiryStr).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h ${mins}m left`;
  };

  useEffect(() => {
    if (activeProjectId) {
      fetchProjectExtra(activeProjectId);
    }
  }, [activeProjectId]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setErrorValue(null);
    try {
      const response = await fetch("/api/projects", {
        headers: getAdminHeaders()
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data.projects)) {
        setProjects(data.projects.map(normalizeProject));
        setDbSource("Supabase Synced");
      }
    } catch (err: any) {
      console.error("Failed to query central Supabase tracking systems:", err);
      setErrorValue(err.message || "Failed to establish a cloud connection with the Supabase database instance.");
      setProjects([]);
      setDbSource("Offline");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        await fetchProjects();
      }
    } catch (err) {
      console.error("Failed to update status inside admin console:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-[90vh] flex items-center justify-center py-16 px-4">
        {/* Background ambient decorative spotlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/[0.02] blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full bg-white/[0.01] blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-md bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-foreground font-sans outline-none"
        >
          {/* Logo/Shield Header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Shield size={20} />
            </div>
            
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-amber-500">
              Administrative Gateway
            </span>
            <h1 className="font-display text-2xl font-black text-white mt-1.5 tracking-tight">
              Mission Control Log-in
            </h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">
              This terminal is reserved for internal administrators. Unauthorized entry is strictly logged.
            </p>
          </div>

          {/* Form */}
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              setLoginError(null);
              try {
                const response = await fetch("/api/admin/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ password: passwordInput })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                  sessionStorage.setItem("fuser_admin_authed", "true");
                  sessionStorage.setItem("fuser_admin_password", passwordInput);
                  setIsAuthenticated(true);
                } else {
                  setLoginError(data.error || "Access Key is incorrect. Please contact system administrators.");
                }
              } catch (err) {
                console.error("Authentication request failed:", err);
                setLoginError("Failed to communicate with authentication servers.");
              }
            }}
            className="mt-8 space-y-4"
          >
            <div>
              <label htmlFor="admin-passcode" className="block text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/80 mb-2">
                ACCESS KEY
              </label>
              <div className="relative">
                <input
                  id="admin-passcode"
                  type={showAdminPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••••••"
                  className={`w-full bg-[#050505] border rounded-xl px-4 py-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-1 transition-all font-mono placeholder-muted-foreground/20 h-11 ${
                    loginError 
                      ? 'border-red-500/40 focus:ring-red-500/30' 
                      : 'border-border/80 focus:ring-amber-500/40'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-amber-400 transition-colors focus:outline-none cursor-pointer"
                  tabIndex={-1}
                  aria-label={showAdminPassword ? "Hide password" : "Show password"}
                >
                  {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              <AnimatePresence mode="wait">
                {loginError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] text-red-400 font-mono mt-2"
                  >
                    ⚠️ {loginError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              className="w-full btn-pressure h-11 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 pointer-events-auto cursor-pointer"
            >
              Sign In to Dashboard <ArrowRight size={13} />
            </button>
          </form>

          {/* Escape path */}
          <div className="mt-6 pt-5 border-t border-neutral-900 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-muted-foreground hover:text-white transition-colors underline underline-offset-4 font-sans tracking-wide cursor-pointer"
            >
              Return to Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const formatPlanName = (id: string) => {
    switch (id) {
      case "foundation": return "⚡ Ignite (₹9,999)";
      case "growth": return "✦ Fusion (₹19,999)";
      case "dominance": return "⬢ Catalyst (₹39,999)";
      default: return id;
    }
  };

  const getFilteredProjects = () => {
    return projects.filter(proj => {
      const query = (searchQuery || "").toLowerCase();
      const matchesSearch = 
        (proj.businessName || "").toLowerCase().includes(query) ||
        (proj.clientName || "").toLowerCase().includes(query) ||
        (proj.email || "").toLowerCase().includes(query) ||
        (proj.whatsapp || "").toLowerCase().includes(query);

      const matchesPlan = selectedPlanFilter === "all" || proj.selectedPackage === selectedPlanFilter;
      return matchesSearch && matchesPlan;
    });
  };

  const filtered = getFilteredProjects();

  return (
    <div className="relative min-h-[90vh] py-14 sm:py-20 px-4 sm:px-6 md:px-8 text-foreground font-sans">
      {/* Background ambient decorative spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.015] blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-white/[0.01] blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl">
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-900 pb-10 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-eyebrow text-amber-500">CodeFuser Admin</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80">
                <Database size={10} className="text-amber-500" />
                <span>{dbSource}</span>
              </div>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-snug mt-2">
              Mission Control
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xl">
              Real-time synchronization grid monitoring incoming business diagnostic packets and starting CodeFuser Core client compilers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 items-center">
            <button
              onClick={() => {
                const nextState = !isEmergencyMode;
                setIsEmergencyMode(nextState);
                safeLocalStorage.setItem("fuser_emergency_mode", String(nextState));
                alert(nextState 
                  ? "⚡ EMERGENCY FOUNDER MODE ACTIVATED: All automated client notifications, payment reminders, and renewal alerts have been safely paused." 
                  : "✅ Emergency Mode Deactivated: Normal operations restored."
                );
              }}
              className={`px-3.5 py-2 text-xs font-mono font-bold uppercase rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isEmergencyMode
                  ? "bg-amber-500 text-black border-amber-400 font-extrabold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  : "bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-amber-500/40"
              }`}
            >
              🚨 {isEmergencyMode ? "EMERGENCY MODE ACTIVE" : "EMERGENCY MODE"}
            </button>

            <button
              onClick={fetchProjects}
              className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-border/40 text-xs font-semibold rounded-xl text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} /> Refresh Grid
            </button>
            <button
              onClick={() => navigate("/start-project")}
              className="px-4 py-2 bg-white text-black hover:bg-neutral-100 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              Submit Test <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Tab Selection Segments */}
        <div className="flex flex-wrap gap-2 mb-8 bg-neutral-950 p-1 rounded-xl border border-neutral-800 w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-white text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Command Center
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === "projects"
                ? "bg-white text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab("crm")}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === "crm"
                ? "bg-white text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Money
          </button>
          <button
            onClick={() => setActiveTab("hosting")}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === "hosting"
                ? "bg-white text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Operations
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === "coupons"
                ? "bg-white text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Marketing
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-white text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            System
          </button>
        </div>

        {/* EMERGENCY MODE BANNER */}
        {isEmergencyMode && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-sans leading-relaxed flex items-start gap-3 relative overflow-hidden">
            <span className="text-amber-400 font-black text-lg select-none">🚨</span>
            <div className="space-y-1">
              <strong className="text-amber-300 uppercase tracking-wider font-mono font-extrabold block">
                EMERGENCY FOUNDER MODE IS CURRENTLY ACTIVE
              </strong>
              <p className="text-neutral-200">
                All automated client notifications, scheduled emails, Razorpay payment reminders, and hosting renewal alerts are paused. Your business will fail gracefully with zero client disruption while you are away.
              </p>
            </div>
          </div>
        )}

        {/* DEVELOPER SETTINGS PAYMENT MODE CONTROLLER */}
        <div className="mb-6">
          <PaymentSimulationPanel
            projectId={projects.length > 0 ? projects[0].id : ""}
            getAuthToken={getAuthToken}
            onSuccess={() => fetchProjects()}
          />
        </div>

        {/* FOUNDER-ONLY COST & PROFIT VISIBILITY CARD */}
        <div className="mb-8 bg-[#050505] border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden font-sans space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-black text-sm">🔒</span>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                FOUNDER-ONLY FINANCIAL & PROFIT VISIBILITY
              </span>
            </div>
            <span className="text-[9px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
              Strictly Hidden From Clients
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Gross Revenue</div>
              <div className="text-base font-extrabold text-emerald-400 font-mono mt-1">
                ₹{projects.reduce((acc, p) => acc + (p.selectedPackage === "foundation" ? 9999 : p.selectedPackage === "growth" ? 19999 : p.selectedPackage === "dominance" ? 39999 : 0), 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Est. Infrastructure (Est.)</div>
              <div className="text-base font-extrabold text-amber-400 font-mono mt-1">
                ₹{(projects.length * 1200).toLocaleString("en-IN")}
              </div>
              <div className="text-[8.5px] font-mono text-neutral-500 mt-0.5">Domain + Hosting overhead</div>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Estimated Net Profit</div>
              <div className="text-base font-extrabold text-white font-mono mt-1">
                ₹{Math.max(0, projects.reduce((acc, p) => acc + (p.selectedPackage === "foundation" ? 9999 : p.selectedPackage === "growth" ? 19999 : p.selectedPackage === "dominance" ? 39999 : 0), 0) - (projects.length * 1200)).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Net Margin</div>
              <div className="text-base font-extrabold text-emerald-400 font-mono mt-1">
                {projects.length > 0 ? "~88%" : "100%"}
              </div>
              <div className="text-[8.5px] font-mono text-neutral-500 mt-0.5">High-margin software agency</div>
            </div>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8 mb-12">
            {/* Executive Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Total Active Projects</div>
                <div className="text-3xl font-extrabold text-white font-mono mt-2">{projects.length}</div>
                <div className="text-[11px] font-mono text-emerald-400 mt-1">✓ Synchronized with DB</div>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Paid Revenue Confirmed</div>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-2">
                  ₹{projects.filter(p => p.paymentStatus === "paid").reduce((acc, p) => acc + (p.selectedPackage === "foundation" ? 9999 : p.selectedPackage === "growth" ? 19999 : p.selectedPackage === "dominance" ? 39999 : 20000), 0).toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] font-mono text-neutral-400 mt-1">Razorpay Verified</div>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Pending Action / Review</div>
                <div className="text-3xl font-extrabold text-amber-400 font-mono mt-2">
                  {projects.filter(p => p.paymentStatus !== "paid").length}
                </div>
                <div className="text-[11px] font-mono text-neutral-400 mt-1">Awaiting checkout or review</div>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">System Health</div>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-2">100%</div>
                <div className="text-[11px] font-mono text-emerald-400 mt-1">All services operational</div>
              </div>
            </div>

            {/* Quick Operational Navigation Hub */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div 
                onClick={() => setActiveTab("projects")}
                className="bg-card hover:border-amber-500/40 border border-border/80 rounded-2xl p-6 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  📂
                </div>
                <h3 className="text-base font-bold text-white mb-1">Active Projects Hub</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Manage customer journeys, inspect 9-stage milestones, lock price quotes, and review deliverables.
                </p>
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Projects &rarr;
                </span>
              </div>

              <div 
                onClick={() => setActiveTab("coupons")}
                className="bg-card hover:border-amber-500/40 border border-border/80 rounded-2xl p-6 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  🎟️
                </div>
                <h3 className="text-base font-bold text-white mb-1">Coupons & Offers</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Control active marketing campaigns (FOUNDING50, FUSIONFREE), redemption limits, and plan eligibility.
                </p>
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Manage Offers &rarr;
                </span>
              </div>

              <div 
                onClick={() => setActiveTab("hosting")}
                className="bg-card hover:border-amber-500/40 border border-border/80 rounded-2xl p-6 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  🌐
                </div>
                <h3 className="text-base font-bold text-white mb-1">Hosting & Subscriptions</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Monitor trial periods, issue manual billing renewal invoices, and manage hosting status.
                </p>
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Subscriptions &rarr;
                </span>
              </div>
            </div>

            {/* Needs Attention Queue */}
            <div className="bg-card border border-border/80 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">⚠️ Needs Operator Attention</h3>
                <span className="text-xs font-mono text-neutral-400">{projects.filter(p => p.paymentStatus !== "paid").length} items pending</span>
              </div>
              {projects.filter(p => p.paymentStatus !== "paid").length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-emerald-400">
                  ✓ All active projects are paid and progressing normally. No urgent actions required.
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.filter(p => p.paymentStatus !== "paid").slice(0, 5).map(p => (
                    <div key={p.id} className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{p.businessName || "Unnamed Business"}</div>
                        <div className="text-xs text-neutral-400 font-mono mt-0.5">Package: {p.selectedPackage} • Email: {p.email}</div>
                      </div>
                      <button
                        onClick={() => { setActiveTab("projects"); setActiveProjectId(p.id); }}
                        className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono rounded-lg hover:bg-amber-500/20 transition-all cursor-pointer"
                      >
                        Inspect Project &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <>
            {/* Filters and Searches Panel */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative w-full sm:flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/45">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, brand, or contact details..."
              className="pl-9 pr-4 border border-border bg-[#050505] rounded-xl py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 w-full"
            />
          </div>

          {/* Filter by package */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <span className="text-xs font-mono text-muted-foreground/60 flex items-center gap-1">
              <Filter size={11} /> PLAN:
            </span>
            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="border border-border bg-[#050505] rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 min-w-[140px]"
            >
              <option value="all">All Packages</option>
              <option value="foundation">⚡ Ignite (₹9,999)</option>
              <option value="growth">✦ Fusion (₹19,999)</option>
              <option value="dominance">⬢ Catalyst (₹39,999)</option>
            </select>
          </div>
        </div>

        {errorValue && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs leading-relaxed flex items-start gap-2.5">
            <span className="text-red-400 font-bold block shrink-0">⚠️ Connection Failure:</span>
            <div>
              <span className="font-semibold block">{errorValue}</span>
              <span className="text-red-400/80 block mt-1 font-mono">Mission Control retrieves real-time records strictly from your cloud Supabase account.</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="h-8 w-8 rounded-full border-2 border-amber-500/25 border-t-amber-500 animate-spin" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest animate-pulse">
              Syncing client databases...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-14 sm:p-20 text-center flex flex-col items-center justify-center max-w-xl mx-auto">
            <div className="h-14 w-14 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 text-muted-foreground/70 mb-5">
              <Inbox size={22} className="stroke-[1.5]" />
            </div>
            <h3 className="font-display text-lg text-white font-semibold">
              No Client Projects Found
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {searchQuery || selectedPlanFilter !== "all" 
                ? "No client records correspond to your active filter or search query constraints."
                : "Submit the Start Project onboarding flow to create a real production-bound client project."
              }
            </p>
            {!searchQuery && selectedPlanFilter === "all" && (
              <button
                onClick={() => navigate("/start-project")}
                className="mt-6 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 text-xs font-bold text-white tracking-wide transition-all active:scale-95 cursor-pointer"
              >
                Launch Onboarding Setup
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 text-glow">
                Clients Waiting ({filtered.length})
              </span>
              <span className="text-[10px] text-muted-foreground/60 font-mono">
                PACKETS ENCRYPTED AND COMPILED
              </span>
            </div>

            <div className="grid gap-4">
              {filtered.map((proj) => {
                const isExpanded = activeProjectId === proj.id;
                const formattedDate = new Date(proj.timestamp).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div
                    key={proj.id}
                    className="relative rounded-2xl border border-border/80 bg-card overflow-hidden hover:border-amber-500/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300"
                  >
                    {/* Top status bar edge glow for pending clients */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />

                    {/* Main Row Info */}
                    <div
                      onClick={() => setActiveProjectId(isExpanded ? null : proj.id)}
                      className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-neutral-950 border border-border/60 flex items-center justify-center text-amber-500 font-bold text-xs shadow-inner">
                          {(proj.businessName || "CF").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="font-display font-semibold text-white text-base">
                              {proj.businessName}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 text-glow">
                              {proj.status}
                            </span>
                          </div>
                          
                          {/* Client details summary line */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground/80">
                            <span className="flex items-center gap-1">
                              <User size={11} className="text-muted-foreground/45" /> {proj.clientName}
                            </span>
                            <span className="text-muted-foreground/30">•</span>
                            <span className="font-mono text-[10px] uppercase text-platinum/90">
                              {proj.ownershipChoice === "full" ? "Direct Ownership" : "Managed Service"}
                            </span>
                            <span className="text-muted-foreground/30">•</span>
                            <span className="font-mono text-[10px] font-bold text-amber-500">
                              {String(proj.selectedPackage || "Standard").toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right metadata information block */}
                      <div className="flex md:flex-col items-end md:items-end justify-between border-t border-neutral-900/60 pt-4 md:pt-0 md:border-none gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground/60 flex items-center gap-1 bg-neutral-950/40 px-2 py-1 rounded">
                          <Clock size={10} /> {formattedDate}
                        </span>
                        <span className="text-[11px] text-amber-500 font-semibold font-mono tracking-wider flex items-center gap-1">
                          Specs Details <ChevronRight size={12} className={`transition-all ${isExpanded ? "rotate-3d rotate-90" : ""}`} />
                        </span>
                      </div>
                    </div>

                    {/* Expanded Spec Details Panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-neutral-900/80 bg-neutral-950/40 p-5 sm:p-6"
                        >
                          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 text-xs leading-relaxed">
                            {/* Contact Card details */}
                            <div className="space-y-3">
                              <h4 className="font-mono text-[10px] uppercase text-amber-500 font-semibold tracking-wider flex items-center gap-1.5">
                                <Shield size={11} /> Contact Identities
                              </h4>
                              <div className="space-y-2 text-muted-foreground">
                                <p className="flex items-center gap-2">
                                  <User size={13} className="text-muted-foreground/30 shrink-0" />
                                  <span className="text-foreground font-medium">{proj.clientName}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <Mail size={13} className="text-muted-foreground/30 shrink-0" />
                                  <a href={`mailto:${proj.email}`} className="hover:text-amber-500 hover:underline">{proj.email}</a>
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="text-muted-foreground/30 shrink-0 text-xs">💬</span>
                                  <span className="text-foreground font-mono font-bold">{proj.whatsapp}</span>
                                  <a
                                    href={getWhatsAppLink(`Hi ${proj.clientName}, I am reviewing your completed Start Project onboarding details for ${proj.businessName}!`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-[9px] font-mono text-amber-400 font-bold uppercase transition-all inline-block hover:-translate-y-0.5 active:translate-y-0"
                                  >
                                    Chat Prototyper
                                  </a>
                                </p>
                              </div>
                            </div>

                            {/* Diagnostic Specifics */}
                            <div className="space-y-3">
                              <h4 className="font-mono text-[10px] uppercase text-amber-500 font-semibold tracking-wider flex items-center gap-1.5">
                                <Layers size={11} /> Business Diagnostics
                              </h4>
                              <div className="space-y-2 text-muted-foreground">
                                <p>
                                  <span className="text-muted-foreground/45 block uppercase font-mono text-[9px]">Classification Segment</span>
                                  <span className="text-foreground font-semibold">
                                    {proj.industry === "other" ? proj.customIndustry : proj.industry}
                                  </span>
                                </p>
                                <p>
                                  <span className="text-muted-foreground/45 block uppercase font-mono text-[9px]">Designated Outcome Goal</span>
                                  <span className="text-foreground font-medium">
                                    {proj.goal === "other" ? proj.customGoal : proj.goal}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Digital Asset Readiness states */}
                            <div className="space-y-3">
                              <h4 className="font-mono text-[10px] uppercase text-amber-500 font-semibold tracking-wider flex items-center gap-1.5">
                                <Globe size={11} /> Digital Asset Readiness
                              </h4>
                              <div className="space-y-2 text-muted-foreground">
                                <p className="flex justify-between border-b border-border/20 pb-1.5">
                                  <span>Domain Registry:</span>
                                  <span className="font-bold text-foreground">
                                    {proj.hasDomain === "yes" ? "Registered ✓" : proj.hasDomain === "no" ? "Not Ready" : "Help Select"}
                                  </span>
                                </p>
                                <p className="flex justify-between border-b border-border/20 pb-1.5">
                                  <span>Logo & Design Assets:</span>
                                  <span className="font-bold text-foreground">
                                    {proj.hasLogo === "yes" ? "Provided ✓" : proj.hasLogo === "no" ? "Not Ready" : "Needs Custom Brand"}
                                  </span>
                                </p>
                                <p className="flex justify-between">
                                  <span>Text & Media Assets:</span>
                                  <span className="font-bold text-foreground">
                                    {proj.contentReady === "yes" ? "Copywriting Ready ✓" : proj.contentReady === "progress" ? "In Progress" : "CodeFuser to Write"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* NEW: Admin Override & Extended Workspace Modules (Part 3 & Part 7 Requirements) */}
                          <div className="mt-6 pt-5 border-t border-neutral-900/60 grid gap-6 md:grid-cols-2">
                            
                            {/* Override Settings Box */}
                            <div className="border border-neutral-900 rounded-2xl p-4 bg-black/35 space-y-4">
                              <span className="text-[9px] font-mono uppercase text-amber-500 font-extrabold tracking-widest block border-b border-neutral-900 pb-2">
                                ⚙️ Admin Override Configuration
                              </span>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] text-zinc-400">Core Package Tier</label>
                                  <select
                                    value={proj.selectedPackage}
                                    onChange={(e) => handleModifyProject(proj.id, { selectedPackage: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono cursor-pointer"
                                  >
                                    <option value="ignite">Ignite Package</option>
                                    <option value="fusion">Fusion Package</option>
                                    <option value="catalyst">Catalyst Package</option>
                                  </select>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="block text-[10px] text-zinc-400">Ownership framework Type</label>
                                  <select
                                    value={proj.ownershipChoice}
                                    onChange={(e) => handleModifyProject(proj.id, { ownershipChoice: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono cursor-pointer"
                                  >
                                    <option value="full">Direct Full License Ownership</option>
                                    <option value="subscription">Managed Service Agreement</option>
                                  </select>
                                </div>

                                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-900">
                                  {/* Payment Source Section */}
                                  <div className="space-y-3 bg-neutral-950/50 p-3 rounded-xl border border-neutral-900">
                                    <div className="flex items-center justify-between border-b border-neutral-900 pb-1.5">
                                      <span className="text-[10px] font-mono uppercase text-amber-500 font-bold">💳 Razorpay Source Verification</span>
                                      <span className="text-[9px] font-mono text-neutral-500 uppercase">Primary Source</span>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                      <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-400">Payment Status</label>
                                      <select
                                        value={proj.paymentStatus || "unpaid"}
                                        onChange={(e) => handleModifyProject(proj.id, { paymentStatus: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono cursor-pointer font-bold text-amber-500"
                                      >
                                        <option value="unpaid">Unpaid / Inactive</option>
                                        <option value="paid">Paid / Active</option>
                                      </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-500">Provider</label>
                                        <input
                                          type="text"
                                          defaultValue={proj.paymentProvider || ""}
                                          placeholder="e.g. razorpay"
                                          onBlur={(e) => handleModifyProject(proj.id, { paymentProvider: e.target.value })}
                                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-amber-500/40"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-500">Purchased Plan</label>
                                        <input
                                          type="text"
                                          defaultValue={proj.purchasedPlan || ""}
                                          placeholder="e.g. Ignite Package"
                                          onBlur={(e) => handleModifyProject(proj.id, { purchasedPlan: e.target.value })}
                                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-amber-500/40"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-500">Payment ID</label>
                                      <input
                                        type="text"
                                        defaultValue={proj.paymentId || ""}
                                        placeholder="e.g. pay_O1kH78X"
                                        onBlur={(e) => handleModifyProject(proj.id, { paymentId: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-amber-500/40"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-500">Order ID</label>
                                        <input
                                          type="text"
                                          defaultValue={proj.orderId || ""}
                                          placeholder="e.g. order_O1jS23B"
                                          onBlur={(e) => handleModifyProject(proj.id, { orderId: e.target.value })}
                                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-amber-500/40"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-500">Purchase Date</label>
                                        <input
                                          type="text"
                                          defaultValue={proj.purchaseDate || ""}
                                          placeholder="YYYY-MM-DD"
                                          onBlur={(e) => handleModifyProject(proj.id, { purchaseDate: e.target.value })}
                                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-amber-500/40"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Portal Access Mode & Override Section */}
                                  <div className="space-y-3 bg-neutral-950/50 p-3 rounded-xl border border-neutral-900 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-center justify-between border-b border-neutral-900 pb-1.5 mb-3">
                                        <span className="text-[10px] font-mono uppercase text-amber-500 font-bold">🛡️ Portal Access & Override</span>
                                        <span className="text-[9px] font-mono text-neutral-500 uppercase">Override Panel</span>
                                      </div>

                                      <div className="space-y-3">
                                        <div className="space-y-1.5">
                                          <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-400">Portal Access Source Mode</label>
                                          <select
                                            value={proj.portalAccessSource || "automatic"}
                                            onChange={(e) => handleModifyProject(proj.id, { portalAccessSource: e.target.value as any })}
                                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono cursor-pointer font-bold"
                                          >
                                            <option value="automatic">Automatic (Follows Payment)</option>
                                            <option value="manual">Manual Override (Force Set)</option>
                                          </select>
                                        </div>

                                        <div className="space-y-1.5">
                                          <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-400">Manual Override Value</label>
                                          <select
                                            value={proj.portalAccess ? "granted" : "denied"}
                                            onChange={(e) => handleModifyProject(proj.id, { portalAccess: e.target.value === "granted" })}
                                            className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono cursor-pointer font-bold ${
                                              proj.portalAccessSource === "manual" ? "opacity-100" : "opacity-40"
                                            }`}
                                          >
                                            <option value="denied">Force Suspended (Block Access)</option>
                                            <option value="granted">Force Granted (Approve Access)</option>
                                          </select>
                                          {proj.portalAccessSource !== "manual" && (
                                            <span className="text-[8px] font-mono text-zinc-500 italic mt-1 block">
                                              * Only active when Source Mode is set to Manual Override.
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Live Effective Status indicator */}
                                    {(() => {
                                      const isManual = proj.portalAccessSource === "manual";
                                      const effectiveAccess = proj.portalAccess === true;
                                      return (
                                        <div className={`p-2.5 rounded-lg border ${
                                          effectiveAccess 
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                            : "bg-red-500/10 border-red-500/20 text-red-400"
                                        } font-sans mt-3`}>
                                          <div className="flex items-center justify-between">
                                            <span className="text-[9px] uppercase font-mono tracking-wider opacity-60">Live Effective Access:</span>
                                            <span className="text-[9px] font-mono uppercase bg-black/40 px-1.5 py-0.5 rounded">
                                              {isManual ? "Manual Override" : "Automated Flow"}
                                            </span>
                                          </div>
                                          <div className="text-xs font-bold uppercase tracking-tight mt-1">
                                            {effectiveAccess ? "✓ AUTHORIZED & LIVE" : "✗ SUSPENDED / BLOCKED"}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>

                              <p className="text-[10px] text-zinc-500 leading-normal">
                                Modifying these client settings syncs to their workspace instantaneously. Keeps pricing plans aligned standardly.
                              </p>
                            </div>

                            {/* Client Registered Attachments Repository */}
                            <div className="border border-neutral-900 rounded-2xl p-4 bg-black/35 space-y-3">
                              <span className="text-[9px] font-mono uppercase text-[#cbd5e1] font-bold tracking-widest block border-b border-neutral-900 pb-2">
                                📁 Client Registered Attachments
                              </span>

                              {extraProjectMap[proj.id]?.assets && extraProjectMap[proj.id]?.assets.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto pr-1">
                                  {extraProjectMap[proj.id].assets.map((as: any) => (
                                    <div key={as.id} className="p-2.5 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-between gap-1.5">
                                      <div className="truncate shrink min-w-0">
                                        <span className="text-[11px] font-semibold text-white block truncate">{as.name}</span>
                                        <span className="text-[8px] font-mono text-neutral-500 block">
                                          Size: {Math.round(as.size / 1024)} KB • {as.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => handleDownloadAsset(proj.id, as.id, as.url)}
                                        className="p-1 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-[8.5px] font-mono font-bold text-amber-500 hover:text-white rounded-md transition-colors shrink-0 cursor-pointer"
                                      >
                                        Open
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 bg-neutral-950/20 rounded-xl flex flex-col justify-center items-center h-[90px]">
                                  <span className="text-[10px] font-mono text-neutral-500 block">Zero uploaded workspace files.</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Official Standards quotation Lock Engine (Part 7: Single Source of Truth Pricing Freezer) */}
                          <div className="mt-5 pt-5 border-t border-neutral-900/60">
                            <div className="border border-neutral-900 rounded-2xl p-5 bg-black/35 space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-900 pb-2">
                                <span className="text-[9px] font-mono uppercase text-amber-500 font-extrabold tracking-widest block">
                                  🔒 SECURE STANDARDS QUOTE LOCK FORM ENGINE
                                </span>
                                {extraProjectMap[proj.id]?.quote && (
                                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                                    Frozen Standard Rate Secure
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form 
                                  onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const data = new FormData(form);
                                    const pkg = String(data.get("packageName") || "Fusion Enterprise Spec");
                                    const pPrice = Number(data.get("price") || 19999);
                                    const pDisc = Number(data.get("discount") || 0);
                                    const desc = String(data.get("summary") || "Guaranteed custom specs package.");
                                    
                                    try {
                                      const response = await fetch(`/api/projects/${proj.id}/quote`, {
                                        method: "POST",
                                        headers: { 
                                          "Content-Type": "application/json",
                                          "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
                                        },
                                        body: JSON.stringify({
                                          packageName: pkg,
                                          price: pPrice,
                                          discount: pDisc,
                                          features: ["Premium Integrated UI Layout", "Custom Code Engine Map", "Unified DB Architecture"],
                                          summary: desc
                                        })
                                      });
                                      if (response.ok) {
                                        const body = await response.json();
                                        if (body.success && body.data) {
                                          setExtraProjectMap(prev => ({ ...prev, [proj.id]: body.data }));
                                          alert("Official standards quotation locked standardly. Frozen rate locks in client dashboard for 7 days.");
                                        }
                                      }
                                    } catch (err) {
                                      console.error("Encountered standard quotation locks failure:", err);
                                    }
                                  }}
                                  className="space-y-3"
                                >
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="block text-[8.5px] font-mono text-zinc-400 uppercase">Rate spec plan Name</label>
                                      <input 
                                        type="text" 
                                        name="packageName" 
                                        defaultValue={extraProjectMap[proj.id]?.quote?.packageName || String(proj.selectedPackage || "Standard").toUpperCase()} 
                                        className="w-full bg-neutral-900 border border-neutral-800 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500 text-white"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8.5px] font-mono text-zinc-400 uppercase">Lock price Rate (₹ INR)</label>
                                      <input 
                                        type="number" 
                                        name="price" 
                                        defaultValue={extraProjectMap[proj.id]?.quote?.price || (proj.selectedPackage.includes("ignite") || proj.selectedPackage.includes("foundation") ? 9999 : proj.selectedPackage.includes("catalyst") || proj.selectedPackage.includes("dominance") ? 39999 : 19999)} 
                                        className="w-full bg-neutral-900 border border-neutral-800 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500 text-white font-mono"
                                        required
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="block text-[8.5px] font-mono text-zinc-400 uppercase">Lock discount Rate (₹ INR)</label>
                                      <input 
                                        type="number" 
                                        name="discount" 
                                        defaultValue={extraProjectMap[proj.id]?.quote?.discount || 0} 
                                        className="w-full bg-neutral-900 border border-neutral-800 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500 text-white font-mono"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8.5px] font-mono text-zinc-400 uppercase">Terms Lock Description</label>
                                      <input 
                                        type="text" 
                                        name="summary" 
                                        defaultValue={extraProjectMap[proj.id]?.quote?.summary || "AI Recommended specifications locked."} 
                                        className="w-full bg-neutral-900 border border-neutral-800 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500 text-white"
                                        required
                                      />
                                    </div>
                                  </div>

                                  <button
                                    type="submit"
                                    className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-amber-500 hover:text-white border border-neutral-800 hover:border-amber-500/40 text-[9px] font-mono font-bold uppercase rounded-lg transition-all tracking-wider h-9 flex items-center justify-center cursor-pointer"
                                  >
                                    🔒 Create / Update Frozen Price Quote lock
                                  </button>
                                </form>

                                {/* Right Side: Current Frozen Quoting Diagnostics */}
                                <div className="bg-[#030303] border border-neutral-900 p-4 rounded-xl flex flex-col justify-between">
                                  {extraProjectMap[proj.id]?.quote ? (
                                    <div className="space-y-3 font-sans">
                                      <span className="block text-[8px] font-mono text-amber-500 uppercase tracking-wider font-extrabold">Active Fixed-Rate Specifications Record</span>
                                      
                                      <div className="space-y-2 text-xs">
                                        <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                                          <span className="text-neutral-500">Fixed Tier Name:</span>
                                          <span className="font-bold text-white uppercase font-mono text-[10.5px]">{extraProjectMap[proj.id].quote.packageName}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                                          <span className="text-neutral-500">Guaranteed Amount Rate:</span>
                                          <span className="font-extrabold text-amber-500 font-mono">₹{extraProjectMap[proj.id].quote.price.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                                          <span className="text-neutral-500">Secure locks validity:</span>
                                          <span className="font-extrabold text-neutral-300 font-mono">{getQuoteTimeRemaining(extraProjectMap[proj.id].quote.expiryDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-500">Discount Segment:</span>
                                          <span className="font-medium text-emerald-400 font-mono">₹{(extraProjectMap[proj.id].quote.discount || 0).toLocaleString("en-IN")}</span>
                                        </div>
                                      </div>

                                      <button
                                        onClick={async () => {
                                          if (!confirm("Are you sure you want to release this secure quotation lock? standard packages will resume.")) return;
                                          try {
                                            const res = await fetch(`/api/projects/${proj.id}/quote/reset`, { 
                                              method: "POST",
                                              headers: {
                                                "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
                                              }
                                            });
                                            if (res.ok) {
                                              const body = await res.json();
                                              if (body.success) {
                                                setExtraProjectMap(prev => ({ ...prev, [proj.id]: body.data }));
                                                alert("Quotation lock has been reset successfully.");
                                              }
                                            }
                                          } catch(err) {
                                            console.error("Failed to reset standard quotation:", err);
                                          }
                                        }}
                                        className="w-full py-1.5 bg-neutral-900 hover:bg-red-950/40 hover:text-red-300 hover:border-red-950 text-[9px] font-mono font-bold text-neutral-400 uppercase rounded-lg border border-neutral-850 h-8 transition-colors cursor-pointer"
                                      >
                                        Unlock Price quote
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-4 text-center space-y-2">
                                      <span className="text-amber-500 text-lg">⚠️</span>
                                      <span className="text-[11px] font-semibold text-zinc-300 block">No Active Price Quote Frozen</span>
                                      <span className="text-[9.5px] text-zinc-500 max-w-[200px] leading-normal">
                                        Client dashboard is displaying dynamic prices based on standard packages. Enter details on the left to lock.
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Phase 6: AI Proposal, Configurable Checklist & Deliverables Vault Management Panel */}
                          <div className="mt-6 bg-[#030303] border border-neutral-900 rounded-xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-900 pb-3 gap-2">
                              <div>
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
                                  📋 Phase 6 Core Deliverables Manager
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                                  Manage strategic AI proposals, launch checklists, and deliverables vault items.
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-900">
                                {([ "proposal", "checklist", "deliverables", "notes", "comms", "progress", "lifecycle", "requests", "overrides" ] as const).map((tab) => (
                                  <button
                                    key={tab}
                                    onClick={() => setAdminSubTabs(prev => ({ ...prev, [proj.id]: tab }))}
                                    className={`px-2.5 py-1 rounded-md text-[9.5px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                                      (adminSubTabs[proj.id] || "proposal") === tab
                                        ? "bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20"
                                        : "text-zinc-400 hover:text-white border border-transparent"
                                    }`}
                                  >
                                    {tab === "proposal" ? "📑 Proposal" :
                                     tab === "checklist" ? "📋 Checklist" :
                                     tab === "deliverables" ? "🔒 Vault" :
                                     tab === "notes" ? "📝 Private Notes" :
                                     tab === "comms" ? "💬 AI Comms" :
                                     tab === "progress" ? "⏱️ Stage Progress" :
                                     tab === "lifecycle" ? "🚀 Launch & Health" :
                                     tab === "requests" ? "🛠️ Change Requests" : "⚙️ Founder Overrides"}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* TAB CONTENT: PROPOSAL */}
                            {(adminSubTabs[proj.id] || "proposal") === "proposal" && (
                              <div className="space-y-4 font-sans">
                                {proposalLoading[proj.id] ? (
                                  <div className="flex flex-col items-center justify-center py-8 space-y-2">
                                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Running AI Project Synthesizer...</span>
                                  </div>
                                ) : !extraProjectMap[proj.id]?.quote?.proposal ? (
                                  <div className="flex flex-col items-center justify-center py-8 text-center bg-neutral-950/40 rounded-xl border border-neutral-900 border-dashed p-4 space-y-3">
                                    <div className="text-xl">✨</div>
                                    <div>
                                      <span className="text-[11px] font-mono font-bold text-zinc-300 block uppercase tracking-wide">Project proposal baseline not yet compiled</span>
                                      <span className="text-[9.5px] text-zinc-500 max-w-sm leading-normal mt-1 block">
                                        Administrators can manually initiate our consulting-grade AI proposal generator using the custom business diagnostics audit.
                                      </span>
                                    </div>
                                    <button
                                      onClick={async () => {
                                        setProposalLoading(prev => ({ ...prev, [proj.id]: true }));
                                        try {
                                          const res = await fetch(`/api/projects/${proj.id}/proposal/generate`, {
                                            method: "POST",
                                            headers: {
                                              "Authorization": `Bearer ${getAuthToken()}`,
                                              "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
                                            }
                                          });
                                          const body = await res.json();
                                          if (body.success) {
                                            setExtraProjectMap(prev => ({ ...prev, [proj.id]: body.data }));
                                            setProposalEdits(prev => ({ ...prev, [proj.id]: body.data.quote?.proposal?.content || "" }));
                                            alert("AI Proposal baseline compiled successfully!");
                                          } else {
                                            alert(body.message || "Failed to generate proposal");
                                          }
                                        } catch (err) {
                                          console.error(err);
                                          alert("Failed to connect to backend server.");
                                        } finally {
                                          setProposalLoading(prev => ({ ...prev, [proj.id]: false }));
                                        }
                                      }}
                                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all"
                                    >
                                      ✨ Initiate AI Proposal baseline
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-900 text-[10px] font-mono uppercase tracking-wide">
                                      <div className="flex items-center gap-2">
                                        <span className="text-zinc-500">Proposal State:</span>
                                        <span className={`font-bold px-2 py-0.5 rounded ${
                                          extraProjectMap[proj.id].quote.proposal.status === "sent"
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : extraProjectMap[proj.id].quote.proposal.status === "approved"
                                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                            : "bg-zinc-800 text-zinc-300"
                                        }`}>
                                          {extraProjectMap[proj.id].quote.proposal.status}
                                        </span>
                                      </div>
                                      <span className="text-zinc-500 text-[9px]">
                                        Generated: {new Date(extraProjectMap[proj.id].quote.proposal.timestamp).toLocaleDateString()}
                                      </span>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="block text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider">
                                        Edit Strategic Proposal Baseline (Markdown Allowed)
                                      </label>
                                      <textarea
                                        value={proposalEdits[proj.id] !== undefined ? proposalEdits[proj.id] : extraProjectMap[proj.id].quote.proposal.content || ""}
                                        onChange={(e) => setProposalEdits(prev => ({ ...prev, [proj.id]: e.target.value }))}
                                        rows={10}
                                        className="w-full bg-neutral-950 border border-neutral-900 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500 text-zinc-200 font-mono leading-relaxed"
                                      />
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-1">
                                      <button
                                        onClick={async () => {
                                          const textToSave = proposalEdits[proj.id] !== undefined ? proposalEdits[proj.id] : extraProjectMap[proj.id].quote.proposal.content;
                                          try {
                                            const res = await fetch(`/api/projects/${proj.id}/proposal/save`, {
                                              method: "POST",
                                              headers: {
                                                "Content-Type": "application/json",
                                                "Authorization": `Bearer ${getAuthToken()}`,
                                                "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
                                              },
                                              body: JSON.stringify({ content: textToSave })
                                            });
                                            const body = await res.json();
                                            if (body.success) {
                                              setExtraProjectMap(prev => ({ ...prev, [proj.id]: body.data }));
                                              alert("Manual edits synchronized and locked inside database!");
                                            }
                                          } catch (err) {
                                            console.error(err);
                                          }
                                        }}
                                        className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-900 text-zinc-300 hover:text-white border border-neutral-850 hover:border-amber-500/20 text-[9px] font-mono font-bold uppercase rounded-md transition-all cursor-pointer"
                                      >
                                        💾 Save Manual Edits
                                      </button>

                                      <button
                                        onClick={async () => {
                                          const hasEdits = proposalEdits[proj.id] !== undefined && proposalEdits[proj.id] !== extraProjectMap[proj.id].quote.proposal.content;
                                          if (hasEdits || extraProjectMap[proj.id].quote.proposal.manualEdits) {
                                            if (!confirm("⚠️ WARNING: Regenerating will completely overwrite your manual edits. Are you sure you want to proceed?")) {
                                              return;
                                            }
                                          }
                                          setProposalLoading(prev => ({ ...prev, [proj.id]: true }));
                                          try {
                                            const res = await fetch(`/api/projects/${proj.id}/proposal/generate?force=true`, {
                                              method: "POST",
                                              headers: {
                                                "Authorization": `Bearer ${getAuthToken()}`,
                                                "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
                                              }
                                            });
                                            const body = await res.json();
                                            if (body.success) {
                                              setExtraProjectMap(prev => ({ ...prev, [proj.id]: body.data }));
                                              setProposalEdits(prev => ({ ...prev, [proj.id]: body.data.quote?.proposal?.content || "" }));
                                              alert("AI proposal regenerated successfully.");
                                            }
                                          } catch (err) {
                                            console.error(err);
                                          } finally {
                                            setProposalLoading(prev => ({ ...prev, [proj.id]: false }));
                                          }
                                        }}
                                        className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-900 text-amber-500/80 hover:text-amber-400 border border-neutral-850 hover:border-amber-500/20 text-[9px] font-mono font-bold uppercase rounded-md transition-all cursor-pointer"
                                      >
                                        🔄 Regenerate AI Proposal
                                      </button>

                                      {extraProjectMap[proj.id].quote.proposal.status === "draft" && (
                                        <button
                                          onClick={async () => {
                                            try {
                                              const res = await fetch(`/api/projects/${proj.id}/proposal/approve`, {
                                                method: "POST",
                                                headers: {
                                                  "Authorization": `Bearer ${getAuthToken()}`,
                                                  "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
                                                }
                                              });
                                              const body = await res.json();
                                              if (body.success) {
                                                setExtraProjectMap(prev => ({ ...prev, [proj.id]: body.data }));
                                                alert("Strategic blueprint approved!");
                                              }
                                            } catch (err) {
                                              console.error(err);
                                            }
                                          }}
                                          className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-900 text-emerald-500 hover:text-emerald-400 border border-neutral-850 hover:border-emerald-500/20 text-[9px] font-mono font-bold uppercase rounded-md transition-all cursor-pointer"
                                        >
                                          ✅ Approve Blueprint
                                        </button>
                                      )}

                                      {extraProjectMap[proj.id].quote.proposal.status !== "sent" && (
                                        <button
                                          onClick={async () => {
                                            try {
                                              const res = await fetch(`/api/projects/${proj.id}/proposal/send`, {
                                                method: "POST",
                                                headers: {
                                                  "Authorization": `Bearer ${getAuthToken()}`,
                                                  "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
                                                }
                                              });
                                              const body = await res.json();
                                              if (body.success) {
                                                setExtraProjectMap(prev => ({ ...prev, [proj.id]: body.data }));
                                                alert("Strategic blueprint published to Client Portal successfully!");
                                              }
                                            } catch (err) {
                                              console.error(err);
                                            }
                                          }}
                                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-[9px] font-mono font-bold uppercase rounded-md transition-all cursor-pointer ml-auto"
                                        >
                                          🚀 Publish to Client Hub
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* TAB CONTENT: CHECKLIST */}
                            {(adminSubTabs[proj.id] || "proposal") === "checklist" && (
                              <div className="space-y-4 font-sans">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider">
                                    Project Launch Milestones Configurator
                                  </span>
                                  <button
                                    onClick={() => {
                                      const presets = [
                                        { id: `TASK-1-${Date.now()}`, task: "Configure Custom Domain DNS records & SSL mapping", completed: false },
                                        { id: `TASK-2-${Date.now()}`, task: "Run PostgreSQL migrations & optimize core schema tables", completed: false },
                                        { id: `TASK-3-${Date.now()}`, task: "Establish unified design token layouts & verified color specs", completed: false },
                                        { id: `TASK-4-${Date.now()}`, task: "Audit mobile UX performance checklist and core web vitals", completed: false },
                                        { id: `TASK-5-${Date.now()}`, task: "Complete secure code bundle compilation and CDN deployment", completed: false }
                                      ];
                                      setChecklistDrafts(prev => ({ ...prev, [proj.id]: presets }));
                                    }}
                                    className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 text-neutral-300 hover:text-white text-[8px] font-mono uppercase tracking-wider rounded-md cursor-pointer transition-colors"
                                  >
                                    📋 Load launch presets
                                  </button>
                                </div>

                                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-3.5 space-y-3">
                                  {/* Item List */}
                                  {(() => {
                                    const currentList = checklistDrafts[proj.id] !== undefined
                                      ? checklistDrafts[proj.id]
                                      : extraProjectMap[proj.id]?.quote?.checklist || [];

                                    if (currentList.length === 0) {
                                      return (
                                        <p className="text-[10px] text-zinc-500 text-center py-4 italic font-mono">
                                          No custom checklist loaded yet. Click 'Load launch presets' or add custom tasks below.
                                        </p>
                                      );
                                    }

                                    return (
                                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                        {currentList.map((item: any, idx: number) => (
                                          <div key={item.id || idx} className="flex items-center justify-between gap-3 bg-[#050505] border border-neutral-900 p-2 rounded-lg">
                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                              <input
                                                type="checkbox"
                                                checked={item.completed}
                                                onChange={(e) => {
                                                  const newList = currentList.map((c: any) =>
                                                    c.id === item.id ? { ...c, completed: e.target.checked } : c
                                                  );
                                                  setChecklistDrafts(prev => ({ ...prev, [proj.id]: newList }));
                                                }}
                                                className="rounded border-neutral-800 bg-neutral-950 text-amber-500 focus:ring-amber-500/30 w-3.5 h-3.5 cursor-pointer"
                                              />
                                              <span className={`text-[10.5px] leading-relaxed truncate text-zinc-200 ${item.completed ? "line-through text-zinc-500" : ""}`}>
                                                {item.task}
                                              </span>
                                            </div>
                                            <button
                                              onClick={() => {
                                                const newList = currentList.filter((c: any) => c.id !== item.id);
                                                setChecklistDrafts(prev => ({ ...prev, [proj.id]: newList }));
                                              }}
                                              className="text-[9px] font-bold text-red-400/80 hover:text-red-400 hover:bg-red-950/10 p-1 rounded transition-colors cursor-pointer"
                                            >
                                              ❌
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}

                                  {/* Add Task Input Block */}
                                  <div className="flex gap-2 border-t border-neutral-900/60 pt-3">
                                    <input
                                      type="text"
                                      placeholder="Enter custom milestone checklist task..."
                                      value={newChecklistTask[proj.id] || ""}
                                      onChange={(e) => setNewChecklistTask(prev => ({ ...prev, [proj.id]: e.target.value }))}
                                      className="flex-1 bg-neutral-900 border border-neutral-850 text-[10.5px] px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500 text-white"
                                    />
                                    <button
                                      onClick={() => {
                                        const taskText = newChecklistTask[proj.id]?.trim();
                                        if (!taskText) return;

                                        const currentList = checklistDrafts[proj.id] !== undefined
                                          ? checklistDrafts[proj.id]
                                          : extraProjectMap[proj.id]?.quote?.checklist || [];

                                        const newItem = {
                                          id: `TASK-${Date.now()}`,
                                          task: taskText,
                                          completed: false
                                        };

                                        setChecklistDrafts(prev => ({ ...prev, [proj.id]: [...currentList, newItem] }));
                                        setNewChecklistTask(prev => ({ ...prev, [proj.id]: "" }));
                                      }}
                                      className="px-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 text-[9px] font-mono font-bold uppercase rounded text-amber-500 transition-all cursor-pointer shrink-0"
                                    >
                                      ➕ Add Task
                                    </button>
                                  </div>
                                </div>

                                <button
                                  onClick={async () => {
                                    const listToSave = checklistDrafts[proj.id] !== undefined
                                      ? checklistDrafts[proj.id]
                                      : extraProjectMap[proj.id]?.quote?.checklist || [];

                                    try {
                                      const res = await fetch(`/api/projects/${proj.id}/checklist/save`, {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          "Authorization": `Bearer ${getAuthToken()}`,
                                          "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
                                        },
                                        body: JSON.stringify({ checklist: listToSave })
                                      });
                                      const body = await res.json();
                                      if (body.success) {
                                        setExtraProjectMap(prev => ({ ...prev, [proj.id]: body.data }));
                                        alert("Launch checklist configuration synchronized successfully!");
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-amber-500 hover:text-white border border-neutral-800 hover:border-amber-500/40 text-[9px] font-mono font-bold uppercase rounded-lg transition-all tracking-wider flex items-center justify-center cursor-pointer"
                                >
                                  💾 Lock Checklist Configuration
                                </button>
                              </div>
                            )}

                            {/* TAB CONTENT: DELIVERABLES VAULT */}
                            {(adminSubTabs[proj.id] || "proposal") === "deliverables" && (
                              <div className="space-y-4 font-sans">
                                <span className="block text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider">
                                  Secure Deliverables Vault Configurator
                                </span>

                                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 space-y-4">
                                  {/* Add Deliverable Form */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-neutral-900/60">
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-mono text-zinc-400 uppercase">Deliverable Category</label>
                                      <select
                                        value={newDeliverableCategory[proj.id] || "Brand Assets"}
                                        onChange={(e) => setNewDeliverableCategory(prev => ({ ...prev, [proj.id]: e.target.value }))}
                                        className="w-full bg-[#050505] border border-neutral-900 text-xs px-2 py-1.5 rounded focus:outline-none text-zinc-300 font-mono"
                                      >
                                        <option value="Brand Assets">Brand Assets</option>
                                        <option value="Code Bundle">Code Bundle</option>
                                        <option value="Database Blueprint">Database Blueprint</option>
                                        <option value="UI Layouts">UI Layouts</option>
                                      </select>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-mono text-zinc-400 uppercase">Select Uploaded Asset File</label>
                                      <select
                                        value={newDeliverableAssetId[proj.id] || ""}
                                        onChange={(e) => {
                                          const assetId = e.target.value;
                                          setNewDeliverableAssetId(prev => ({ ...prev, [proj.id]: assetId }));
                                          // Auto-fill name if empty
                                          const asset = extraProjectMap[proj.id]?.assets?.find((a: any) => a.id === assetId);
                                          if (asset && !newDeliverableName[proj.id]) {
                                            setNewDeliverableName(prev => ({ ...prev, [proj.id]: asset.name }));
                                          }
                                        }}
                                        className="w-full bg-[#050505] border border-neutral-900 text-xs px-2 py-1.5 rounded focus:outline-none text-zinc-300 font-mono"
                                      >
                                        <option value="">-- Choose project asset --</option>
                                        {extraProjectMap[proj.id]?.assets?.map((asset: any) => (
                                          <option key={asset.id} value={asset.id}>
                                            {asset.name} ({(asset.size / 1024).toFixed(1)} KB)
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="space-y-1 md:col-span-2 flex gap-2">
                                      <div className="flex-1 space-y-1">
                                        <label className="block text-[8px] font-mono text-zinc-400 uppercase">Vault Deliverable Display Name</label>
                                        <input
                                          type="text"
                                          placeholder="e.g. Master Logo Files, Production Build .ZIP..."
                                          value={newDeliverableName[proj.id] || ""}
                                          onChange={(e) => setNewDeliverableName(prev => ({ ...prev, [proj.id]: e.target.value }))}
                                          className="w-full bg-[#050505] border border-neutral-900 text-xs px-3 py-1.5 rounded focus:outline-none text-white font-sans"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const name = newDeliverableName[proj.id]?.trim();
                                          const category = newDeliverableCategory[proj.id] || "Brand Assets";
                                          const assetId = newDeliverableAssetId[proj.id];

                                          if (!name || !assetId) {
                                            alert("Please choose an uploaded asset and specify a display name.");
                                            return;
                                          }

                                          const asset = extraProjectMap[proj.id]?.assets?.find((a: any) => a.id === assetId);
                                          if (!asset) return;

                                          const currentList = deliverablesDrafts[proj.id] !== undefined
                                            ? deliverablesDrafts[proj.id]
                                            : extraProjectMap[proj.id]?.quote?.deliverables || [];

                                          const newItem = {
                                            id: `DELIV-${Date.now()}`,
                                            name,
                                            category,
                                            url: asset.url,
                                            size: asset.size,
                                            timestamp: new Date().toISOString()
                                          };

                                          setDeliverablesDrafts(prev => ({ ...prev, [proj.id]: [...currentList, newItem] }));
                                          setNewDeliverableName(prev => ({ ...prev, [proj.id]: "" }));
                                          setNewDeliverableAssetId(prev => ({ ...prev, [proj.id]: "" }));
                                        }}
                                        className="h-9 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 text-[9px] font-mono font-bold uppercase rounded px-3.5 text-amber-500 transition-all cursor-pointer self-end shrink-0"
                                      >
                                        ➕ Assign
                                      </button>
                                    </div>
                                  </div>

                                  {/* Current Vault Allocations */}
                                  <div className="space-y-3">
                                    <span className="block text-[8px] font-mono text-zinc-400 uppercase tracking-widest font-extrabold">
                                      Current Vault Deliverables
                                    </span>

                                    {(() => {
                                      const currentList = deliverablesDrafts[proj.id] !== undefined
                                        ? deliverablesDrafts[proj.id]
                                        : extraProjectMap[proj.id]?.quote?.deliverables || [];

                                      if (currentList.length === 0) {
                                        return (
                                          <p className="text-[10px] text-zinc-500 text-center py-2 italic font-mono">
                                            No deliverables assigned to this vault yet. Use the form above to lock assets.
                                          </p>
                                        );
                                      }

                                      // Group by Category
                                      const categories = ["Brand Assets", "Code Bundle", "Database Blueprint", "UI Layouts"];

                                      return (
                                        <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                                          {categories.map((cat) => {
                                            const itemsInCat = currentList.filter((item: any) => item.category === cat);
                                            if (itemsInCat.length === 0) return null;

                                            return (
                                              <div key={cat} className="space-y-1.5">
                                                <span className="block text-[8.5px] font-mono text-amber-500/80 uppercase tracking-wide font-extrabold">
                                                  🏷️ {cat} ({itemsInCat.length})
                                                </span>
                                                <div className="space-y-1.5">
                                                  {itemsInCat.map((item: any) => (
                                                    <div key={item.id} className="flex justify-between items-center bg-[#050505] border border-neutral-900 px-2.5 py-1.5 rounded-lg text-xs">
                                                      <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold text-zinc-200 truncate">{item.name}</span>
                                                        <span className="text-[8.5px] text-zinc-500 font-mono mt-0.5">
                                                          {(item.size / 1024).toFixed(1)} KB • Verified
                                                        </span>
                                                      </div>
                                                      <button
                                                        onClick={() => {
                                                          const newList = currentList.filter((c: any) => c.id !== item.id);
                                                          setDeliverablesDrafts(prev => ({ ...prev, [proj.id]: newList }));
                                                        }}
                                                        className="text-[9px] font-bold text-red-400/80 hover:text-red-400 hover:bg-red-950/10 p-1 rounded transition-colors cursor-pointer"
                                                      >
                                                        ❌
                                                      </button>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>

                                <button
                                  onClick={async () => {
                                    const listToSave = deliverablesDrafts[proj.id] !== undefined
                                      ? deliverablesDrafts[proj.id]
                                      : extraProjectMap[proj.id]?.quote?.deliverables || [];

                                    try {
                                      const res = await fetch(`/api/projects/${proj.id}/deliverables/save`, {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          "Authorization": `Bearer ${getAuthToken()}`,
                                          "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
                                        },
                                        body: JSON.stringify({ deliverables: listToSave })
                                      });
                                      const body = await res.json();
                                      if (body.success) {
                                        setExtraProjectMap(prev => ({ ...prev, [proj.id]: body.data }));
                                        alert("Deliverables vault successfully saved and encrypted!");
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-amber-500 hover:text-white border border-neutral-800 hover:border-amber-500/40 text-[9px] font-mono font-bold uppercase rounded-lg transition-all tracking-wider flex items-center justify-center cursor-pointer"
                                >
                                  🔒 Secure and Save Deliverables Vault
                                </button>
                              </div>
                            )}

                            {/* TAB CONTENT: PRIVATE FOUNDER NOTES */}
                            {(adminSubTabs[proj.id] === "notes") && (
                              <div className="space-y-4 font-sans">
                                <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg text-amber-400">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                                    🔒 Private Founder Notes (Strictly Hidden From Client)
                                  </span>
                                  <span className="text-[8px] font-mono uppercase bg-black/40 px-1.5 py-0.5 rounded text-amber-300">
                                    Founder Second Brain
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex flex-wrap gap-1.5">
                                    {["High Priority Client", "Tamil Language Support", "Requested Dark Theme", "Returning Client", "Custom Feature Requirements"].map((tag) => (
                                      <button
                                        key={tag}
                                        onClick={() => {
                                          const currentNotes = founderNotesMap[proj.id] || safeLocalStorage.getItem(`fuser_founder_notes_${proj.id}`) || "";
                                          const updatedNotes = currentNotes ? `${currentNotes}\n• [${tag}]` : `• [${tag}]`;
                                          setFounderNotesMap(prev => ({ ...prev, [proj.id]: updatedNotes }));
                                          safeLocalStorage.setItem(`fuser_founder_notes_${proj.id}`, updatedNotes);
                                        }}
                                        className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/30 text-[9px] font-mono text-neutral-300 hover:text-amber-400 rounded transition-all cursor-pointer"
                                      >
                                        + {tag}
                                      </button>
                                    ))}
                                  </div>

                                  <textarea
                                    value={founderNotesMap[proj.id] !== undefined ? founderNotesMap[proj.id] : (safeLocalStorage.getItem(`fuser_founder_notes_${proj.id}`) || "")}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFounderNotesMap(prev => ({ ...prev, [proj.id]: val }));
                                      safeLocalStorage.setItem(`fuser_founder_notes_${proj.id}`, val);
                                    }}
                                    placeholder="Write private founder observations, custom client requests, Tamil language requirements, upsell notes..."
                                    rows={6}
                                    className="w-full bg-neutral-950 border border-neutral-900 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-200 font-sans leading-relaxed"
                                  />
                                </div>
                                <span className="text-[9px] font-mono text-neutral-500 block">
                                  * Notes automatically sync to your browser memory in real time.
                                </span>
                              </div>
                            )}

                            {/* TAB CONTENT: AI COMMUNICATION CENTER & LOG */}
                            {(adminSubTabs[proj.id] === "comms") && (
                              <div className="space-y-4 font-sans">
                                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 space-y-3">
                                  <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                                      🤖 AI Communication Draft Generator
                                    </span>
                                    <span className="text-[8px] font-mono uppercase bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                                      Founder Control Active
                                    </span>
                                  </div>

                                  {/* Draft Buttons */}
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() => {
                                        const draft = `Hello ${proj.clientName}! Welcome to CodeFuser. Your website project for ${proj.businessName} (${(proj.selectedPackage || "Standard").toUpperCase()} Package) is now officially active. You can track live updates in your CodeFuser Portal!`;
                                        setCommDraftsMap(prev => ({ ...prev, [proj.id]: draft }));
                                      }}
                                      className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[9.5px] font-mono font-bold text-amber-400 rounded transition-all cursor-pointer"
                                    >
                                      ✨ Welcome Message
                                    </button>
                                    <button
                                      onClick={() => {
                                        const draft = `Hi ${proj.clientName}, quick update on ${proj.businessName}: Our team has started working on your custom layout design. Check your portal for live milestone updates!`;
                                        setCommDraftsMap(prev => ({ ...prev, [proj.id]: draft }));
                                      }}
                                      className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[9.5px] font-mono font-bold text-amber-400 rounded transition-all cursor-pointer"
                                    >
                                      ✨ Progress Update
                                    </button>
                                    <button
                                      onClick={() => {
                                        const draft = `Hello ${proj.clientName}! Your website preview for ${proj.businessName} is ready for review. Please log into your CodeFuser Portal to check it out!`;
                                        setCommDraftsMap(prev => ({ ...prev, [proj.id]: draft }));
                                      }}
                                      className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[9.5px] font-mono font-bold text-amber-400 rounded transition-all cursor-pointer"
                                    >
                                      ✨ Review Request
                                    </button>
                                    <button
                                      onClick={() => {
                                        const draft = `Hi ${proj.clientName}, this is a gentle reminder regarding the milestone payment for ${proj.businessName}. You can securely complete payment via Razorpay in your portal.`;
                                        setCommDraftsMap(prev => ({ ...prev, [proj.id]: draft }));
                                      }}
                                      className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[9.5px] font-mono font-bold text-amber-400 rounded transition-all cursor-pointer"
                                    >
                                      ✨ Payment Reminder
                                    </button>
                                  </div>

                                  {/* Text Area */}
                                  <textarea
                                    value={commDraftsMap[proj.id] || ""}
                                    onChange={(e) => setCommDraftsMap(prev => ({ ...prev, [proj.id]: e.target.value }))}
                                    placeholder="Click any AI draft button above or write a custom message to review before sending..."
                                    rows={4}
                                    className="w-full bg-black border border-neutral-900 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-200 font-sans leading-relaxed"
                                  />

                                  {/* Action buttons */}
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    <button
                                      onClick={() => {
                                        const msg = commDraftsMap[proj.id] || "";
                                        if (!msg) return alert("Write or generate a message first!");
                                        const phone = proj.whatsapp.replace(/[^0-9]/g, "");
                                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                                        const history = commHistoryMap[proj.id] || JSON.parse(safeLocalStorage.getItem(`fuser_comm_history_${proj.id}`) || "[]");
                                        const newEntry = { id: Date.now(), type: "whatsapp", message: msg, timestamp: new Date().toISOString(), status: "Sent via WhatsApp" };
                                        const updatedHistory = [newEntry, ...history];
                                        setCommHistoryMap(prev => ({ ...prev, [proj.id]: updatedHistory }));
                                        safeLocalStorage.setItem(`fuser_comm_history_${proj.id}`, JSON.stringify(updatedHistory));
                                      }}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[9.5px] font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      📲 Send via WhatsApp
                                    </button>
                                    <button
                                      onClick={() => {
                                        const msg = commDraftsMap[proj.id] || "";
                                        if (!msg) return alert("Write or generate a message first!");
                                        window.open(`mailto:${proj.email}?subject=${encodeURIComponent(`Update on ${proj.businessName} Website`)}&body=${encodeURIComponent(msg)}`, "_blank");
                                        const history = commHistoryMap[proj.id] || JSON.parse(safeLocalStorage.getItem(`fuser_comm_history_${proj.id}`) || "[]");
                                        const newEntry = { id: Date.now(), type: "email", message: msg, timestamp: new Date().toISOString(), status: "Sent via Email" };
                                        const updatedHistory = [newEntry, ...history];
                                        setCommHistoryMap(prev => ({ ...prev, [proj.id]: updatedHistory }));
                                        safeLocalStorage.setItem(`fuser_comm_history_${proj.id}`, JSON.stringify(updatedHistory));
                                      }}
                                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-[9.5px] font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      ✉️ Send via Email
                                    </button>
                                  </div>
                                </div>

                                {/* Communication History Log */}
                                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 space-y-2">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block border-b border-neutral-900 pb-2">
                                    📜 Communication History Log ({ (commHistoryMap[proj.id] || JSON.parse(safeLocalStorage.getItem(`fuser_comm_history_${proj.id}`) || "[]")).length })
                                  </span>

                                  {(() => {
                                    const history = commHistoryMap[proj.id] || JSON.parse(safeLocalStorage.getItem(`fuser_comm_history_${proj.id}`) || "[]");
                                    if (history.length === 0) {
                                      return (
                                        <p className="text-[10px] text-neutral-500 italic py-2">No messages sent yet. Use the generator above to communicate with client.</p>
                                      );
                                    }
                                    return (
                                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                                        {history.map((h: any) => (
                                          <div key={h.id} className="p-2.5 bg-black border border-neutral-900 rounded-lg text-xs space-y-1">
                                            <div className="flex justify-between items-center text-[9px] font-mono">
                                              <span className="text-amber-400 font-bold uppercase">{h.type === "whatsapp" ? "📲 WhatsApp" : "✉️ Email"}</span>
                                              <span className="text-neutral-500">{new Date(h.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-neutral-300 font-sans text-[11px] leading-snug">{h.message}</p>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}

                            {/* TAB CONTENT: PROJECT PROGRESS CONTROLLER */}
                            {(adminSubTabs[proj.id] === "progress") && (
                              <div className="space-y-4 font-sans">
                                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 space-y-3">
                                  <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                                      ⏱️ Project Progress Controller
                                    </span>
                                    <span className="text-[8px] font-mono uppercase bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                                      Syncs to Client Portal Live
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[
                                      { pct: "10", title: "10% - Requirements Received", statusKey: "requirements" },
                                      { pct: "25", title: "25% - Planning & Strategy", statusKey: "planning" },
                                      { pct: "40", title: "40% - Design Started", statusKey: "design" },
                                      { pct: "60", title: "60% - Development Started", statusKey: "development" },
                                      { pct: "80", title: "80% - Review Phase", statusKey: "review" },
                                      { pct: "100", title: "100% - Website Live", statusKey: "live" },
                                    ].map((st) => (
                                      <button
                                        key={st.pct}
                                        onClick={() => {
                                          safeLocalStorage.setItem(`fuser_project_progress_${proj.id}`, st.pct);
                                          handleModifyProject(proj.id, { status: st.statusKey });
                                          alert(`Project status updated to: ${st.title}. Client portal synced!`);
                                        }}
                                        className="p-3 bg-black hover:bg-neutral-900 border border-neutral-850 hover:border-amber-500/40 rounded-xl text-left transition-all cursor-pointer space-y-1"
                                      >
                                        <div className="text-xs font-bold text-white uppercase">{st.title}</div>
                                        <div className="text-[9px] font-mono text-neutral-400">Set stage to {st.pct}%</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TAB CONTENT: FOUNDER OVERRIDES - FULLY CONFIGURABLE */}
                            {(adminSubTabs[proj.id] === "overrides") && (
                              <div className="space-y-4 font-sans">
                                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 space-y-4">
                                  <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                                      🛠️ DYNAMIC FOUNDER OVERRIDE CONTROLLER
                                    </span>
                                    <span className="text-[8px] font-mono uppercase bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                                      Zero Magic Numbers • Dynamic Control
                                    </span>
                                  </div>

                                  <p className="text-xs text-neutral-300 leading-relaxed">
                                    Configure custom duration, pricing, flags, and hosting parameters for <strong className="text-white">{proj.businessName}</strong> without hardcoded business constraints.
                                  </p>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 1. Hosting Extension (Configurable) */}
                                    <div className="bg-black border border-neutral-900 rounded-xl p-3.5 space-y-2">
                                      <div className="text-xs font-bold text-amber-400 uppercase flex items-center justify-between">
                                        <span>🎁 Hosting Extension Override</span>
                                        <span className="text-[9px] font-mono text-neutral-400">Configurable</span>
                                      </div>
                                      <p className="text-[10px] text-neutral-400">Select days or set lifetime free hosting:</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {[7, 30, 60, 90, 180, 365].map((d) => (
                                          <button
                                            key={d}
                                            onClick={() => {
                                              safeLocalStorage.setItem(`fuser_hosting_override_${proj.id}`, `extended_${d}_days`);
                                              alert(`Granted +${d} Days Complimentary Hosting to ${proj.businessName}!`);
                                            }}
                                            className="px-2 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[9.5px] font-mono text-neutral-200 rounded hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer"
                                          >
                                            +{d} Days
                                          </button>
                                        ))}
                                        <button
                                          onClick={() => {
                                            safeLocalStorage.setItem(`fuser_hosting_override_${proj.id}`, "lifetime_free");
                                            alert(`Granted LIFETIME Complimentary Hosting to ${proj.businessName}!`);
                                          }}
                                          className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 text-[9.5px] font-mono text-amber-300 font-bold rounded hover:bg-amber-500/30 transition-all cursor-pointer"
                                        >
                                          ♾️ Lifetime Free
                                        </button>
                                      </div>
                                    </div>

                                    {/* 2. Quote Validity Extension (Configurable) */}
                                    <div className="bg-black border border-neutral-900 rounded-xl p-3.5 space-y-2">
                                      <div className="text-xs font-bold text-amber-400 uppercase flex items-center justify-between">
                                        <span>⏳ Quote Validity Override</span>
                                        <span className="text-[9px] font-mono text-neutral-400">Configurable</span>
                                      </div>
                                      <p className="text-[10px] text-neutral-400">Extend lock-in duration for quote pricing:</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {[1, 3, 7, 14, 30, 60].map((d) => (
                                          <button
                                            key={d}
                                            onClick={() => {
                                              safeLocalStorage.setItem(`fuser_quote_validity_${proj.id}`, `extended_${d}_days`);
                                              alert(`Extended Quote Validity by +${d} days for ${proj.businessName}!`);
                                            }}
                                            className="px-2 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[9.5px] font-mono text-neutral-200 rounded hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer"
                                          >
                                            +{d} Days
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* 3. Custom Package & Discount Override */}
                                    <div className="bg-black border border-neutral-900 rounded-xl p-3.5 space-y-2">
                                      <div className="text-xs font-bold text-amber-400 uppercase">
                                        ⚡ Package Tier & Upgrade Override
                                      </div>
                                      <p className="text-[10px] text-neutral-400">Switch package tier instantly:</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {[
                                          { name: "Ignite (₹10k)", key: "foundation" },
                                          { name: "Fusion (₹20k)", key: "growth" },
                                          { name: "Catalyst (₹40k)", key: "dominance" },
                                        ].map((pkg) => (
                                          <button
                                            key={pkg.key}
                                            onClick={() => {
                                              handleModifyProject(proj.id, { selectedPackage: pkg.key });
                                              alert(`Updated ${proj.businessName} package to ${pkg.name}!`);
                                            }}
                                            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[9.5px] font-mono text-neutral-200 rounded hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer"
                                          >
                                            {pkg.name}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* 4. Client Status Flags & Notification Muting */}
                                    <div className="bg-black border border-neutral-900 rounded-xl p-3.5 space-y-2">
                                      <div className="text-xs font-bold text-amber-400 uppercase">
                                        👑 VIP Flags & Mute Controls
                                      </div>
                                      <p className="text-[10px] text-neutral-400">Toggle special client statuses:</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        <button
                                          onClick={() => {
                                            const key = `fuser_vip_client_${proj.id}`;
                                            const isVip = safeLocalStorage.getItem(key) === "true";
                                            safeLocalStorage.setItem(key, String(!isVip));
                                            alert(`VIP Client status set to: ${!isVip}`);
                                          }}
                                          className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-[9.5px] font-mono text-amber-300 font-bold rounded hover:bg-amber-500/20 transition-all cursor-pointer"
                                        >
                                          ⭐ Toggle VIP Client
                                        </button>

                                        <button
                                          onClick={() => {
                                            const key = `fuser_mute_notifs_${proj.id}`;
                                            const isMuted = safeLocalStorage.getItem(key) === "true";
                                            safeLocalStorage.setItem(key, String(!isMuted));
                                            alert(`Client notifications muted: ${!isMuted}`);
                                          }}
                                          className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-[9.5px] font-mono text-neutral-300 rounded hover:text-white transition-all cursor-pointer"
                                        >
                                          🔕 Mute Reminders
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 5. Manual Payment Approval / Fee Waiver */}
                                  <div className="bg-black border border-neutral-900 rounded-xl p-3.5 space-y-2">
                                    <div className="text-xs font-bold text-emerald-400 uppercase">
                                      💳 Manual Payment Status Override
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        onClick={() => {
                                          handleModifyProject(proj.id, { paymentStatus: "paid" });
                                          alert(`Marked ${proj.businessName} payment as PAID via Founder Override.`);
                                        }}
                                        className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold rounded-lg hover:bg-emerald-500/25 transition-all cursor-pointer"
                                      >
                                        ✅ Mark Full Payment Received
                                      </button>

                                      <button
                                        onClick={() => {
                                          handleModifyProject(proj.id, { paymentStatus: "partially_paid" });
                                          alert(`Marked ${proj.businessName} payment as PARTIALLY PAID.`);
                                        }}
                                        className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold rounded-lg hover:bg-amber-500/25 transition-all cursor-pointer"
                                      >
                                        ⏳ Mark Partially Paid
                                      </button>

                                      <button
                                        onClick={() => {
                                          handleModifyProject(proj.id, { paymentStatus: "unpaid" });
                                          alert(`Reset ${proj.businessName} payment to UNPAID.`);
                                        }}
                                        className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 font-bold rounded-lg hover:text-white transition-all cursor-pointer"
                                      >
                                        ↺ Reset Payment Status
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TAB CONTENT: LIFECYCLE (LAUNCH & HEALTH) */}
                            {(adminSubTabs[proj.id] || "proposal") === "lifecycle" && (
                              <div className="space-y-4 font-sans text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {/* Launch Status */}
                                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-900 space-y-1.5">
                                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Launch Status</span>
                                    <select
                                      value={proj.launchStatus || "IN_PROGRESS"}
                                      onChange={(e) => handleModifyProject(proj.id, { launchStatus: e.target.value as any })}
                                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs font-mono font-bold text-white focus:outline-none"
                                    >
                                      <option value="DRAFT">DRAFT</option>
                                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                                      <option value="READY_TO_LAUNCH">READY_TO_LAUNCH</option>
                                      <option value="DEPLOYING">DEPLOYING</option>
                                      <option value="VERIFYING">VERIFYING</option>
                                      <option value="LAUNCHED">LAUNCHED</option>
                                      <option value="ATTENTION">ATTENTION</option>
                                    </select>
                                    <p className="text-[9.5px] text-zinc-500">Controls client dashboard launch stage & progress.</p>
                                  </div>

                                  {/* Website Status */}
                                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-900 space-y-1.5">
                                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Website Status</span>
                                    <select
                                      value={proj.websiteStatus || "OFFLINE"}
                                      onChange={(e) => handleModifyProject(proj.id, { websiteStatus: e.target.value as any })}
                                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs font-mono font-bold text-white focus:outline-none"
                                    >
                                      <option value="OFFLINE">OFFLINE</option>
                                      <option value="PROVISIONING">PROVISIONING</option>
                                      <option value="ONLINE">ONLINE</option>
                                      <option value="DEGRADED">DEGRADED</option>
                                    </select>
                                    <p className="text-[9.5px] text-zinc-500">Live web server accessibility state.</p>
                                  </div>

                                  {/* Health Status */}
                                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-900 space-y-1.5">
                                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Health Status</span>
                                    <div className="flex items-center gap-2 py-1.5 px-2 bg-neutral-900 rounded-lg border border-neutral-800">
                                      <span className={`h-2 w-2 rounded-full ${
                                        proj.healthStatus === "HEALTHY" ? "bg-emerald-400" :
                                        proj.healthStatus === "UNHEALTHY" ? "bg-red-400" : "bg-zinc-500"
                                      }`} />
                                      <span className="font-mono text-xs font-bold text-white">{proj.healthStatus || "UNKNOWN"}</span>
                                    </div>
                                    <p className="text-[9.5px] text-zinc-500">Real-time HTTP health monitor result.</p>
                                  </div>
                                </div>

                                {/* URL Configurations */}
                                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 space-y-3">
                                  <span className="text-[10px] font-mono uppercase text-amber-500 font-bold block">Domain & Staging Endpoints</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-[9px] font-mono text-zinc-400 block mb-1">Production Website URL</label>
                                      <input
                                        type="text"
                                        defaultValue={proj.websiteUrl || ""}
                                        onBlur={(e) => {
                                          if (e.target.value !== proj.websiteUrl) {
                                            handleModifyProject(proj.id, { websiteUrl: e.target.value });
                                          }
                                        }}
                                        placeholder="https://example.com"
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-[9px] font-mono text-zinc-400 block mb-1">Staging / Preview URL</label>
                                      <input
                                        type="text"
                                        defaultValue={proj.stagingUrl || ""}
                                        onBlur={(e) => {
                                          if (e.target.value !== proj.stagingUrl) {
                                            handleModifyProject(proj.id, { stagingUrl: e.target.value });
                                          }
                                        }}
                                        placeholder="https://preview.codefuser.com"
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Lifecycle Action Triggers */}
                                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 space-y-3">
                                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Automated Lifecycle Actions</span>
                                  <div className="flex flex-wrap gap-2.5">
                                    <button
                                      onClick={() => handleTriggerLaunch(proj.id)}
                                      disabled={lifecycleActionLoading[proj.id]}
                                      className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <span>🚀 Start Launch Sequence</span>
                                    </button>

                                    <button
                                      onClick={() => handleVerifyLaunch(proj.id)}
                                      disabled={lifecycleActionLoading[proj.id]}
                                      className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-zinc-200 hover:text-white text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <span>🔍 Verify Launch Status</span>
                                    </button>

                                    <button
                                      onClick={() => handleHealthCheck(proj.id)}
                                      disabled={lifecycleActionLoading[proj.id]}
                                      className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-zinc-200 hover:text-white text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <span>💓 Ping Health Check</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        handleModifyProject(proj.id, { 
                                          launchStatus: "LAUNCHED", 
                                          websiteStatus: "ONLINE",
                                          healthStatus: "HEALTHY",
                                          status: "Project Completed"
                                        });
                                        alert("Switched project to 100% LIVE & ONLINE!");
                                      }}
                                      className="px-3.5 py-2 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                                    >
                                      <span>✓ Instant Mark LIVE</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TAB CONTENT: CHANGE REQUESTS */}
                            {(adminSubTabs[proj.id] || "proposal") === "requests" && (
                              <div className="space-y-4 font-sans text-xs">
                                <div className="flex justify-between items-center bg-neutral-950 p-3.5 rounded-xl border border-neutral-900">
                                  <div>
                                    <span className="text-[10px] font-mono uppercase text-amber-500 font-bold block">Client Change Requests</span>
                                    <p className="text-[10px] text-zinc-400 mt-0.5">Manage live website modification requests submitted by the client.</p>
                                  </div>
                                  <button
                                    onClick={async () => {
                                      const text = prompt("Enter manual change request on behalf of client:");
                                      if (!text) return;
                                      try {
                                        const res = await fetch(`/api/projects/${proj.id}/change-requests`, {
                                          method: "POST",
                                          headers: getAdminHeaders({ "Content-Type": "application/json" }),
                                          body: JSON.stringify({
                                            requestText: text,
                                            category: "Admin Created",
                                            priority: "HIGH"
                                          })
                                        });
                                        if (res.ok) {
                                          await fetchProjectExtra(proj.id);
                                          alert("Change request logged successfully!");
                                        }
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-400 text-[10px] font-mono font-bold uppercase rounded-lg cursor-pointer"
                                  >
                                    + Add Request
                                  </button>
                                </div>

                                {(!extraProjectMap[proj.id]?.quote?.changeRequests || extraProjectMap[proj.id]?.quote?.changeRequests.length === 0) ? (
                                  <div className="p-8 text-center bg-neutral-950/40 rounded-xl border border-neutral-900 border-dashed">
                                    <span className="text-xs text-zinc-500 block">No change requests have been submitted for this project yet.</span>
                                  </div>
                                ) : (
                                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                                    {extraProjectMap[proj.id].quote.changeRequests.map((req: any) => (
                                      <div
                                        key={req.id}
                                        className="p-4 bg-neutral-950 rounded-xl border border-neutral-900 space-y-3"
                                      >
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                          <div className="space-y-0.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="font-mono text-[10px] text-zinc-500 font-bold">{req.id}</span>
                                              <span className="px-2 py-0.5 rounded text-[9.5px] font-mono uppercase bg-neutral-900 text-zinc-300 border border-neutral-800">
                                                {req.category || "General"}
                                              </span>
                                            </div>
                                            <p className="font-medium text-white text-xs pt-1 break-words whitespace-pre-wrap">{req.requestText}</p>
                                            {req.photoName && (
                                              <p className="text-[10px] text-zinc-400">Attached file: {req.photoName}</p>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-2 shrink-0">
                                            <select
                                              value={req.status}
                                              onChange={(e) => handleUpdateChangeRequestStatus(proj.id, req.id, e.target.value, req.adminNotes)}
                                              className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase text-white focus:outline-none cursor-pointer"
                                            >
                                              <option value="SUBMITTED">SUBMITTED</option>
                                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                                              <option value="COMPLETED">COMPLETED</option>
                                              <option value="REJECTED">REJECTED</option>
                                            </select>
                                          </div>
                                        </div>

                                        {/* Admin Notes & Completion Box */}
                                        <div className="pt-2 border-t border-neutral-900 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                                          <input
                                            type="text"
                                            placeholder="Developer response note to client..."
                                            defaultValue={req.adminNotes || ""}
                                            onChange={(e) => setChangeRequestNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                                            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none"
                                          />
                                          <button
                                            onClick={() => {
                                              const note = changeRequestNotes[req.id] !== undefined ? changeRequestNotes[req.id] : (req.adminNotes || "");
                                              handleUpdateChangeRequestStatus(proj.id, req.id, "COMPLETED", note);
                                            }}
                                            className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-400 text-[10px] font-mono font-bold uppercase rounded-lg cursor-pointer shrink-0"
                                          >
                                            ✓ Complete & Notify
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Technical Core Action block */}
                          <div className="mt-5 pt-4 border-t border-neutral-900 flex justify-between items-center bg-card/60 rounded-xl p-3.5 border border-border/40">
                            <div>
                              <p className="text-[10px] font-mono text-muted-foreground/75 uppercase tracking-wide">
                                Compiled under Track ID CodeFuser Core:
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-zinc-300 font-semibold text-[11px]">
                                  {proj.id ? proj.id.toUpperCase() : ""}
                                </span>
                                <button
                                  onClick={() => handleFetchAuditTrail(proj.id)}
                                  className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-500 hover:text-white bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                                >
                                  🔍 View Audit Trail
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                              {/* Real-time Status Dropdown */}
                              <select
                                value={proj.status}
                                onChange={(e) => handleUpdateStatus(proj.id, e.target.value)}
                                className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase text-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 cursor-pointer h-8"
                              >
                                <option value="Project Filed">1. Payment Received</option>
                                <option value="Specs Audited">2. Project Created</option>
                                <option value="Assets Pending">3. Asset Collection</option>
                                <option value="Designing">4. Design Started</option>
                                <option value="Development">5. Development</option>
                                <option value="Client Review">6. Client Review</option>
                                <option value="Revisions">7. Revisions</option>
                                <option value="Testing">8. Testing</option>
                                <option value="Launched">9. Launch</option>
                                <option value="Delivered">10. Delivery</option>
                              </select>

                              <button
                                onClick={() => {
                                  alert(`Successfully initiated development compiler for project ${proj.id}. CodeFuser systems are mapping the custom database schema layouts...`);
                                }}
                                className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-lg text-amber-500 hover:bg-neutral-800 tracking-wider transition-all h-8 flex items-center"
                              >
                                🚀 Start Compiler
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

          </>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search/Filter for Users */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/45">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search user profiles by email, name, or business brand..."
                  className="pl-9 pr-4 border border-border bg-[#050505] rounded-xl py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50 w-full"
                />
              </div>
              <button
                onClick={fetchUsers}
                className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-border/40 text-xs font-semibold rounded-xl text-white flex items-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <RefreshCw size={12} className={usersLoading ? "animate-spin" : ""} /> Sync Profiles
              </button>
            </div>

            {usersLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Querying profiles from database...</span>
              </div>
            ) : (
              <div className="bg-card border border-border/80 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-900 bg-black/40">
                        <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-neutral-400">User Identity & Brand</th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-neutral-400">Email Address</th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-neutral-400">Role Authority</th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-neutral-400">Database ID</th>
                        <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-neutral-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900/60">
                      {usersList
                        .filter(u => {
                          const query = (userSearchQuery || "").toLowerCase();
                          return (
                            (u.email || "").toLowerCase().includes(query) ||
                            (u.fullName || "").toLowerCase().includes(query) ||
                            (u.businessName || "").toLowerCase().includes(query) ||
                            (u.id || "").toLowerCase().includes(query)
                          );
                        })
                        .map(user => (
                          <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs uppercase font-mono">
                                  {user.fullName ? user.fullName.substring(0, 2) : "CF"}
                                </div>
                                <div>
                                  <span className="text-xs font-semibold text-white block">{user.fullName || "Unnamed Client"}</span>
                                  <span className="text-[10px] text-zinc-500 block font-mono">{user.businessName || "No Associated Brand"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-xs text-neutral-300 font-mono">
                              {user.email}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider border ${
                                user.role === "super_admin"
                                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                                  : user.role === "admin"
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                  : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              }`}>
                                <Shield size={10} /> {user.role === "super_admin" ? "Super Admin" : user.role === "admin" ? "Administrator" : "Client"}
                              </span>
                            </td>
                            <td className="p-4 text-[10px] text-neutral-600 font-mono">
                              {user.id}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-[10px] font-mono font-bold uppercase text-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 cursor-pointer"
                                >
                                  <option value="client">Client</option>
                                  <option value="admin">Admin</option>
                                  <option value="super_admin">Super Admin</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {usersList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-xs text-zinc-500 font-mono uppercase">
                            No registered user profiles found in database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "crm" && (
          <BusinessIntelligenceCRM projects={projects} />
        )}

        {activeTab === "hosting" && (
          <HostingAdminManager getAdminHeaders={getAdminHeaders} />
        )}

        {activeTab === "coupons" && (
          <CouponsAdminManager />
        )}
        {activeAuditProjId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#030303] border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest flex items-center gap-2">
                    <span className="text-amber-500 animate-pulse">●</span> Real-time Audit Trail Activity log
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    PROJECT REF ID: {activeAuditProjId ? activeAuditProjId.toUpperCase() : ""}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveAuditProjId(null);
                    setAuditLogs([]);
                  }}
                  className="p-1 px-3 bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold uppercase text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Close [ESC]
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {auditLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Compiling activities...</span>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">No activity logs recorded</span>
                    <p className="text-xs text-zinc-600 max-w-xs mx-auto leading-relaxed">
                      Transactions or modifications completed on this project will stream real-time events to this terminal securely.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 font-mono text-left">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-black/45 border border-neutral-900 rounded-2xl space-y-2 text-[11px] leading-relaxed relative hover:border-neutral-800 transition-all">
                        <div className="flex items-start justify-between gap-2 border-b border-neutral-950 pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                              log.status === "Success" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}>
                              {log.eventType}
                            </span>
                            <span className="text-[9px] text-zinc-500">
                              By {log.actor}
                            </span>
                          </div>
                          <span className="text-[9px] text-zinc-500 text-right">
                            {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-zinc-300">
                          {log.notes}
                        </div>
                        <div className="text-[8px] text-zinc-600 truncate">
                          Request Ref: {log.requestId}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-neutral-950 border-t border-neutral-900 flex justify-between items-center text-[9px] font-mono text-zinc-500">
                <span>DURABLE CLOUD SYNC: VERIFIED</span>
                <span className="text-amber-500/80">CodeFuser Stateless System Logs</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionControl;
