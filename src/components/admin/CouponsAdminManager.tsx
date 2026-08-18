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
  freeHostingPromoRule: "apply" | "do_not_apply";
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
  const [freeHostingPromoRule, setFreeHostingPromoRule] = useState<"apply" | "do_not_apply">("apply");
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
    setFreeHostingPromoRule("apply");
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
    setFreeHostingPromoRule(c.freeHostingPromoRule || "apply");
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
        freeHostingPromoRule,
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="text-white" size={18} />
                {editingCoupon ? "Edit Offer" : "Create New Marketing Offer"}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">Offer Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Founding 50"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FOUNDING50"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white uppercase focus:outline-none focus:border-neutral-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="free_build">Free Website Build (100%)</option>
                  </select>
                </div>

                {discountType !== "free_build" && (
                  <div>
                    <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                      {discountType === "percentage" ? "Percentage Value" : "Amount (₹)"}
                    </label>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-neutral-700"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">Applies to Plans</label>
                <div className="flex gap-4">
                  {["ignite", "fusion", "catalyst"].map((p) => {
                    const isSelected = eligiblePlans.includes(p);
                    const label = p === "ignite" ? "Ignite" : p === "fusion" ? "Fusion" : "Catalyst";
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlanSelection(p)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isSelected
                            ? "bg-neutral-900 text-white border-neutral-700"
                            : "bg-neutral-900 text-zinc-500 border-neutral-800 hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">Hosting Rule</label>
                  <select
                    value={hostingRule}
                    onChange={(e) => setHostingRule(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
                  >
                    <option value="charge_normally">Charge normally</option>
                    <option value="waive_hosting">Waive hosting</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">Free Hosting Promo</label>
                  <select
                    value={freeHostingPromoRule}
                    onChange={(e) => setFreeHostingPromoRule(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
                  >
                    <option value="apply">Apply normal promotion</option>
                    <option value="do_not_apply">Do not apply (Charge immediately)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">Redemption Limit</label>
                  <input
                    type="number"
                    value={redemptionLimit}
                    onChange={(e) => setRedemptionLimit(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-neutral-700"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">0 for unlimited</span>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">Customer Eligibility</label>
                  <select
                    value={customerEligibility}
                    onChange={(e) => setCustomerEligibility(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700"
                  >
                    <option value="new_only">New customers only</option>
                    <option value="all">All customers</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
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
