import fs from "fs";
import path from "path";

export interface CouponRecord {
  id: string;
  name: string;
  code: string; // uppercase
  discountType: "percentage" | "fixed" | "free_build";
  discountValue: number; // e.g. 50, 20000, 100
  eligiblePlans: string[]; // e.g. ["ignite", "fusion"], ["fusion"]
  hostingRule: "charge_normally" | "waive_hosting";
  freeHostingPromoRule: "apply" | "do_not_apply";
  redemptionLimit: number; // e.g. 10 (0 for unlimited)
  maxUsesPerCustomer: number; // default 1
  customerEligibility: "all" | "new_only";
  startDate?: string;
  endDate?: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  currentRedemptions: number;
  afterLimitBehavior: "stop" | "continue";
  createdAt: string;
  updatedAt: string;
}

export interface CouponRedemptionRecord {
  id: string;
  couponCode: string;
  customerEmail: string;
  projectId: string;
  discountAmount: number;
  timestamp: string;
}

export interface CouponsStore {
  coupons: CouponRecord[];
  redemptions: CouponRedemptionRecord[];
}

const COUPONS_FILE = path.join(process.cwd(), "server", "fuser_coupons.json");

let memoryStore: CouponsStore | null = null;

export function getCouponsStore(): CouponsStore {
  if (memoryStore) {
    return memoryStore;
  }
  try {
    if (fs.existsSync(COUPONS_FILE)) {
      const raw = fs.readFileSync(COUPONS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.coupons)) {
        memoryStore = parsed;
        return memoryStore!;
      }
    }
  } catch (err) {
    console.error("[Coupons Store] Error reading coupons store:", err);
  }

  // Default seed data with initial founding offers
  const defaultStore: CouponsStore = {
    coupons: [
      {
        id: "coupon_fusion_free_1",
        name: "Fusion Founding Build",
        code: "FUSIONFREE",
        discountType: "free_build",
        discountValue: 100,
        eligiblePlans: ["fusion", "growth"],
        hostingRule: "charge_normally",
        freeHostingPromoRule: "do_not_apply",
        redemptionLimit: 10,
        maxUsesPerCustomer: 1,
        customerEligibility: "new_only",
        status: "ACTIVE",
        currentRedemptions: 0,
        afterLimitBehavior: "stop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "coupon_founding_50_1",
        name: "Founding 50",
        code: "FOUNDING50",
        discountType: "percentage",
        discountValue: 50,
        eligiblePlans: ["ignite", "starter", "fusion", "growth"],
        hostingRule: "charge_normally",
        freeHostingPromoRule: "apply",
        redemptionLimit: 10,
        maxUsesPerCustomer: 1,
        customerEligibility: "new_only",
        status: "ACTIVE",
        currentRedemptions: 0,
        afterLimitBehavior: "stop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    redemptions: []
  };

  memoryStore = defaultStore;
  saveCouponsStore(defaultStore);
  return memoryStore;
}

export function saveCouponsStore(store: CouponsStore) {
  memoryStore = store;
  try {
    const dir = path.dirname(COUPONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[Coupons Store] Error writing coupons store (using in-memory store):", err);
  }
}

export function getAllCoupons(): CouponRecord[] {
  const store = getCouponsStore();
  return store.coupons;
}

export function getCouponById(id: string): CouponRecord | null {
  const store = getCouponsStore();
  return store.coupons.find(c => c.id === id) || null;
}

export function getCouponByCode(code: string): CouponRecord | null {
  if (!code) return null;
  const store = getCouponsStore();
  const normalized = code.trim().toUpperCase();
  return store.coupons.find(c => c.code.toUpperCase() === normalized) || null;
}

export function createCoupon(data: Omit<CouponRecord, "id" | "currentRedemptions" | "createdAt" | "updatedAt">): CouponRecord {
  const store = getCouponsStore();
  const newCoupon: CouponRecord = {
    ...data,
    code: data.code.trim().toUpperCase(),
    id: `coupon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    currentRedemptions: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.coupons.push(newCoupon);
  saveCouponsStore(store);
  return newCoupon;
}

export function updateCoupon(id: string, data: Partial<CouponRecord>): CouponRecord | null {
  const store = getCouponsStore();
  const idx = store.coupons.findIndex(c => c.id === id);
  if (idx === -1) return null;

  const existing = store.coupons[idx];
  const updated: CouponRecord = {
    ...existing,
    ...data,
    code: data.code ? data.code.trim().toUpperCase() : existing.code,
    updatedAt: new Date().toISOString()
  };
  store.coupons[idx] = updated;
  saveCouponsStore(store);
  return updated;
}

export function toggleCouponStatus(id: string): CouponRecord | null {
  const store = getCouponsStore();
  const c = store.coupons.find(x => x.id === id);
  if (!c) return null;

  if (c.status === "ACTIVE") {
    c.status = "PAUSED";
  } else if (c.status === "PAUSED") {
    c.status = "ACTIVE";
  }
  c.updatedAt = new Date().toISOString();
  saveCouponsStore(store);
  return c;
}

export function archiveCoupon(id: string): CouponRecord | null {
  const store = getCouponsStore();
  const c = store.coupons.find(x => x.id === id);
  if (!c) return null;

  c.status = "ARCHIVED";
  c.updatedAt = new Date().toISOString();
  saveCouponsStore(store);
  return c;
}

export function deleteCoupon(id: string): { success: boolean; error?: string } {
  const store = getCouponsStore();
  const idx = store.coupons.findIndex(c => c.id === id);
  if (idx === -1) {
    return { success: false, error: "Coupon not found" };
  }

  const c = store.coupons[idx];
  if (c.currentRedemptions > 0) {
    return {
      success: false,
      error: "This offer has already been used. Archiving stops new uses but keeps its history. Deleting is only allowed for unused offers."
    };
  }

  store.coupons.splice(idx, 1);
  saveCouponsStore(store);
  return { success: true };
}

export function normalizePlanId(planId: string): string {
  if (!planId) return "fusion";
  const s = planId.toLowerCase().trim();
  if (s.includes("ignite") || s.includes("starter") || s.includes("499")) return "ignite";
  if (s.includes("fusion") || s.includes("growth") || s.includes("999")) return "fusion";
  if (s.includes("catalyst") || s.includes("dominance") || s.includes("1999")) return "catalyst";
  return s;
}

export function validateAndCalculateCoupon(
  code: string,
  planId: string,
  customerEmail: string,
  baseWebsitePrice: number
): { valid: boolean; error?: string; discountAmount?: number; finalWebsitePrice?: number; coupon?: CouponRecord } {
  const coupon = getCouponByCode(code);
  if (!coupon) {
    return { valid: false, error: "We couldn't find that offer." };
  }

  if (coupon.status === "PAUSED") {
    return { valid: false, error: "This offer isn't available right now." };
  }

  if (coupon.status === "ARCHIVED") {
    return { valid: false, error: "This offer has ended." };
  }

  // Date window check
  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { valid: false, error: "This offer has not started yet." };
  }
  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return { valid: false, error: "This offer has ended." };
  }

  // Plan eligibility check
  const normPlan = normalizePlanId(planId);
  const eligibleNorm = coupon.eligiblePlans.map(p => normalizePlanId(p));
  if (!eligibleNorm.includes(normPlan)) {
    return { valid: false, error: "This offer doesn't apply to this plan." };
  }

  const store = getCouponsStore();

  // Redemption limit check
  if (coupon.redemptionLimit > 0 && coupon.currentRedemptions >= coupon.redemptionLimit) {
    if (coupon.afterLimitBehavior === "stop") {
      return { valid: false, error: "This offer is no longer available (redemption limit reached)." };
    }
  }

  // Customer usage limit check
  if (customerEmail) {
    const userRedemptions = store.redemptions.filter(
      r => r.couponCode.toUpperCase() === coupon.code.toUpperCase() && r.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
    if (userRedemptions.length >= coupon.maxUsesPerCustomer) {
      return { valid: false, error: "This offer has already been used for this account." };
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "free_build" || coupon.discountValue >= 100) {
    discountAmount = baseWebsitePrice;
  } else if (coupon.discountType === "percentage") {
    discountAmount = Math.round((baseWebsitePrice * coupon.discountValue) / 100);
  } else if (coupon.discountType === "fixed") {
    discountAmount = Math.min(baseWebsitePrice, coupon.discountValue);
  }

  discountAmount = Math.max(0, Math.min(baseWebsitePrice, discountAmount));
  const finalWebsitePrice = Math.max(0, baseWebsitePrice - discountAmount);

  return {
    valid: true,
    discountAmount,
    finalWebsitePrice,
    coupon
  };
}

export function recordRedemption(code: string, customerEmail: string, projectId: string, discountAmount: number, isSimulated: boolean = false): boolean {
  const store = getCouponsStore();
  const coupon = getCouponByCode(code);
  if (!coupon) return false;

  if (!isSimulated) {
    // Atomic limit check for real redemptions
    if (coupon.redemptionLimit > 0 && coupon.currentRedemptions >= coupon.redemptionLimit) {
      if (coupon.afterLimitBehavior === "stop") {
        console.warn(`[Coupon Redemption] Rejected: Campaign redemption limit of ${coupon.redemptionLimit} already reached.`);
        return false;
      }
    }

    // Check customer usage limit again to prevent race conditions
    if (customerEmail) {
      const userRedemptions = store.redemptions.filter(
        r => r.couponCode.toUpperCase() === coupon.code.toUpperCase() && r.customerEmail.toLowerCase() === customerEmail.toLowerCase() && r.projectId === projectId
      );
      if (userRedemptions.length > 0) {
        return true;
      }
    }
  }

  store.redemptions.push({
    id: `redemp_${isSimulated ? "sim_" : ""}${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    couponCode: coupon.code,
    customerEmail: customerEmail || "unknown@customer.com",
    projectId,
    discountAmount,
    timestamp: new Date().toISOString()
  });

  if (!isSimulated) {
    coupon.currentRedemptions += 1;
    coupon.updatedAt = new Date().toISOString();
  }

  saveCouponsStore(store);
  return true;
}
