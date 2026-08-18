/**
 * CodeFuser Authoritative Safe Formatters
 * Eliminates NaN, Invalid Date, and misleading transaction states across all dashboards.
 */

export function formatINR(val: any, fallback: string = "₹0"): string {
  if (val === null || val === undefined || val === "") {
    return fallback;
  }
  const num = typeof val === "number" ? val : Number(val);
  if (isNaN(num) || !isFinite(num)) {
    return fallback;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(num);
}

export function formatDateSafe(
  val: any, 
  options?: Intl.DateTimeFormatOptions, 
  fallback: string = "Date unavailable"
): string {
  if (!val) return fallback;
  const d = new Date(val);
  if (isNaN(d.getTime())) return fallback;
  
  const defaultOpts: Intl.DateTimeFormatOptions = options || {
    month: "short",
    day: "numeric",
    year: "numeric"
  };
  
  return d.toLocaleDateString("en-IN", defaultOpts);
}

export function formatDateTimeSafe(
  val: any,
  fallback: string = "Date unavailable"
): string {
  if (!val) return fallback;
  const d = new Date(val);
  if (isNaN(d.getTime())) return fallback;
  
  return d.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatPaymentMethod(p: any): string {
  if (!p) return "Not set";
  const provider = String(p.paymentProvider || p.payment?.provider || "").toLowerCase();
  const paymentId = String(p.paymentId || p.payment?.paymentId || "").toLowerCase();
  
  if (provider.includes("coupon_waiver") || paymentId.startsWith("waiver_pay_")) {
    return "100% Coupon Waiver";
  }
  if (provider.includes("manual")) {
    return "Manual reconciliation";
  }
  if (provider.includes("simulat") || paymentId.startsWith("sim_pay_")) {
    return "Simulation";
  }
  if (provider.includes("razorpay") || paymentId.startsWith("pay_")) {
    return "Razorpay payment";
  }
  if (p.paymentStatus === "paid") {
    return "Paid (Verified)";
  }
  if (p.paymentStatus === "partially_paid") {
    return "50% Milestone Paid";
  }
  return "Pending checkout";
}

export function formatPaymentReference(p: any): string {
  if (!p) return "Not available";
  const paymentId = String(p.paymentId || p.payment?.paymentId || "").trim();
  const provider = String(p.paymentProvider || p.payment?.provider || "").toLowerCase();
  
  if (paymentId && !paymentId.startsWith("waiver_") && !paymentId.startsWith("sim_") && !paymentId.startsWith("manual_")) {
    return paymentId;
  }
  if (provider.includes("coupon_waiver") || paymentId.startsWith("waiver_pay_")) {
    return p.couponCode ? `Waiver (${p.couponCode})` : "100% Coupon Waiver";
  }
  if (provider.includes("manual")) {
    return "Manual Override";
  }
  if (provider.includes("simulat") || paymentId.startsWith("sim_pay_")) {
    return "Simulated Reference";
  }
  if (p.paymentStatus === "unpaid" || !p.paymentStatus) {
    return "Awaiting Payment";
  }
  return paymentId || "Completed";
}
