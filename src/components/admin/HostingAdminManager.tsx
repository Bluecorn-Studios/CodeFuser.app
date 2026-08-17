import React, { useState, useEffect } from "react";
import {
  Server,
  ShieldAlert,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  Calendar,
  Clock,
  Search,
  RefreshCw,
  Loader2,
  AlertTriangle,
  User,
  Globe,
  FileText
} from "lucide-react";

interface AdminHostingItem {
  project: {
    id: string;
    businessName: string;
    clientName: string;
    email: string;
    paymentStatus: string;
  };
  subscription: {
    id: string;
    status: string;
    planName: string;
    monthlyAmount: number;
    freeTrialEnd: string;
    nextBillingDate: string;
    autopayStatus: string;
    mandateStatus: string;
    failedPaymentCount: number;
  };
  domain: {
    domainName: string;
    registrationStatus: string;
    renewalPrice: number;
  };
  invoicesCount: number;
  lastInvoice: any;
}

interface HostingAdminManagerProps {
  getAdminHeaders: (extra?: Record<string, string>) => Record<string, string>;
}

export const HostingAdminManager: React.FC<HostingAdminManagerProps> = ({ getAdminHeaders }) => {
  const [loading, setLoading] = useState(true);
  const [hostingList, setHostingList] = useState<AdminHostingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminHostingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/hosting", {
        headers: getAdminHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch administrative hosting data.");

      const json = await res.json();
      if (json.success) {
        setHostingList(json.hostingList || []);
      }
    } catch (err: any) {
      console.error("Admin hosting load error:", err);
      setError(err.message || "Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminHostingData();
  }, []);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmModalState, setConfirmModalState] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const handleAdminActionConfirm = (projectId: string, action: string, days?: number, businessName?: string) => {
    const isSuspend = action === "suspend_hosting";
    const title = isSuspend ? `Suspend hosting for ${businessName || "this project"}?` : `Execute '${action}'?`;
    const description = isSuspend 
      ? "This may make the website unavailable to visitors. You can reactivate hosting at any time."
      : `This will update the hosting subscription status for ${businessName || "this project"}.`;

    setConfirmModalState({
      title,
      description,
      onConfirm: () => {
        setConfirmModalState(null);
        handleAdminAction(projectId, action, days);
      }
    });
  };

  const handleAdminAction = async (projectId: string, action: string, days?: number) => {
    setActionLoadingId(projectId);
    setError(null);
    try {
      const res = await fetch("/api/admin/hosting/action", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ projectId, action, days }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(`✓ Successfully executed '${action}'`);
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchAdminHostingData();
      } else {
        throw new Error(json.error || "We couldn't execute the administrative action.");
      }
    } catch (err: any) {
      setError(err.message || "We couldn't connect to the server.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = hostingList.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.project.businessName?.toLowerCase().includes(query) ||
      item.project.clientName?.toLowerCase().includes(query) ||
      item.project.id?.toLowerCase().includes(query) ||
      item.domain.domainName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="text-white" size={20} />
            <span>Hosting & Subscription Mission Control</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Manage recurring hosting subscriptions, extend promotional trial periods, or execute manual suspensions.
          </p>
        </div>

        <button
          onClick={fetchAdminHostingData}
          className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 hover:text-white cursor-pointer transition-all"
        >
          <RefreshCw size={14} />
          <span>Refresh All Subscriptions</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 text-neutral-500" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by client business, name, project ID or domain..."
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
        />
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-mono">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs font-mono">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-400">
          <Loader2 className="animate-spin text-white" size={28} />
          <span className="text-xs font-mono">Loading hosting subscriptions...</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Project / Business</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Subscription Status</th>
                <th className="py-3 px-4">AutoPay Mandate</th>
                <th className="py-3 px-4">Next Billing Date</th>
                <th className="py-3 px-4 text-right">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filtered.map((item) => {
                const isSuspended = item.subscription.status === "HOSTING_SUSPENDED";
                const isAutoPay = item.subscription.status === "AUTOPAY_ACTIVE";
                const isLoading = actionLoadingId === item.project.id;

                return (
                  <tr key={item.project.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3.5 px-4 space-y-0.5">
                      <span className="font-bold text-white block">{item.project.businessName}</span>
                      <span className="text-[10px] text-neutral-400 font-mono block">
                        Client: {item.project.clientName} ({item.project.id})
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-neutral-200 font-bold block">{item.domain.domainName}</span>
                      <span className="text-[10px] text-neutral-500 block">{item.domain.registrationStatus}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          isAutoPay
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : isSuspended
                            ? "text-red-400 bg-red-500/10 border-red-500/20"
                            : "text-white bg-neutral-900 border-neutral-800"
                        }`}
                      >
                        {item.subscription.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-neutral-300 font-semibold block capitalize">
                        {item.subscription.autopayStatus}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono block">
                        ₹{item.subscription.monthlyAmount}/mo
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-400">
                      {item.subscription.nextBillingDate
                        ? new Date(item.subscription.nextBillingDate).toLocaleDateString("en-IN")
                        : "N/A"}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleAdminActionConfirm(item.project.id, "extend_free_period", 30, item.project.businessName)}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-[10px] font-bold text-white border border-neutral-800 cursor-pointer transition-all"
                        title="Add 30 Days Free Hosting"
                      >
                        +30 Days Free
                      </button>

                      {isSuspended ? (
                        <button
                          onClick={() => handleAdminActionConfirm(item.project.id, "reactivate_hosting", undefined, item.project.businessName)}
                          disabled={isLoading}
                          className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 cursor-pointer transition-all"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAdminActionConfirm(item.project.id, "suspend_hosting", undefined, item.project.businessName)}
                          disabled={isLoading}
                          className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-[10px] font-bold text-red-400 border border-red-500/30 cursor-pointer transition-all"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmModalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-bold">
                ⚠️
              </div>
              <div>
                <h3 className="text-white font-bold text-base">{confirmModalState.title}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Please confirm this hosting action.</p>
              </div>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-900">
              {confirmModalState.description}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalState(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModalState.onConfirm}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-extrabold transition-all cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
