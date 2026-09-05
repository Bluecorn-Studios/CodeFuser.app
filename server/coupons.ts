import { getSupabase } from "./supabase.js";
import { getHostingPlanConfig } from "./hosting_model.js";
import { isProjectIdPreview, getPreviewProjectsForUser } from "./preview_store.js";

export interface CouponRecord {
  id: string;
  name: string;
  code: string; // uppercase
  discountType: "percentage" | "fixed" | "free_build";
  discountValue: number; // e.g. 50, 20000, 100
  eligiblePlans: string[]; // e.g. ["ignite", "fusion"], ["fusion"]
  hostingRule: "charge_normally" | "waive_hosting";
  hostingPromoMode?: "use_plan_default" | "do_not_apply";
  freeHostingPromoRule?: "apply" | "do_not_apply";
  hostingPriceMode?: "use_plan_default" | "override";
  fixedHostingPrice?: number | null;
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

export const SYSTEM_COUPONS_ROW_ID = "c0090000-0000-0000-0000-000000000001";

let memoryStore: CouponsStore | null = null;
let initPromise: Promise<CouponsStore> | null = null;

/**
 * Initializes and synchronizes coupon store from durable Supabase storage.
 * Authoritative single source of truth:
 * - NEVER creates or injects starter/mock/demo coupons.
 * - If the database contains 0 coupons, the authoritative store is [] (empty array).
 * - Loads exactly what is stored in the database.
 */
export async function initCouponsStore(): Promise<CouponsStore> {
  if (memoryStore) {
    return memoryStore;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const supabase = getSupabase();

      // 1. Query durable Supabase system record (Authoritative Source of Truth)
      const { data: sysRecord, error: sysErr } = await supabase
        .from("projects")
        .select("*")
        .eq("id", SYSTEM_COUPONS_ROW_ID)
        .maybeSingle();

      if (sysRecord) {
        // Authoritative load: Load EXACTLY what is stored in the database.
        const storeCoupons: CouponRecord[] = Array.isArray(sysRecord.onboarding?.coupons) ? sysRecord.onboarding.coupons : [];
        const storeRedemptions: CouponRedemptionRecord[] = Array.isArray(sysRecord.onboarding?.redemptions) ? sysRecord.onboarding.redemptions : [];

        memoryStore = {
          coupons: storeCoupons,
          redemptions: storeRedemptions
        };
        console.log(`[Coupons Store] Loaded ${storeCoupons.length} coupons from Supabase durable storage.`);
        return memoryStore;
      }

      // 2. Initialize empty system store record if it does not exist yet (NO default/starter coupons)
      console.log("[Coupons Store] Creating clean empty system coupon store in Supabase...");
      const newStore: CouponsStore = {
        coupons: [],
        redemptions: []
      };

      await supabase.from("projects").upsert({
        id: SYSTEM_COUPONS_ROW_ID,
        client_name: "System Coupon Store",
        business_name: "CodeFuser Global Coupons",
        email: "coupons@codefuser.com",
        whatsapp: "+919999999999",
        selected_package: "Ignite",
        ownership_choice: "buyout",
        status: "draft",
        onboarding: {
          isSystemCouponsStore: true,
          coupons: [],
          redemptions: []
        }
      });

      memoryStore = newStore;
      return memoryStore;
    } catch (err: any) {
      console.error("[Coupons Store] Error during Supabase coupon initialization:", err);
      if (memoryStore) {
        return memoryStore;
      }
      throw new Error(`Failed to initialize authoritative coupon store: ${err.message || err}`);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/**
 * Durably saves coupon store to Supabase system record.
 * Authoritative single-record upsert (fast, atomic, non-blocking).
 */
export async function saveCouponsToSupabase(store: CouponsStore): Promise<void> {
  memoryStore = {
    coupons: store.coupons || [],
    redemptions: store.redemptions || []
  };

  try {
    const supabase = getSupabase();

    // Write to authoritative Supabase system record
    const { error } = await supabase.from("projects").upsert({
      id: SYSTEM_COUPONS_ROW_ID,
      client_name: "System Coupon Store",
      business_name: "CodeFuser Global Coupons",
      email: "coupons@codefuser.com",
      whatsapp: "+919999999999",
      selected_package: "Ignite",
      ownership_choice: "buyout",
      status: "draft",
      onboarding: {
        isSystemCouponsStore: true,
        coupons: memoryStore.coupons,
        redemptions: memoryStore.redemptions
      }
    });

    if (error) {
      throw new Error(`Supabase coupon store upsert failed: ${error.message}`);
    }
  } catch (err: any) {
    console.error("[Coupons Store] Error saving coupons to Supabase:", err.message || err);
    throw err;
  }
}

/**
 * Authoritative synchronous getter.
 */
export function getCouponsStore(): CouponsStore {
  if (memoryStore) {
    return memoryStore;
  }
  // Trigger background initialization if not yet completed
  initCouponsStore().catch(console.error);

  return {
    coupons: [],
    redemptions: []
  };
}

/**
 * Synchronous save helper (dispatches durable write to Supabase).
 */
export function saveCouponsStore(store: CouponsStore) {
  memoryStore = store;
  saveCouponsToSupabase(store).catch(err => {
    console.error("[Coupons Store] Async Supabase sync failed:", err);
  });
}

// -------------------------------------------------------------
// CRUD Operations
// -------------------------------------------------------------

export function getAllCoupons(): CouponRecord[] {
  const store = getCouponsStore();
  return store.coupons;
}

export async function getAllCouponsAsync(): Promise<CouponRecord[]> {
  const store = await initCouponsStore();
  return store.coupons;
}

export function getCouponById(id: string): CouponRecord | null {
  const store = getCouponsStore();
  return store.coupons.find(c => c.id === id) || null;
}

export async function getCouponByIdAsync(id: string): Promise<CouponRecord | null> {
  const store = await initCouponsStore();
  return store.coupons.find(c => c.id === id) || null;
}

export function getCouponByCode(code: string): CouponRecord | null {
  if (!code) return null;
  const store = getCouponsStore();
  const normalized = code.trim().toUpperCase();
  return store.coupons.find(c => c.code.toUpperCase() === normalized) || null;
}

export async function getCouponByCodeAsync(code: string): Promise<CouponRecord | null> {
  if (!code) return null;
  const store = await initCouponsStore();
  const normalized = code.trim().toUpperCase();
  return store.coupons.find(c => c.code.toUpperCase() === normalized) || null;
}

export function createCoupon(data: Omit<CouponRecord, "id" | "currentRedemptions" | "createdAt" | "updatedAt">): CouponRecord | null {
  try {
    const store = getCouponsStore();
    const normalizedCode = data.code.trim().toUpperCase();
    if (store.coupons.some(c => c.code.toUpperCase() === normalizedCode)) {
      return null;
    }
    const newCoupon: CouponRecord = {
      ...data,
      code: normalizedCode,
      id: `coupon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      currentRedemptions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.coupons.push(newCoupon);
    saveCouponsStore(store);

    return newCoupon;
  } catch (err) {
    console.error("[Coupons Store] Error creating coupon:", err);
    return null;
  }
}

export async function createCouponAsync(data: Omit<CouponRecord, "id" | "currentRedemptions" | "createdAt" | "updatedAt">): Promise<CouponRecord | null> {
  const store = await initCouponsStore();
  const normalizedCode = data.code.trim().toUpperCase();
  if (store.coupons.some(c => c.code.toUpperCase() === normalizedCode)) {
    return null;
  }
  const newCoupon: CouponRecord = {
    ...data,
    code: normalizedCode,
    id: `coupon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    currentRedemptions: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.coupons.push(newCoupon);
  await saveCouponsToSupabase(store);
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

export async function updateCouponAsync(id: string, data: Partial<CouponRecord>): Promise<CouponRecord | null> {
  const store = await initCouponsStore();
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
  await saveCouponsToSupabase(store);
  return updated;
}

export function toggleCouponStatus(id: string): CouponRecord | null {
  const store = getCouponsStore();
  const c = store.coupons.find(x => x.id === id);
  if (!c) return null;

  c.status = c.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
  c.updatedAt = new Date().toISOString();
  saveCouponsStore(store);
  return c;
}

export async function toggleCouponStatusAsync(id: string): Promise<CouponRecord | null> {
  const store = await initCouponsStore();
  const c = store.coupons.find(x => x.id === id);
  if (!c) return null;

  c.status = c.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
  c.updatedAt = new Date().toISOString();
  await saveCouponsToSupabase(store);
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

export async function archiveCouponAsync(id: string): Promise<CouponRecord | null> {
  const store = await initCouponsStore();
  const c = store.coupons.find(x => x.id === id);
  if (!c) return null;

  c.status = "ARCHIVED";
  c.updatedAt = new Date().toISOString();
  await saveCouponsToSupabase(store);
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

export async function deleteCouponAsync(id: string): Promise<{ success: boolean; error?: string }> {
  const store = await initCouponsStore();
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
  await saveCouponsToSupabase(store);

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

export interface CouponValidationOptions {
  isExistingCustomer?: boolean;
  currentProjectId?: string;
}

/**
 * Validates a coupon code and returns the complete calculation breakdown.
 */
export function validateAndCalculateCoupon(
  code: string,
  planId: string,
  customerEmail: string,
  baseWebsitePrice: number,
  baseHostingPrice: number,
  options?: CouponValidationOptions
): {
  valid: boolean;
  error?: string;
  discountAmount?: number;
  finalWebsitePrice?: number;
  hostingWaived?: boolean;
  hostingDiscountAmount?: number;
  finalHostingPrice?: number;
  effectiveMonthlyHostingPrice?: number;
  freeHostingMonths?: number;
  firstMonthHostingCharged?: boolean;
  finalTotal?: number;
  coupon?: CouponRecord;
} {
  // 1. Coupon existence check
  const coupon = getCouponByCode(code);
  if (!coupon) {
    return { valid: false, error: "We couldn't find that offer." };
  }

  // 2. Active status check
  if (coupon.status === "PAUSED") {
    return { valid: false, error: "This offer isn't available right now." };
  }

  if (coupon.status === "ARCHIVED") {
    return { valid: false, error: "This offer has ended." };
  }

  // 3. Date window check
  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { valid: false, error: "This offer has not started yet." };
  }
  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return { valid: false, error: "This offer has ended." };
  }

  // 4. Plan eligibility check
  const normPlan = normalizePlanId(planId);
  const eligibleNorm = coupon.eligiblePlans.map(p => normalizePlanId(p));
  if (!eligibleNorm.includes(normPlan)) {
    return { valid: false, error: "This offer doesn't apply to this plan." };
  }

  // 5. Customer eligibility check
  if (coupon.customerEligibility === "new_only") {
    if (options?.isExistingCustomer === true) {
      return { valid: false, error: "This offer is valid for new customers only." };
    }
  }

  const store = getCouponsStore();

  // 6. Redemption limit check
  if (coupon.redemptionLimit > 0 && coupon.currentRedemptions >= coupon.redemptionLimit) {
    if (coupon.afterLimitBehavior === "stop") {
      return { valid: false, error: "This offer is no longer available (redemption limit reached)." };
    }
  }

  // 7. Customer usage limit check
  if (customerEmail) {
    const userRedemptions = store.redemptions.filter(
      r => r.couponCode.toUpperCase() === coupon.code.toUpperCase() && r.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
    if (userRedemptions.length >= coupon.maxUsesPerCustomer) {
      return { valid: false, error: "This offer has already been used for this account." };
    }
  }

  // 8. Calculate website discount
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

  // 9. Calculate hosting terms cleanly using two independent controls:
  // A. Determine authoritative plan defaults
  let planConfig: ReturnType<typeof getHostingPlanConfig>;
  try {
    planConfig = getHostingPlanConfig(planId);
  } catch {
    planConfig = {
      packageId: "growth",
      planName: "Fusion",
      monthlyHostingPrice: typeof baseHostingPrice === "number" && baseHostingPrice > 0 ? baseHostingPrice : 999,
      freeHostingMonths: 2,
      domainFreeYears: 1,
      domainRenewalPrice: 999,
      currency: "INR",
      razorpayPlanId: "plan_fusion"
    };
  }

  const hostingWaived = coupon.hostingRule === "waive_hosting";

  // B. Effective Monthly Hosting Price (recurring price after free months)
  let effectiveMonthlyHostingPrice: number;
  if (hostingWaived) {
    effectiveMonthlyHostingPrice = 0;
  } else if (coupon.hostingPriceMode === "override" && typeof coupon.fixedHostingPrice === "number" && coupon.fixedHostingPrice >= 0) {
    effectiveMonthlyHostingPrice = coupon.fixedHostingPrice;
  } else {
    effectiveMonthlyHostingPrice = planConfig.monthlyHostingPrice;
  }

  // C. Free Hosting Months
  const isPromoDisabled = coupon.hostingPromoMode === "do_not_apply" || coupon.freeHostingPromoRule === "do_not_apply";
  let freeHostingMonths: number;
  if (hostingWaived) {
    freeHostingMonths = 0; // Completely waived
  } else if (isPromoDisabled) {
    freeHostingMonths = 0;
  } else {
    freeHostingMonths = planConfig.freeHostingMonths;
  }

  // D. First Month Hosting Charged today during checkout
  const firstMonthHostingCharged = !hostingWaived && freeHostingMonths === 0;

  // E. Final Hosting Price due TODAY at checkout
  const dueTodayHostingPrice = firstMonthHostingCharged ? effectiveMonthlyHostingPrice : 0;
  const hostingDiscountAmount = hostingWaived
    ? planConfig.monthlyHostingPrice
    : (dueTodayHostingPrice === 0 ? planConfig.monthlyHostingPrice : 0);

  // 10. Final total
  const finalTotal = finalWebsitePrice + dueTodayHostingPrice;

  return {
    valid: true,
    discountAmount,
    finalWebsitePrice,
    hostingWaived,
    hostingDiscountAmount,
    finalHostingPrice: dueTodayHostingPrice,
    effectiveMonthlyHostingPrice,
    freeHostingMonths,
    firstMonthHostingCharged,
    finalTotal,
    coupon
  };
}

/**
 * Fast, targeted customer eligibility check.
 * Queries ONLY whether a qualifying prior paid or active project exists for this email/user ID.
 * Returns immediately as soon as a qualifying match is confirmed (limit 10).
 * Never loads all projects or triggers hosting calculations.
 */
export async function isCustomerExisting(
  email?: string,
  userId?: string,
  currentProjectId?: string,
  isPreview?: boolean,
  reqId: string = "N/A"
): Promise<boolean> {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanUserId = String(userId || "").trim();

  if (!cleanEmail && !cleanUserId) return false;

  // 1. Preview store isolation check
  if (isPreview || (currentProjectId && isProjectIdPreview(currentProjectId))) {
    const previewProjects = cleanUserId ? getPreviewProjectsForUser(cleanUserId) : [];
    const priorProjects = previewProjects.filter(p => p.id !== currentProjectId);
    return priorProjects.some(
      p => p.paymentStatus === "paid" || p.paymentStatus === "partially_paid" || (p.status && p.status !== "draft")
    );
  }

  // 2. Fast targeted query to Supabase (limit 10, minimal columns)
  try {
    const supabase = getSupabase();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validUserId = cleanUserId && cleanUserId !== "undefined" && cleanUserId !== "null" && uuidRegex.test(cleanUserId) ? cleanUserId : undefined;
    const validEmail = cleanEmail && cleanEmail !== "undefined" && cleanEmail !== "null" ? cleanEmail : undefined;

    let query = supabase
      .from("projects")
      .select("id, status, payment_status, email, user_id")
      .neq("id", SYSTEM_COUPONS_ROW_ID);

    if (validUserId && validEmail) {
      query = query.or(`user_id.eq.${validUserId},email.eq.${validEmail}`);
    } else if (validUserId) {
      query = query.eq("user_id", validUserId);
    } else if (validEmail) {
      query = query.eq("email", validEmail);
    } else {
      return false;
    }

    const { data, error } = await query.limit(10);
    if (error) {
      console.warn(`[Customer Eligibility] Query warning (${reqId}): ${error.message}`);
      return false;
    }

    if (!data || data.length === 0) {
      return false;
    }

    const prior = data.filter((row: any) => row.id !== currentProjectId);
    return prior.some(
      (row: any) =>
        row.payment_status === "paid" ||
        row.payment_status === "partially_paid" ||
        (row.status && row.status !== "draft")
    );
  } catch (err: any) {
    console.warn(`[Customer Eligibility] Fast check error (${reqId}):`, err.message || err);
    return false;
  }
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

export async function recordRedemptionAsync(code: string, customerEmail: string, projectId: string, discountAmount: number, isSimulated: boolean = false): Promise<boolean> {
  const store = await initCouponsStore();
  const coupon = store.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  if (!coupon) return false;

  if (!isSimulated) {
    if (coupon.redemptionLimit > 0 && coupon.currentRedemptions >= coupon.redemptionLimit) {
      if (coupon.afterLimitBehavior === "stop") {
        console.warn(`[Coupon Redemption] Rejected: Campaign redemption limit of ${coupon.redemptionLimit} already reached.`);
        return false;
      }
    }

    if (customerEmail) {
      const userRedemptions = store.redemptions.filter(
        r => r.couponCode.toUpperCase() === coupon.code.toUpperCase() && r.customerEmail.toLowerCase() === customerEmail.toLowerCase() && r.projectId === projectId
      );
      if (userRedemptions.length > 0) {
        return true;
      }
    }
  }

  const newRedemption: CouponRedemptionRecord = {
    id: `redemp_${isSimulated ? "sim_" : ""}${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    couponCode: coupon.code,
    customerEmail: customerEmail || "unknown@customer.com",
    projectId,
    discountAmount,
    timestamp: new Date().toISOString()
  };
  store.redemptions.push(newRedemption);

  if (!isSimulated) {
    coupon.currentRedemptions += 1;
    coupon.updatedAt = new Date().toISOString();
  }

  await saveCouponsToSupabase(store);
  return true;
}
