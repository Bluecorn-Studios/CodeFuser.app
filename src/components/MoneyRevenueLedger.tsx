import React, { useState } from "react";
import { ProjectRecord } from "./dashboard/dashboardTypes";
import { 
  getProjectCashCollected, 
  getProjectWaivedValue, 
  isProjectCashPaying, 
  isProjectCovered,
  calculateHostingRecurringRevenue 
} from "../utils/moneyMetrics";
import { formatINR, formatDateSafe, formatPaymentMethod, formatPaymentReference } from "../utils/formatters";
import { 
  DollarSign, 
  ShieldCheck, 
  CreditCard, 
  Tag, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  RefreshCw,
  Repeat
} from "lucide-react";

interface MoneyRevenueLedgerProps {
  projects: ProjectRecord[];
  hostingList?: any[];
  onSelectProject?: (projectId: string) => void;
  onModifyProject?: (projectId: string, updates: Partial<ProjectRecord>) => Promise<void>;
}

export const MoneyRevenueLedger: React.FC<MoneyRevenueLedgerProps> = ({ 
  projects, 
  hostingList = [],
  onSelectProject,
  onModifyProject 
}) => {
  const [filterType, setFilterType] = useState<"all" | "cash" | "waiver" | "unpaid">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Authoritative cash calculations
  const totalCashCollected = projects.reduce((acc, p) => acc + getProjectCashCollected(p), 0);
  const totalWaivedValue = projects.reduce((acc, p) => acc + getProjectWaivedValue(p), 0);
  const coveredCount = projects.filter(isProjectCovered).length;
  const cashPayingCount = projects.filter(isProjectCashPaying).length;
  const waiverCount = projects.filter(p => {
    const prov = String(p.paymentProvider || p.payment?.provider || "").toLowerCase();
    const pid = String(p.paymentId || p.payment?.paymentId || "").toLowerCase();
    return prov.includes("coupon_waiver") || pid.startsWith("waiver_pay_");
  }).length;

  // Authoritative recurring revenue calculations (MRR & ARR from hosting subscriptions)
  const recurringMetrics = calculateHostingRecurringRevenue(
    hostingList && hostingList.length > 0 ? hostingList : projects
  );

  const filteredProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      (p.businessName || "").toLowerCase().includes(q) ||
      (p.clientName || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.paymentId || "").toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (filterType === "cash") return isProjectCashPaying(p);
    if (filterType === "waiver") {
      const prov = String(p.paymentProvider || p.payment?.provider || "").toLowerCase();
      const pid = String(p.paymentId || p.payment?.paymentId || "").toLowerCase();
      return prov.includes("coupon_waiver") || pid.startsWith("waiver_pay_");
    }
    if (filterType === "unpaid") return p.paymentStatus !== "paid" && p.paymentStatus !== "partially_paid";

    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in" id="money-revenue-ledger">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold font-founder text-white tracking-wide">Money</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Cash collected, recurring subscription revenue (MRR/ARR), and waived amounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold">
            <ShieldCheck size={12} />
            Verified Single Source of Truth
          </span>
        </div>
      </div>

      {/* RECURRING REVENUE (MRR / ARR) CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
            <Repeat size={13} className="text-white" />
            Recurring Hosting Revenue
          </span>
          <span className="text-[10px] font-mono text-neutral-500">
            ARR = MRR × 12
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card: MRR */}
          <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl p-5 flex flex-col justify-between hover:border-white/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-white font-bold">MRR</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Monthly recurring revenue</p>
              </div>
              <div className="p-2 rounded-xl bg-white/10 border border-white/20 text-white">
                <Repeat size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatINR(recurringMetrics.mrr)}<span className="text-xs text-neutral-400 font-normal"> / mo</span>
              </h3>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-1">
                From {recurringMetrics.activePaidSubscriptionsCount} active recurring subscriptions
              </p>
            </div>
          </div>

          {/* Card: ARR */}
          <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl p-5 flex flex-col justify-between hover:border-white/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-white font-bold">ARR</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Annual recurring revenue</p>
              </div>
              <div className="p-2 rounded-xl bg-white/10 border border-white/20 text-white">
                <ArrowUpRight size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatINR(recurringMetrics.arr)}<span className="text-xs text-neutral-400 font-normal"> / yr</span>
              </h3>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-1">
                Annualized run-rate (MRR × 12)
              </p>
            </div>
          </div>

          {/* Card: Active Subscriptions Status */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Active Subscriptions</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Hosting subscription breakdown</p>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className="mt-4 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Active Paid Subscriptions:</span>
                <span className="text-white font-bold">{recurringMetrics.activePaidSubscriptionsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Promotional Free Trials:</span>
                <span className="text-neutral-300 font-bold">{recurringMetrics.freeTrialSubscriptionsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Suspended / Inactive:</span>
                <span className="text-neutral-500 font-bold">{recurringMetrics.suspendedSubscriptionsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CASH & WAIVERS SUMMARY CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
            <DollarSign size={13} className="text-white" />
            Website Payments &amp; Cash Overview
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Cash Collected */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Cash Collected</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatINR(totalCashCollected)}
              </h3>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-1">
                From {cashPayingCount} paying clients
              </p>
            </div>
          </div>

          {/* Card 2: Covered Projects */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Projects Covered</span>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {coveredCount} <span className="text-sm font-normal text-neutral-400">/ {projects.length}</span>
              </h3>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-1">
                Active covered accounts
              </p>
            </div>
          </div>

          {/* Card 3: Paying Clients */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Paying Clients</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CreditCard size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                {cashPayingCount}
              </h3>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-1">
                Verified Razorpay transactions
              </p>
            </div>
          </div>

          {/* Card 4: Waived */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Waived</span>
              <div className="p-2 rounded-xl bg-neutral-900 border border-white/10 text-neutral-300">
                <Tag size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatINR(totalWaivedValue)}
              </h3>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-1">
                Across {waiverCount} coupon waivers
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Transactions & Client Ledger Table */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
        
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business, client, or reference..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterType === "all" ? "bg-white text-black font-bold" : "bg-neutral-950 text-neutral-400 hover:text-white border border-white/10"
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setFilterType("cash")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterType === "cash" ? "bg-white text-black font-bold" : "bg-neutral-950 text-neutral-400 hover:text-white border border-white/10"
              }`}
            >
              Cash Paid ({cashPayingCount})
            </button>
            <button
              onClick={() => setFilterType("waiver")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterType === "waiver" ? "bg-white text-black font-bold" : "bg-neutral-950 text-neutral-400 hover:text-white border border-white/10"
              }`}
            >
              Waivers ({waiverCount})
            </button>
            <button
              onClick={() => setFilterType("unpaid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterType === "unpaid" ? "bg-white text-black font-bold" : "bg-neutral-950 text-neutral-400 hover:text-white border border-white/10"
              }`}
            >
              Unpaid ({projects.length - coveredCount})
            </button>
          </div>

        </div>

        {/* Ledger Rows */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-neutral-500">
            No transaction records match the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredProjects.map((p) => {
              const cashPaid = getProjectCashCollected(p);
              const waived = getProjectWaivedValue(p);
              const isPaid = p.paymentStatus === "paid";
              const isPartial = p.paymentStatus === "partially_paid";

              return (
                <div key={p.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  
                  {/* Left: Client & Business */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm truncate">{p.businessName || "Unnamed Business"}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-950 border border-white/10 text-neutral-400">
                        {p.selectedPackage || "Standard"}
                      </span>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        isPaid 
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                          : isPartial 
                          ? "bg-white/10 border border-white/20 text-white" 
                          : "bg-neutral-900 border border-white/10 text-neutral-500"
                      }`}>
                        {isPaid ? "Paid" : isPartial ? "50% Milestone" : "Unpaid"}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-2 font-mono">
                      <span>{p.clientName}</span>
                      <span>•</span>
                      <span>{p.email}</span>
                    </div>
                  </div>

                  {/* Middle: Method & Reference */}
                  <div className="space-y-0.5 text-xs font-mono min-w-[200px]">
                    <div className="text-neutral-300 font-medium">{formatPaymentMethod(p)}</div>
                    <div className="text-[11px] text-neutral-500 truncate">
                      Ref: <span className="text-neutral-400">{formatPaymentReference(p)}</span>
                    </div>
                    <div className="text-[10px] text-neutral-600">
                      Date: {formatDateSafe(p.purchaseDate || p.timestamp)}
                    </div>
                  </div>

                  {/* Right: Cash Paid & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 min-w-[180px] border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                    <div className="text-left md:text-right font-mono">
                      <div className="text-sm font-bold text-white">
                        {formatINR(cashPaid)}
                      </div>
                      {waived > 0 && (
                        <div className="text-[10px] text-neutral-500">
                          Waived: {formatINR(waived)}
                        </div>
                      )}
                    </div>

                    {onSelectProject && (
                      <button
                        onClick={() => onSelectProject(p.id)}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-white hover:text-black border border-white/10 text-white text-[11px] font-mono rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Workspace</span>
                        <ArrowUpRight size={12} />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
