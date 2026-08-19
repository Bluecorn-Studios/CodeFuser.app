import { ProjectRecord } from "../components/dashboard/dashboardTypes";

/**
 * Authoritatively calculates real verified cash collected for a project.
 * Excludes simulations, waivers, non-cash grants, and unverified projects.
 */
export function getProjectCashCollected(p: ProjectRecord): number {
  if (!p) return 0;

  const provider = String(p.paymentProvider || p.payment?.provider || "").trim().toLowerCase();
  const paymentId = String(p.paymentId || p.payment?.paymentId || "").trim();
  const orderId = String(p.orderId || p.payment?.orderId || "").trim();
  const purchasedPlan = String(p.purchasedPlan || p.payment?.purchasedPlan || "").toLowerCase();
  
  // 1. Explicitly exclude simulations
  const isSimulated = 
    provider.includes("simulat") || 
    paymentId.startsWith("sim_pay_") || 
    orderId.startsWith("sim_order_") || 
    purchasedPlan.includes("[simulated]");
  if (isSimulated) return 0;

  // 2. Explicitly exclude full coupons & waivers
  if (provider === "coupon_waiver" || paymentId.startsWith("waiver_pay_") || orderId.startsWith("waiver_order_")) {
    return 0;
  }

  // 3. Explicitly exclude manual non-cash grants
  if (provider === "manual") {
    return 0;
  }

  // 4. Must have real payment activity or gateway provider
  const isRazorpay = provider.includes("razorpay") || paymentId.startsWith("pay_") || orderId.startsWith("order_");
  if (!isRazorpay) {
    return 0;
  }

  // 5. Must have paymentStatus of "paid" or "partially_paid"
  if (p.paymentStatus !== "paid" && p.paymentStatus !== "partially_paid") {
    return 0;
  }

  // 6. Determine the contract base price
  let basePrice = 19999;
  if (p.quote && typeof p.quote.price === "number") {
    basePrice = Math.max(0, p.quote.price);
  } else if (p.selectedPackage === "foundation") {
    basePrice = 9999;
  } else if (p.selectedPackage === "dominance") {
    basePrice = 39999;
  }

  // 7. Calculate based on payment term:
  // Case A: 50% milestone (partially paid)
  if (p.paymentStatus === "partially_paid" || (purchasedPlan.includes("milestone") && !purchasedPlan.includes("fully paid") && p.paymentStatus !== "paid")) {
    return Math.round(basePrice * 0.5);
  }

  // Case B: Fully paid (100% upfront or settled 100% milestone)
  if (p.paymentStatus === "paid") {
    // If 100% upfront without a coupon discount was chosen, standard 10% upfront discount was applied
    if (purchasedPlan.includes("upfront") && (!p.quote || !p.quote.discount || p.quote.discount === 0)) {
      return Math.round(basePrice * 0.9);
    }
    return basePrice;
  }

  return 0;
}

/**
 * Authoritatively calculates promotional waived value (coupons, full waivers, etc.)
 */
export function getProjectWaivedValue(p: ProjectRecord): number {
  if (!p) return 0;

  const provider = String(p.paymentProvider || p.payment?.provider || "").trim().toLowerCase();
  const paymentId = String(p.paymentId || p.payment?.paymentId || "").trim();

  // Full waiver provider
  if (provider === "coupon_waiver" || paymentId.startsWith("waiver_pay_")) {
    if (p.quote && p.quote.discount) return Number(p.quote.discount);
    if (p.selectedPackage === "foundation") return 9999;
    if (p.selectedPackage === "dominance") return 39999;
    return 19999;
  }

  // Standard coupon discount
  if (p.quote && p.quote.discount && Number(p.quote.discount) > 0) {
    return Number(p.quote.discount);
  }

  return 0;
}

/**
 * Returns true if the project has actual verified cash paid.
 */
export function isProjectCashPaying(p: ProjectRecord): boolean {
  return getProjectCashCollected(p) > 0;
}

/**
 * Returns true if the project has achieved financial completion/coverage (cash or waiver).
 */
export function isProjectCovered(p: ProjectRecord): boolean {
  if (!p) return false;
  return p.paymentStatus === "paid" || p.paymentStatus === "partially_paid";
}

/**
 * Hosting Subscription Status Type representation
 */
export type ClientHostingSubscriptionStatus =
  | "HOSTING_INCLUDED"
  | "FREE_TRIAL_ACTIVE"
  | "AUTOPAY_SETUP_REQUIRED"
  | "MANDATE_PENDING"
  | "AUTOPAY_ACTIVE"
  | "BILLING_DUE"
  | "PAYMENT_PROCESSING"
  | "PAID"
  | "PAYMENT_FAILED"
  | "RETRYING"
  | "GRACE_PERIOD"
  | "HOSTING_SUSPENDED"
  | "MANDATE_REVOKED"
  | "MANDATE_EXPIRED"
  | "SUBSCRIPTION_CANCELLED"
  | "SUBSCRIPTION_PAUSED"
  | "EXPIRED"
  | string;

export interface ClientRecurringRevenueMetrics {
  mrr: number;
  arr: number;
  activePaidSubscriptionsCount: number;
  totalSubscriptionsCount: number;
  freeTrialSubscriptionsCount: number;
  suspendedSubscriptionsCount: number;
}

/**
 * Authoritatively determines if a subscription is an active, billable paid recurring subscription.
 * Excludes simulations, previews, free trial periods, suspended, cancelled, or revoked subscriptions.
 */
export function isHostingSubscriptionActiveRecurring(sub: any): boolean {
  if (!sub) return false;

  // Exclude simulations & previews
  const idStr = String(sub.id || "").toLowerCase();
  const projStr = String(sub.projectId || "").toLowerCase();
  if (
    idStr.startsWith("sim_") ||
    projStr.startsWith("prev_") ||
    projStr.includes("simulation") ||
    sub.isSimulated === true
  ) {
    return false;
  }

  // Active billable recurring statuses
  const activeStatuses = [
    "AUTOPAY_ACTIVE",
    "PAID",
    "BILLING_DUE",
    "RETRYING",
    "PAYMENT_PROCESSING",
    "GRACE_PERIOD",
  ];

  return activeStatuses.includes(sub.status);
}

/**
 * Authoritatively gets monthly recurring hosting price for a subscription record.
 */
export function getHostingSubscriptionMonthlyAmount(sub: any): number {
  if (!isHostingSubscriptionActiveRecurring(sub)) {
    return 0;
  }

  if (typeof sub.monthlyAmount === "number" && sub.monthlyAmount > 0 && !isNaN(sub.monthlyAmount)) {
    return Math.max(0, Math.round(sub.monthlyAmount));
  }

  const pkg = String(sub.packageId || "").toLowerCase();
  if (pkg.includes("foundation") || pkg.includes("ignite")) return 499;
  if (pkg.includes("dominance") || pkg.includes("catalyst")) return 1999;
  if (pkg.includes("growth") || pkg.includes("fusion")) return 999;

  return 0;
}

/**
 * Helper to extract hosting subscription from a ProjectRecord
 */
export function getProjectHostingSubscription(p: ProjectRecord): any | null {
  if (!p) return null;
  return p.payment?.hostingSubscription || (p as any).hostingSubscription || null;
}

/**
 * Authoritatively calculates recurring hosting revenue metrics (MRR & ARR)
 * from a list of subscription records or admin hosting list items.
 * MRR = Sum of monthly recurring hosting amounts from currently active PAID recurring subscriptions.
 * ARR = MRR * 12.
 */
export function calculateHostingRecurringRevenue(items: any[]): ClientRecurringRevenueMetrics {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      mrr: 0,
      arr: 0,
      activePaidSubscriptionsCount: 0,
      totalSubscriptionsCount: 0,
      freeTrialSubscriptionsCount: 0,
      suspendedSubscriptionsCount: 0,
    };
  }

  let mrr = 0;
  let activePaidCount = 0;
  let freeTrialCount = 0;
  let suspendedCount = 0;

  for (const item of items) {
    if (!item) continue;
    // item may be a HostingSubscriptionRecord or an AdminHostingItem with .subscription or a ProjectRecord
    const sub = item.subscription || (item.payment?.hostingSubscription ? item.payment.hostingSubscription : (item.id && (item.monthlyAmount !== undefined || item.status) ? item : (item as any).hostingSubscription));
    if (!sub) continue;

    const idStr = String(sub.id || item.id || "").toLowerCase();
    const projStr = String(sub.projectId || item.projectId || item.id || "").toLowerCase();
    if (
      idStr.startsWith("sim_") ||
      projStr.startsWith("prev_") ||
      projStr.includes("simulation") ||
      sub.isSimulated === true ||
      item.isSimulated === true
    ) {
      continue;
    }

    if (sub.status === "FREE_TRIAL_ACTIVE" || sub.status === "FREE_PROMO_ACTIVE" || sub.status === "TRIAL_ACTIVE") {
      freeTrialCount++;
    } else if (
      sub.status === "HOSTING_SUSPENDED" ||
      sub.status === "SUBSCRIPTION_CANCELLED" ||
      sub.status === "EXPIRED" ||
      sub.status === "MANDATE_REVOKED" ||
      sub.status === "MANDATE_EXPIRED" ||
      sub.status === "SUBSCRIPTION_PAUSED"
    ) {
      suspendedCount++;
    }

    if (isHostingSubscriptionActiveRecurring(sub)) {
      const amount = getHostingSubscriptionMonthlyAmount(sub);
      if (amount > 0) {
        mrr += amount;
        activePaidCount++;
      }
    }
  }

  const arr = mrr * 12;

  return {
    mrr,
    arr,
    activePaidSubscriptionsCount: activePaidCount,
    totalSubscriptionsCount: items.length,
    freeTrialSubscriptionsCount: freeTrialCount,
    suspendedSubscriptionsCount: suspendedCount,
  };
}
