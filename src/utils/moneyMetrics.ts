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
