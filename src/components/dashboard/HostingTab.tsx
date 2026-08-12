import React, { useState, useEffect } from "react";
import {
  Server,
  ShieldCheck,
  Calendar,
  CreditCard,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Lock,
  X,
  Loader2
} from "lucide-react";
import { ProjectRecord } from "./dashboardTypes";
import { supabase } from "../../lib/supabase";

interface HostingSubscriptionData {
  id: string;
  projectId: string;
  packageId?: string;
  planName: string;
  monthlyAmount: number;
  currency: string;
  freeHostingMonths?: number;
  domainFreeYears?: number;
  domainRenewalPrice?: number;
  reconciliationStatus?: string;
  freeTrialStart: string;
  freeTrialEnd: string;
  nextBillingDate: string;
  status: string;
  autopayStatus: string;
  mandateStatus: string;
  razorpaySubscriptionId?: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  gracePeriodEndsAt?: string;
}

interface DomainData {
  id: string;
  domainName: string;
  registrationStatus: string;
  registrar: string;
  expiryDate?: string;
  renewalDate?: string;
  renewalPrice: number;
  autoRenewStatus: boolean;
  ownershipStatus: string;
}

interface HostingInvoiceData {
  id: string;
  receiptNumber: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  amount: number;
  discount: number;
  finalAmount: number;
  status: string;
  paymentDate: string;
  nextBillingDate: string;
}

interface HostingTabProps {
  project: ProjectRecord;
}

export const HostingTab: React.FC<HostingTabProps> = ({ project }) => {
  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState<HostingSubscriptionData | null>(null);
  const [domainData, setDomainData] = useState<DomainData | null>(null);
  const [invoices, setInvoices] = useState<HostingInvoiceData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [setupLoading, setSetupLoading] = useState(false);
  const [cancellingLoading, setCancellingLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [modalNotification, setModalNotification] = useState<{
    type: "success" | "info" | "error" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
  } | null>(null);

  const fetchHostingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || localStorage.getItem("fuser_token") || "";

      const res = await fetch(`/api/projects/${project.id}/hosting`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error("Failed to load hosting data.");
      }

      const json = await res.json();
      if (json.success) {
        setSubData(json.subscription);
        setDomainData(json.domain);
        setInvoices(json.invoices || []);
      }
    } catch (err: any) {
      console.error("Hosting tab error:", err);
      setError(err.message || "Failed to load hosting information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostingData();
  }, [project.id]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
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

  const handleInitiateAutoPay = async () => {
    setSetupLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || localStorage.getItem("fuser_token") || "";

      const res = await fetch(`/api/projects/${project.id}/hosting/setup-autopay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to initiate AutoPay setup.");

      if (json.isRealRazorpay) {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded || !(window as any).Razorpay) {
          throw new Error("Unable to load Razorpay Checkout SDK. Please check your internet connection and try again.");
        }

        const options = {
          key: json.keyId,
          subscription_id: json.subscriptionId,
          name: "CodeFuser Cloud Hosting",
          description: "Monthly Website Hosting & Cloud Maintenance",
          handler: async (response: any) => {
            await verifyAutoPay(response);
          },
          modal: {
            ondismiss: () => {
              setModalNotification({
                type: "info",
                title: "AutoPay Authorization Incomplete",
                message: "You closed the Razorpay authorization window before completing setup. Your mandate is currently pending authorization."
              });
            }
          },
          prefill: {
            name: project.clientName,
            email: project.email,
            contact: project.whatsapp || "",
          },
          theme: { color: "#F59E0B" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Simulation mode
        await verifyAutoPay({
          razorpay_subscription_id: json.subscriptionId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: "simulated_sig",
        });
      }
    } catch (err: any) {
      setModalNotification({
        type: "error",
        title: "AutoPay Setup Error",
        message: err.message || "AutoPay setup failed. Please try again or contact support."
      });
    } finally {
      setSetupLoading(false);
    }
  };

  const verifyAutoPay = async (payload: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || localStorage.getItem("fuser_token") || "";

      const res = await fetch(`/api/projects/${project.id}/hosting/verify-autopay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        await fetchHostingData();
        const mStatus = json.subscription?.mandateStatus || "created";
        const isAct = json.subscription?.autopayStatus === "active" || json.subscription?.status === "AUTOPAY_ACTIVE";

        if (isAct) {
          setModalNotification({
            type: "success",
            title: "✓ Hosting AutoPay Mandate Activated",
            message: "Your automatic payment mandate is active. Your website hosting will renew seamlessly without any manual intervention required."
          });
        } else if (mStatus === "authenticated") {
          setModalNotification({
            type: "info",
            title: "✓ Mandate Authorized (Pending First Charge)",
            message: "Your AutoPay authorization has been successfully recorded on Razorpay. Official activation will finalize upon your first cycle charge. Your hosting remains 100% active."
          });
        } else if (mStatus === "created") {
          setModalNotification({
            type: "info",
            title: "Mandate Created (Authorization Pending)",
            message: "Your AutoPay mandate has been created, but payment authorization is required before it becomes active. Please authorize through the Razorpay checkout window."
          });
        } else {
          setModalNotification({
            type: "info",
            title: "AutoPay Mandate Update",
            message: `Mandate recorded with status: ${mStatus.toUpperCase()}.`
          });
        }
      } else {
        throw new Error(json.error || "AutoPay verification failed.");
      }
    } catch (err: any) {
      setModalNotification({
        type: "error",
        title: "AutoPay Verification Failed",
        message: err.message || "Failed to verify AutoPay mandate status."
      });
    }
  };

  const executeCancelAutoPay = async () => {
    setCancellingLoading(true);
    setModalNotification(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || localStorage.getItem("fuser_token") || "";

      const res = await fetch(`/api/projects/${project.id}/hosting/cancel-autopay`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const json = await res.json();
      if (json.success) {
        setModalNotification({
          type: "info",
          title: "AutoPay Cancelled",
          message: "Your AutoPay mandate has been cancelled. Your website will remain live until the end of your active billing cycle."
        });
        fetchHostingData();
      } else {
        throw new Error(json.error || "Failed to cancel AutoPay.");
      }
    } catch (err: any) {
      setModalNotification({
        type: "error",
        title: "Cancellation Error",
        message: err.message || "Could not cancel AutoPay mandate."
      });
    } finally {
      setCancellingLoading(false);
    }
  };

  const handleCancelAutoPay = () => {
    setModalNotification({
      type: "confirm",
      title: "Cancel AutoPay Mandate?",
      message: "Are you sure you want to cancel your hosting AutoPay mandate? Your website will remain online until the end of your current cycle.",
      onConfirm: executeCancelAutoPay
    });
  };

  const handleDownloadInvoice = async (invoiceId: string, receiptNumber: string) => {
    setDownloadingId(invoiceId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || localStorage.getItem("fuser_token") || "";

      const res = await fetch(`/api/projects/${project.id}/hosting/receipt/${invoiceId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Could not download hosting invoice PDF.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CodeFuser-Hosting-Invoice-${receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setModalNotification({
        type: "error",
        title: "Download Error",
        message: err.message || "Failed to download hosting invoice PDF."
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-neutral-400">
        <Loader2 className="animate-spin text-amber-500" size={28} />
        <span className="text-xs font-mono">Loading CodeFuser Cloud Hosting & Domain details...</span>
      </div>
    );
  }

  const isFreeTrial = subData?.status === "FREE_TRIAL_ACTIVE";
  const isAutoPayActive = subData?.status === "AUTOPAY_ACTIVE" || subData?.autopayStatus === "active";
  const isMandateAuthenticated = subData?.mandateStatus === "authenticated";
  const isMandatePending = (subData?.status === "MANDATE_PENDING" || subData?.mandateStatus === "created") && !isMandateAuthenticated && !isAutoPayActive;
  const isSuspended = subData?.status === "HOSTING_SUSPENDED";
  const isGracePeriod = subData?.status === "GRACE_PERIOD";

  return (
    <div className="space-y-8 py-2">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
            Website Hosting & Domain Name
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            CodeFuser Hosting & Domain
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Keep your website online, view your domain name details, and manage automatic monthly payments.
          </p>
        </div>

        <button
          onClick={fetchHostingData}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* WARNING BANNER FOR GRACE PERIOD / SUSPENDED */}
      {isSuspended && (
        <div className="p-5 rounded-2xl bg-red-950/80 border border-red-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-red-200">Hosting Currently Suspended</h3>
              <p className="text-xs text-red-300/80 mt-0.5">
                Your hosting payment was unpaid and the grace period has ended. Set up AutoPay or complete payment to restore website access immediately.
              </p>
            </div>
          </div>
          <button
            onClick={handleInitiateAutoPay}
            disabled={setupLoading}
            className="px-4 py-2 bg-red-500 hover:bg-red-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
          >
            {setupLoading ? "Processing..." : "PAY & REACTIVATE HOSTING →"}
          </button>
        </div>
      )}

      {isGracePeriod && (
        <div className="p-5 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="text-amber-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-amber-200">Hosting Payment Due — Grace Period Active</h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Your website remains live! Grace period ends on{" "}
                <strong className="text-white">
                  {subData?.gracePeriodEndsAt ? new Date(subData.gracePeriodEndsAt).toLocaleDateString() : "Soon"}
                </strong>
                . Please update AutoPay to prevent service interruption.
              </p>
            </div>
          </div>
          <button
            onClick={handleInitiateAutoPay}
            disabled={setupLoading}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
          >
            {setupLoading ? "Processing..." : "UPDATE AUTOPAY →"}
          </button>
        </div>
      )}

      {/* SECTION 1: PROMOTIONAL DISCOUNT & HOSTING CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN HOSTING CARD */}
        <div className="lg:col-span-2 p-6 sm:p-8 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Server size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">CodeFuser Managed Hosting</h2>
                <span className="text-xs text-neutral-400 font-mono">Plan: {subData?.planName || "CodeFuser Hosting"}</span>
              </div>
            </div>

            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                isAutoPayActive
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : isMandateAuthenticated
                  ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                  : isMandatePending
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  : isFreeTrial
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  : isSuspended
                  ? "text-red-400 bg-red-500/10 border-red-500/20"
                  : "text-neutral-400 bg-neutral-900 border-neutral-800"
              }`}
            >
              {isAutoPayActive
                ? "AUTOPAY ACTIVE"
                : isMandateAuthenticated
                ? "MANDATE AUTHENTICATED"
                : isMandatePending
                ? "MANDATE PENDING"
                : (subData?.status?.replace(/_/g, " ") || "ACTIVE")}
            </span>
          </div>

          {/* RECONCILIATION MISMATCH BANNER */}
          {subData?.reconciliationStatus === "PLAN_CONFIGURATION_MISMATCH" && (
            <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center gap-3 text-amber-200 text-xs">
              <Info className="text-amber-400 shrink-0" size={18} />
              <div>
                <strong className="font-bold block">Special Price Locked In</strong>
                Your account is on your locked-in plan price. Your monthly rate will stay unchanged unless you choose to update your package.
              </div>
            </div>
          )}

          {/* PROMOTIONAL BENEFIT HIGHLIGHT BOX */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                <CheckCircle2 size={15} />
                <span>Hosting Benefit Included</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                {subData?.freeHostingMonths || 1} Month{(subData?.freeHostingMonths || 1) > 1 ? "s" : ""} FREE Promotional Hosting
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-emerald-500/20 pt-3">
              <div>
                <span className="text-neutral-400 text-[10px] block">Regular Price</span>
                <span className="text-neutral-300 font-bold line-through">₹{subData?.monthlyAmount?.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] block">Promotional Discount</span>
                <span className="text-emerald-400 font-bold">-₹{subData?.monthlyAmount?.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] block">Current Paid</span>
                <span className="text-white font-extrabold">₹0</span>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] block">Next Billing Rate</span>
                <span className="text-amber-400 font-bold">₹{subData?.monthlyAmount?.toLocaleString("en-IN")}/mo</span>
              </div>
            </div>
          </div>

          {/* SUBSCRIPTION DETAILS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-1">
              <span className="text-neutral-500 text-[10px] font-mono uppercase block">First Paid Billing Date</span>
              <span className="text-white font-bold text-sm block">
                {subData?.nextBillingDate ? new Date(subData.nextBillingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
              </span>
              <span className="text-neutral-400 text-[10px] block">Automatic payments begin after free period ends</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-1">
              <span className="text-neutral-500 text-[10px] font-mono uppercase block">AutoPay Mandate Status</span>
              <span className="text-white font-bold text-sm flex items-center gap-1.5">
                <ShieldCheck size={16} className={isAutoPayActive ? "text-emerald-400" : isMandateAuthenticated ? "text-blue-400" : isMandatePending ? "text-amber-400" : "text-neutral-400"} />
                <span className="capitalize">
                  {isAutoPayActive
                    ? "Active"
                    : isMandateAuthenticated
                    ? "Mandate Authorized — Pending First Charge"
                    : isMandatePending
                    ? "Pending Authorization"
                    : (subData?.autopayStatus || "Inactive")}
                </span>
              </span>
              <span className="text-neutral-400 text-[10px] block">
                {subData?.razorpaySubscriptionId ? `Ref: ${subData.razorpaySubscriptionId}` : "Secure Payment Reference ID"}
              </span>
            </div>
          </div>

          {/* AUTOPAY ACTION BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-900">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <Lock size={14} className="text-amber-500 shrink-0" />
              <span>100% Safe & Encrypted Payment Setup</span>
            </div>

            {!isAutoPayActive && !isMandateAuthenticated ? (
              <button
                onClick={handleInitiateAutoPay}
                disabled={setupLoading}
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                {setupLoading ? "Setting Up..." : "SET UP AUTOMATIC PAYMENTS →"}
              </button>
            ) : (
              <button
                onClick={handleCancelAutoPay}
                disabled={cancellingLoading}
                className="w-full sm:w-auto px-4 py-2.5 bg-neutral-900 hover:bg-red-500/10 hover:border-red-500/30 border border-neutral-800 text-neutral-300 hover:text-red-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {cancellingLoading ? "Turning Off..." : "Turn Off Automatic Payments"}
              </button>
            )}
          </div>
        </div>

        {/* DOMAIN LIFECYCLE CARD */}
        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2.5">
                <Globe className="text-amber-400" size={18} />
                <h3 className="text-sm font-bold text-white">Domain Management</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {domainData?.registrationStatus || "DOMAIN_INCLUDED"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">Registered Domain</span>
              <span className="text-sm font-black text-white block truncate">
                {domainData?.domainName || `${(project?.businessName || "brand").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`}
              </span>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/60">
                <span>Registrar:</span>
                <span className="text-neutral-200 font-semibold">{domainData?.registrar || "CodeFuser Managed"}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Renewal Rate:</span>
                <span className="text-white font-bold">₹{domainData?.renewalPrice || 999}/year</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Ownership:</span>
                <span className="text-amber-400 font-medium">{domainData?.ownershipStatus || "CodeFuser Managed"}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Auto-Renew:</span>
                <span className="text-emerald-400 font-medium">Enabled</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/60 text-[11px] text-neutral-400 space-y-1">
            <span className="font-bold text-neutral-300 block">Domain Policy</span>
            <p className="leading-relaxed">
              Domain renewals are handled automatically. CodeFuser ensures seamless DNS configuration and SSL security certificates.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: HOSTING INVOICES & STATEMENTS TABLE */}
      <div className="p-6 sm:p-8 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Hosting Invoices & Payment Receipts</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Dedicated financial documents for monthly cloud hosting charges.
            </p>
          </div>

          <span className="text-xs font-mono text-neutral-400">
            Total Invoices: {invoices.length}
          </span>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-8 text-xs text-neutral-500">
            No hosting invoices generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Billing Period</th>
                  <th className="py-3 px-4">Regular Amount</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Invoice PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{inv.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">
                      {new Date(inv.billingPeriodStart).toLocaleDateString()} – {new Date(inv.billingPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-400 line-through">
                      ₹{inv.amount}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                      {inv.discount > 0 ? `-₹${inv.discount}` : "₹0"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-white">
                      ₹{inv.finalAmount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv.id, inv.receiptNumber)}
                        disabled={downloadingId === inv.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-[11px] font-bold text-neutral-200 hover:text-white transition-all cursor-pointer"
                      >
                        {downloadingId === inv.id ? (
                          <Loader2 size={12} className="animate-spin text-amber-400" />
                        ) : (
                          <Download size={12} className="text-amber-400" />
                        )}
                        <span>DOWNLOAD PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CUSTOM MODAL NOTIFICATION / CONFIRM DIALOG */}
      {modalNotification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl border ${
                modalNotification.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : modalNotification.type === "error"
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : modalNotification.type === "confirm"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-400"
              }`}>
                {modalNotification.type === "success" ? (
                  <CheckCircle2 size={24} />
                ) : modalNotification.type === "error" ? (
                  <AlertTriangle size={24} />
                ) : modalNotification.type === "confirm" ? (
                  <AlertTriangle size={24} />
                ) : (
                  <ShieldCheck size={24} />
                )}
              </div>
              <button
                onClick={() => setModalNotification(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                {modalNotification.title}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {modalNotification.message}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              {modalNotification.type === "confirm" ? (
                <>
                  <button
                    onClick={() => setModalNotification(null)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-neutral-300 transition-all cursor-pointer"
                  >
                    Keep AutoPay
                  </button>
                  <button
                    onClick={modalNotification.onConfirm}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Yes, Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModalNotification(null)}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Got It
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
