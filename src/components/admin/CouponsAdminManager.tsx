import React, { useState, useEffect } from "react";
import { Plus, Tag, Trash2, Edit2, Play, Pause, Archive, CheckCircle2, AlertCircle, Sparkles, X, Shield, Users } from "lucide-react";

interface Coupon {
  id: string;
  name: string;
  code: string;
  discountType: "percentage" | "fixed" | "free_build";
  discountValue: number;
  eligiblePlans: string[];
  hostingRule: "charge_normally" | "waive_hosting";
  hostingPromoMode?: "use_plan_default" | "do_not_apply";
  freeHostingPromoRule?: "apply" | "do_not_apply";
  hostingPriceMode?: "use_plan_default" | "override";
  fixedHostingPrice?: number | null;
  redemptionLimit: number;
  maxUsesPerCustomer: number;
  customerEligibility: "all" | "new_only";
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  currentRedemptions: number;
  afterLimitBehavior: "stop" | "continue";
  createdAt: string;
}

interface CouponsAdminManagerProps {
  getAdminHeaders?: (extra?: Record<string, string>) => Record<string, string>;
}

export const CouponsAdminManager: React.FC<CouponsAdminManagerProps> = ({ getAdminHeaders }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed" | "free_build">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(50);
  const [eligiblePlans, setEligiblePlans] = useState<string[]>(["ignite", "fusion"]);
  const [hostingRule, setHostingRule] = useState<"charge_normally" | "waive_hosting">("charge_normally");
  const [hostingPromoMode, setHostingPromoMode] = useState<"use_plan_default" | "do_not_apply">("use_plan_default");
  const [hostingPriceMode, setHostingPriceMode] = useState<"use_plan_default" | "override">("use_plan_default");
  const [fixedHostingPrice, setFixedHostingPrice] = useState<number | null>(499);
  const [redemptionLimit, setRedemptionLimit] = useState<number>(10);
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState<number>(1);
  const [customerEligibility, setCustomerEligibility] = useState<"all" | "new_only">("new_only");
  const [status, setStatus] = useState<"ACTIVE" | "PAUSED" | "ARCHIVED">("ACTIVE");

  const getHeaders = (extra: Record<string, string> = {}) => {
    let parentHeaders = {};
    if (getAdminHeaders) {
      try {
        parentHeaders = getAdminHeaders(extra);
      } catch (e) {
        // fallback
      }
    }
    const token = localStorage.getItem("fuser_token") || sessionStorage.getItem("fuser_token") || "";
    const adminPassword = sessionStorage.getItem("fuser_admin_password") || "";
    return {
      "Authorization": `Bearer ${token}`,
      "x-admin-password": adminPassword,
      ...parentHeaders,
      ...extra
    };
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons", {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      } else {
        setError(data.error || "Failed to load coupons");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setName("");
    setCode("");
    setDiscountType("percentage");
    setDiscountValue(50);
    setEligiblePlans(["ignite", "fusion"]);
    setHostingRule("charge_normally");
    setHostingPromoMode("use_plan_default");
    setHostingPriceMode("use_plan_default");
    setFixedHostingPrice(499);
    setRedemptionLimit(10);
    setMaxUsesPerCustomer(1);
    setCustomerEligibility("new_only");
    setStatus("ACTIVE");
    setShowCreateModal(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setName(c.name);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setEligiblePlans(c.eligiblePlans || ["ignite", "fusion"]);
    setHostingRule(c.hostingRule || "charge_normally");
    setHostingPromoMode(c.hostingPromoMode || (c.freeHostingPromoRule === "do_not_apply" ? "do_not_apply" : "use_plan_default"));
    setHostingPriceMode(c.hostingPriceMode || "use_plan_default");
    setFixedHostingPrice(c.fixedHostingPrice !== undefined && c.fixedHostingPrice !== null ? c.fixedHostingPrice : 499);
    setRedemptionLimit(c.redemptionLimit ?? 10);
    setMaxUsesPerCustomer(c.maxUsesPerCustomer ?? 1);
    setCustomerEligibility(c.customerEligibility || "new_only");
    setStatus(c.status || "ACTIVE");
    setShowCreateModal(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim() || !code.trim()) {
      setError("Please fill in Offer Name and Coupon Code.");
      return;
    }

    if (eligiblePlans.length === 0) {
      setError("Please select at least one eligible plan.");
      return;
    }

    try {
      const payload = {
        name,
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: discountType === "free_build" ? 100 : Number(discountValue),
        eligiblePlans,
        hostingRule,
        hostingPromoMode,
        freeHostingPromoRule: hostingPromoMode === "do_not_apply" ? "do_not_apply" : "apply",
        hostingPriceMode,
        fixedHostingPrice: hostingPriceMode === "override" ? Number(fixedHostingPrice || 499) : null,
        redemptionLimit: Number(redemptionLimit),
        maxUsesPerCustomer: Number(maxUsesPerCustomer),
        customerEligibility,
        status,
        afterLimitBehavior: "stop"
      };

      let res;
      if (editingCoupon) {
        res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
          method: "PUT",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: getHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(editingCoupon ? "Offer updated successfully!" : "Offer created successfully!");
        setShowCreateModal(false);
        fetchCoupons();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setError(data.error || "Failed to save offer");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save offer");
    }
  };

  const [confirmModalState, setConfirmModalState] = useState<{
    title: string;
    description: string;
    primaryActionLabel?: string;
    onPrimary: () => void;
    secondaryActionLabel?: string;
    onCancel: () => void;
  } | null>(null);

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}/toggle`, {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchCoupons();
        setSuccessMsg("Offer status toggled successfully.");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setError(data.error || "We couldn't update the offer status.");
      }
    } catch (err) {
      setError("We couldn't connect to the server to update status.");
    }
  };

  const handleArchive = (id: string) => {
    setConfirmModalState({
      title: "Archive this offer?",
      description: "This stops new redemptions but preserves existing transaction history.",
      primaryActionLabel: "Archive Offer",
      onPrimary: async () => {
        setConfirmModalState(null);
        try {
          const res = await fetch(`/api/admin/coupons/${id}/archive`, {
            method: "POST",
            headers: getHeaders()
          });
          const data = await res.json();
          if (data.success) {
            fetchCoupons();
            setSuccessMsg("Offer archived successfully.");
            setTimeout(() => setSuccessMsg(null), 3000);
          } else {
            setError(data.error || "We couldn't archive this offer.");
          }
        } catch (err) {
          setError("We couldn't connect to the server.");
        }
      },
      secondaryActionLabel: "Cancel",
      onCancel: () => setConfirmModalState(null)
    });
  };

  const handleDelete = (id: string) => {
    const c = coupons.find(x => x.id === id);
    if (c && c.currentRedemptions > 0) {
      setConfirmModalState({
        title: "Cannot delete this offer",
        description: "This offer has already been used. Its history must be preserved.",
        primaryActionLabel: "Archive Offer",
        onPrimary: () => {
          setConfirmModalState(null);
          handleArchive(id);
        },
        secondaryActionLabel: "Cancel",
        onCancel: () => setConfirmModalState(null)
      });
      return;
    }

    setConfirmModalState({
      title: "Delete this offer?",
      description: "This permanently removes unredeemed promotional records.",
      primaryActionLabel: "Delete Offer",
      onPrimary: async () => {
        setConfirmModalState(null);
        try {
          const res = await fetch(`/api/admin/coupons/${id}`, {
            method: "DELETE",
            headers: getHeaders()
          });
          const data = await res.json();
          if (data.success) {
            fetchCoupons();
            setSuccessMsg("Offer deleted successfully.");
            setTimeout(() => setSuccessMsg(null), 3000);
          } else {
            if (data.error && (data.error.includes("already been used") || data.error.includes("history"))) {
              setConfirmModalState({
                title: "Cannot delete this offer",
                description: "This offer has already been used. Its history must be preserved.",
                primaryActionLabel: "Archive Offer",
                onPrimary: () => {
                  setConfirmModalState(null);
                  handleArchive(id);
                },
                secondaryActionLabel: "Cancel",
                onCancel: () => setConfirmModalState(null)
              });
            } else {
              setError(data.error || "We couldn't delete this offer.");
            }
          }
        } catch (err) {
          setError("We couldn't connect to the server.");
        }
      },
      secondaryActionLabel: "Cancel",
      onCancel: () => setConfirmModalState(null)
    });
  };

  const togglePlanSelection = (plan: string) => {
    if (eligiblePlans.includes(plan)) {
      if (eligiblePlans.length === 1) {
        setError("At least one plan must remain selected.");
        setTimeout(() => setError(null), 3000);
        return;
      }
      setEligiblePlans(eligiblePlans.filter(p => p !== plan));
    } else {
      setEligiblePlans([...eligiblePlans, plan]);
    }
  };

  const activeCoupons = coupons.filter(c => c.status === "ACTIVE" || c.status === "PAUSED");
  const archivedCoupons = coupons.filter(c => c.status === "ARCHIVED");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Tag className="text-white" size={22} /> Coupons & Offers
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage website build pricing rules, promotional discounts, and redemption limits without code deployment.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-200 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
        >
          <Plus size={16} /> Create Offer
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Offers Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Active & Paused Campaigns</h3>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading coupons...</div>
        ) : activeCoupons.length === 0 ? (
          <div className="p-8 bg-neutral-950/40 border border-neutral-900 rounded-2xl text-center">
            <p className="text-xs text-zinc-400">No active marketing offers found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCoupons.map((c) => {
              const plansText = c.eligiblePlans
                .map(p => (p === "ignite" || p === "starter" ? "Ignite" : p === "fusion" || p === "growth" ? "Fusion" : "Catalyst"))
                .join(" + ");

              const discountLabel =
                c.discountType === "free_build"
                  ? "FREE WEBSITE BUILD"
                  : c.discountType === "percentage"
                  ? `${c.discountValue}% OFF`
                  : `₹${c.discountValue} OFF`;

              return (
                <div
                  key={c.id}
                  className="bg-neutral-950/60 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-800 transition-all relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-900/40 rounded-full blur-2xl pointer-events-none group-hover:bg-neutral-800/50 transition-all" />

                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-mono tracking-wider text-white uppercase bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-800">
                          {c.code}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-2">{c.name}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-neutral-900 text-neutral-300 border-neutral-800"
                        }`}
                      >
                        ● {c.status}
                      </span>
                    </div>

                    <div className="my-4 py-3 border-y border-neutral-900 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Discount:</span>
                        <span className="font-bold text-white font-mono">{discountLabel}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Eligible Plans:</span>
                        <span className="font-medium text-zinc-300">{plansText}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Hosting Promo:</span>
                        <span className="font-medium text-zinc-300 font-mono">
                          {c.hostingRule === "waive_hosting"
                            ? "100% Waived"
                            : c.hostingPromoMode === "do_not_apply" || c.freeHostingPromoRule === "do_not_apply"
                            ? "Charge Immediately (0 Mo Free)"
                            : "Plan Free Trial"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Hosting Price:</span>
                        <span className="font-medium text-zinc-300 font-mono">
                          {c.hostingRule === "waive_hosting"
                            ? "₹0"
                            : c.hostingPriceMode === "override"
                            ? `₹${c.fixedHostingPrice}/mo`
                            : "Standard Plan Price"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Claimed:</span>
                        <span className="font-mono text-zinc-300">
                          {c.currentRedemptions} / {c.redemptionLimit === 0 ? "∞" : c.redemptionLimit} claimed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <Users size={12} /> {c.customerEligibility === "new_only" ? "New customers only" : "All customers"}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                        title="Edit Offer"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(c.id)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                        title={c.status === "ACTIVE" ? "Pause Offer" : "Activate Offer"}
                      >
                        {c.status === "ACTIVE" ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      {c.currentRedemptions > 0 ? (
                        <button
                          onClick={() => handleArchive(c.id)}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                          title="Archive Offer"
                        >
                          <Archive size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                          title="Delete Offer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Archived Section */}
      {archivedCoupons.length > 0 && (
        <div className="space-y-4 pt-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Archived Offers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedCoupons.map((c) => (
              <div key={c.id} className="bg-neutral-950/30 border border-neutral-900 rounded-2xl p-5 opacity-60">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase bg-zinc-800 px-2 py-0.5 rounded-md">
                    {c.code}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-zinc-500">Archived</span>
                </div>
                <h4 className="text-sm font-bold text-zinc-400">{c.name}</h4>
                <p className="text-xs text-zinc-600 mt-2 font-mono">{c.currentRedemptions} total redemptions recorded</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/20 rounded-2xl max-w-xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <Tag className="text-white" size={18} />
                {editingCoupon ? "Edit Marketing Offer" : "Create New Marketing Offer"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white p-1.5 rounded-lg border border-transparent hover:border-white/20 hover:bg-neutral-900 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-6">
              
              {/* SECTION 1: OFFER IDENTITY */}
              <div className="space-y-3 bg-[#050505] border border-white/10 p-4 rounded-xl">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-neutral-400 block">
                  1. Offer Identity
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-neutral-300 block">Offer Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setName(val);
                        if (!editingCoupon) {
                          setCode(val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
                        }
                      }}
                      placeholder="e.g. Founding Partner 50"
                      className="w-full bg-[#0A0A0A] border border-white/20 hover:border-white/30 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-neutral-300 block">Coupon Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FOUNDING50"
                      className="w-full bg-[#0A0A0A] border border-white/20 hover:border-white/30 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white uppercase placeholder:text-neutral-600 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DISCOUNT RULE */}
              <div className="space-y-3 bg-[#050505] border border-white/10 p-4 rounded-xl">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-neutral-400 block">
                  2. Discount Rule
                </span>

                <div className="space-y-3">
                  <label className="text-xs font-mono font-medium text-neutral-300 block">Discount Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType("percentage")}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                        discountType === "percentage"
                          ? "bg-white text-black border-white shadow-lg ring-2 ring-white/20"
                          : "bg-[#0A0A0A] border-white/10 text-neutral-400 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <span>Percentage</span>
                      <span className="text-[10px] opacity-80">% Off</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDiscountType("fixed")}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                        discountType === "fixed"
                          ? "bg-white text-black border-white shadow-lg ring-2 ring-white/20"
                          : "bg-[#0A0A0A] border-white/10 text-neutral-400 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <span>Fixed Amount</span>
                      <span className="text-[10px] opacity-80">₹ INR Off</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDiscountType("free_build")}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                        discountType === "free_build"
                          ? "bg-white text-black border-white shadow-lg ring-2 ring-white/20"
                          : "bg-[#0A0A0A] border-white/10 text-neutral-400 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <span>Free Build</span>
                      <span className="text-[10px] opacity-80">100% Waived</span>
                    </button>
                  </div>

                  {discountType !== "free_build" && (
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-mono font-medium text-neutral-300 block">
                        {discountType === "percentage" ? "Discount Percentage (%)" : "Fixed Discount Amount (₹ INR)"}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={discountType === "percentage" ? "100" : "100000"}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        className="w-full bg-[#0A0A0A] border border-white/20 hover:border-white/30 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none transition-all"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: APPLIES TO PLANS */}
              <div className="space-y-3 bg-[#050505] border border-white/10 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-neutral-400 block">
                    3. Applicable Website Plans
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {eligiblePlans.length} of 3 Selected
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "ignite", name: "Ignite", price: "₹9,999" },
                    { id: "fusion", name: "Fusion", price: "₹19,999" },
                    { id: "catalyst", name: "Catalyst", price: "₹39,999" }
                  ].map((p) => {
                    const isSelected = eligiblePlans.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlanSelection(p.id)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer min-h-[75px] ${
                          isSelected
                            ? "bg-neutral-900 border-2 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.12)]"
                            : "bg-[#0A0A0A] border-white/10 text-neutral-500 hover:border-white/25 hover:text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? "text-white" : "text-neutral-400"}`}>
                            {p.name}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            isSelected ? "bg-white text-black" : "bg-neutral-900 text-neutral-600 border border-white/5"
                          }`}>
                            {isSelected ? "✓ ON" : "OFF"}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono mt-2 ${isSelected ? "text-neutral-300 font-semibold" : "text-neutral-600"}`}>
                          {p.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: HOSTING & LIMITS */}
              <div className="space-y-4 bg-[#050505] border border-white/10 p-4 rounded-xl">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-neutral-400 block">
                  4. Hosting Rules &amp; Limits
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Control 1: Free Hosting Promotion */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-neutral-300 block">Free Hosting Promotion</label>
                    <select
                      value={hostingPromoMode}
                      onChange={(e) => setHostingPromoMode(e.target.value as any)}
                      className="w-full bg-[#0A0A0A] border border-white/20 hover:border-white/30 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer font-sans"
                    >
                      <option value="use_plan_default">Use Plan's Standard Free Hosting</option>
                      <option value="do_not_apply">Do Not Apply — Charge Immediately</option>
                    </select>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {hostingPromoMode === "use_plan_default"
                        ? "Ignite: 1 Mo Free | Fusion: 2 Mo Free | Catalyst: 3 Mo Free"
                        : "0 Mo Free (First month hosting charged at checkout)"}
                    </p>
                  </div>

                  {/* Control 2: Hosting Price */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-neutral-300 block">Hosting Price</label>
                    <select
                      value={hostingPriceMode}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setHostingPriceMode(val);
                        if (val === "override" && !fixedHostingPrice) {
                          setFixedHostingPrice(499);
                        }
                      }}
                      className="w-full bg-[#0A0A0A] border border-white/20 hover:border-white/30 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer font-sans"
                    >
                      <option value="use_plan_default">Use Plan Price (Standard)</option>
                      <option value="override">Override Hosting Price</option>
                    </select>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {hostingPriceMode === "use_plan_default"
                        ? "Standard: Ignite ₹499/mo | Fusion ₹999/mo | Catalyst ₹1,999/mo"
                        : `Custom recurring price: ₹${fixedHostingPrice || 499}/mo for all eligible plans`}
                    </p>
                  </div>
                </div>

                {/* If Override Hosting Price is selected, show presets & input */}
                {hostingPriceMode === "override" && (
                  <div className="p-3 bg-[#0A0A0A] border border-white/15 rounded-xl space-y-3">
                    <label className="text-xs font-mono font-medium text-neutral-300 block">
                      Override Monthly Hosting Price (₹ INR / mo)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {[499, 999, 1999].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFixedHostingPrice(p)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                            fixedHostingPrice === p
                              ? "bg-white text-black border-white shadow-md"
                              : "bg-neutral-900 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          ₹{p.toLocaleString("en-IN")}/mo
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <input
                        type="number"
                        min="0"
                        value={fixedHostingPrice ?? 499}
                        onChange={(e) => setFixedHostingPrice(Number(e.target.value))}
                        placeholder="e.g. 499"
                        className="w-full sm:w-48 bg-[#050505] border border-white/20 hover:border-white/30 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none transition-all"
                      />
                      <span className="text-[10px] text-neutral-500 block font-mono">
                        Monthly hosting subscription price applied to all selected plans.
                      </span>
                    </div>
                  </div>
                )}

                {/* Plan Hosting Breakdown Preview */}
                <div className="p-3 bg-[#0A0A0A]/80 border border-white/10 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block tracking-wider">
                    Plan Hosting Breakdown Preview
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "ignite", name: "Ignite", stdPrice: 499, stdFree: 1 },
                      { id: "fusion", name: "Fusion", stdPrice: 999, stdFree: 2 },
                      { id: "catalyst", name: "Catalyst", stdPrice: 1999, stdFree: 3 }
                    ].map((p) => {
                      const isSelected = eligiblePlans.includes(p.id);
                      const effPrice = hostingRule === "waive_hosting" ? 0 : (hostingPriceMode === "override" ? (fixedHostingPrice || 499) : p.stdPrice);
                      const effFree = hostingRule === "waive_hosting" ? 0 : (hostingPromoMode === "do_not_apply" ? 0 : p.stdFree);
                      const chargedToday = hostingRule !== "waive_hosting" && effFree === 0;

                      return (
                        <div
                          key={p.id}
                          className={`p-2 rounded-lg border text-xs font-mono ${
                            isSelected
                              ? "bg-neutral-900 border-white/20 text-white"
                              : "bg-neutral-950/50 border-white/5 text-neutral-600 opacity-60"
                          }`}
                        >
                          <div className="flex justify-between font-bold">
                            <span>{p.name}</span>
                            <span className="text-[10px]">{isSelected ? "ACTIVE" : "OFF"}</span>
                          </div>
                          <div className="text-[11px] mt-1 space-y-0.5">
                            <div>
                              Trial: <span className="text-white font-bold">{hostingRule === "waive_hosting" ? "Waived" : `${effFree} Mo Free`}</span>
                            </div>
                            <div>
                              Price: <span className="text-white font-bold">₹{effPrice.toLocaleString("en-IN")}/mo</span>
                            </div>
                            <div>
                              Due Today: <span className="text-white font-bold">₹{(chargedToday ? effPrice : 0).toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-neutral-300 block">Hosting Billing Rule</label>
                    <select
                      value={hostingRule}
                      onChange={(e) => setHostingRule(e.target.value as any)}
                      className="w-full bg-[#0A0A0A] border border-white/20 hover:border-white/30 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer font-sans"
                    >
                      <option value="charge_normally">Charge Normally (Standard)</option>
                      <option value="waive_hosting">Waive Hosting Completely (₹0)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-neutral-300 block">Redemption Limit</label>
                    <input
                      type="number"
                      min="0"
                      value={redemptionLimit}
                      onChange={(e) => setRedemptionLimit(Number(e.target.value))}
                      className="w-full bg-[#0A0A0A] border border-white/20 hover:border-white/30 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none transition-all"
                    />
                    <span className="text-[10px] text-neutral-500 block font-mono">0 = Unlimited</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-neutral-300 block">Customer Eligibility</label>
                    <select
                      value={customerEligibility}
                      onChange={(e) => setCustomerEligibility(e.target.value as any)}
                      className="w-full bg-[#0A0A0A] border border-white/20 hover:border-white/30 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer font-sans"
                    >
                      <option value="new_only">New Customers Only</option>
                      <option value="all">All Customers</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs font-mono font-bold text-neutral-400 hover:text-white uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg active:scale-95 font-mono"
                >
                  {editingCoupon ? "Save Changes" : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
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
                <p className="text-xs text-neutral-400 mt-0.5">Please confirm this administrative action.</p>
              </div>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-900">
              {confirmModalState.description}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={confirmModalState.onCancel || (() => setConfirmModalState(null))}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {confirmModalState.secondaryActionLabel || "Cancel"}
              </button>
              <button
                type="button"
                onClick={confirmModalState.onPrimary}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-extrabold transition-all cursor-pointer"
              >
                {confirmModalState.primaryActionLabel || "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
