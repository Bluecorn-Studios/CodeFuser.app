import fs from "fs";
import path from "path";
import { getSupabase } from "./supabase.js";
import { getHostingPlanConfig } from "./hosting_model.js";
import { getProjects } from "./db.js";
import { isProjectIdPreview, getPreviewProjectsForUser } from "./preview_store.js";

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
  seedInitialized?: boolean;
  seededAt?: string;
}

export const SYSTEM_COUPONS_ROW_ID = "c0090000-0000-0000-0000-000000000001";
const COUPONS_FILE = path.join(process.cwd(), "server", "fuser_coupons.json");

export const INITIAL_STARTER_COUPONS: CouponRecord[] = [
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
    createdAt: "2026-08-19T07:50:50.978Z",
    updatedAt: "2026-08-19T07:50:50.978Z"
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
    createdAt: "2026-08-19T07:50:50.978Z",
    updatedAt: "2026-08-19T07:50:50.978Z"
  },
  {
    id: "coupon_full_waiver_1",
    name: "Full Platform Waiver",
    code: "FULLWAIVER",
    discountType: "free_build",
    discountValue: 100,
    eligiblePlans: ["ignite", "starter", "fusion", "growth", "catalyst", "dominance"],
    hostingRule: "waive_hosting",
    freeHostingPromoRule: "apply",
    redemptionLimit: 10,
    maxUsesPerCustomer: 1,
    customerEligibility: "new_only",
    status: "ACTIVE",
    currentRedemptions: 0,
    afterLimitBehavior: "stop",
    createdAt: "2026-08-19T07:50:50.978Z",
    updatedAt: "2026-08-19T07:50:50.978Z"
  }
];

let memoryStore: CouponsStore | null = null;
let initPromise: Promise<CouponsStore> | null = null;

/**
 * Initializes and synchronizes coupon store from durable Supabase storage.
 * Enforces one-time idempotent seeding.
 */
export async function initCouponsStore(): Promise<CouponsStore> {
  if (memoryStore && memoryStore.seedInitialized) {
    return memoryStore;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const supabase = getSupabase();

      // 1. Check if dedicated public.coupons table exists
      try {
        const { data: tableData, error: tableErr } = await supabase.from("coupons").select("*");
        if (!tableErr && Array.isArray(tableData)) {
          const coupons: CouponRecord[] = tableData.map((row: any) => ({
            id: row.id,
            name: row.name,
            code: (row.code || "").toUpperCase(),
            discountType: row.discount_type,
            discountValue: Number(row.discount_value) || 0,
            eligiblePlans: row.eligible_plans || ["ignite", "fusion"],
            hostingRule: row.hosting_rule || "charge_normally",
            freeHostingPromoRule: row.free_hosting_promo_rule || "apply",
            redemptionLimit: Number(row.redemption_limit) || 10,
            maxUsesPerCustomer: Number(row.max_uses_per_customer) || 1,
            customerEligibility: row.customer_eligibility || "new_only",
            startDate: row.start_date || undefined,
            endDate: row.end_date || undefined,
            status: row.status || "ACTIVE",
            currentRedemptions: Number(row.current_redemptions) || 0,
            afterLimitBehavior: row.after_limit_behavior || "stop",
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString()
          }));

          let redemptions: CouponRedemptionRecord[] = [];
          const { data: redData } = await supabase.from("coupon_redemptions").select("*");
          if (Array.isArray(redData)) {
            redemptions = redData.map((r: any) => ({
              id: r.id,
              couponCode: r.coupon_code,
              customerEmail: r.customer_email,
              projectId: r.project_id,
              discountAmount: Number(r.discount_amount) || 0,
              timestamp: r.created_at || new Date().toISOString()
            }));
          }

          memoryStore = {
            coupons,
            redemptions,
            seedInitialized: true,
            seededAt: new Date().toISOString()
          };
          saveCouponsStore(memoryStore);
          console.log(`[Coupons Store] Loaded ${coupons.length} coupons from Supabase public.coupons table.`);
          return memoryStore;
        }
      } catch (tableCheckErr) {
        // Fall through to system record store
      }

      // 2. Query durable Supabase system record
      const { data: sysRecord, error: sysErr } = await supabase
        .from("projects")
        .select("*")
        .eq("id", SYSTEM_COUPONS_ROW_ID)
        .maybeSingle();

      if (sysRecord && sysRecord.onboarding && sysRecord.onboarding.seedInitialized === true) {
        // AUTHORITATIVE: Database has already been seeded. NEVER recreate deleted coupons.
        const storeCoupons = Array.isArray(sysRecord.onboarding.coupons) ? sysRecord.onboarding.coupons : [];
        const storeRedemptions = Array.isArray(sysRecord.onboarding.redemptions) ? sysRecord.onboarding.redemptions : [];
        memoryStore = {
          coupons: storeCoupons,
          redemptions: storeRedemptions,
          seedInitialized: true,
          seededAt: sysRecord.onboarding.seededAt || new Date().toISOString()
        };
        console.log(`[Coupons Store] Loaded ${storeCoupons.length} coupons from Supabase durable storage.`);
        return memoryStore;
      }

      // 3. First-time initialization / migration into Supabase
      console.log("[Coupons Store] First-time initialization in Supabase durable storage...");
      let initialCoupons: CouponRecord[] = [];

      // Check if local fuser_coupons.json exists to migrate existing custom records
      if (fs.existsSync(COUPONS_FILE)) {
        try {
          const raw = fs.readFileSync(COUPONS_FILE, "utf-8");
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.coupons) && parsed.coupons.length > 0) {
            initialCoupons = parsed.coupons;
            console.log(`[Coupons Store] Migrated ${initialCoupons.length} existing coupons from local JSON into Supabase.`);
          }
        } catch (migErr) {
          console.warn("[Coupons Store] Local JSON parse error during migration:", migErr);
        }
      }

      if (initialCoupons.length === 0) {
        initialCoupons = [...INITIAL_STARTER_COUPONS];
        console.log("[Coupons Store] Seeded initial starter offers into Supabase (FUSIONFREE, FOUNDING50, FULLWAIVER).");
      }

      const newStore: CouponsStore = {
        coupons: initialCoupons,
        redemptions: [],
        seedInitialized: true,
        seededAt: new Date().toISOString()
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
          seedInitialized: true,
          seededAt: newStore.seededAt,
          coupons: newStore.coupons,
          redemptions: newStore.redemptions
        }
      });

      memoryStore = newStore;
      return memoryStore;
    } catch (err: any) {
      console.error("[Coupons Store] Fatal error during Supabase coupon initialization:", err);
      // Resilient fallback to starter data in memory if Supabase unreachable
      if (!memoryStore) {
        memoryStore = {
          coupons: [...INITIAL_STARTER_COUPONS],
          redemptions: [],
          seedInitialized: true,
          seededAt: new Date().toISOString()
        };
      }
      return memoryStore;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/**
 * Durably saves coupon store to Supabase.
 */
export async function saveCouponsToSupabase(store: CouponsStore): Promise<void> {
  memoryStore = {
    ...store,
    seedInitialized: true,
    seededAt: store.seededAt || new Date().toISOString()
  };
  saveCouponsStore(memoryStore);

  try {
    const supabase = getSupabase();

    // 1. Write to authoritative Supabase system record
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
        seedInitialized: true,
        seededAt: memoryStore.seededAt,
        coupons: memoryStore.coupons,
        redemptions: memoryStore.redemptions
      }
    });

    // 2. If dedicated table exists, attempt sync
    try {
      for (const c of store.coupons) {
        await supabase.from("coupons").upsert({
          id: c.id,
          name: c.name,
          code: c.code.toUpperCase(),
          discount_type: c.discountType,
          discount_value: c.discountValue,
          eligible_plans: c.eligiblePlans,
          hosting_rule: c.hostingRule,
          free_hosting_promo_rule: c.freeHostingPromoRule,
          redemption_limit: c.redemptionLimit,
          max_uses_per_customer: c.maxUsesPerCustomer,
          customer_eligibility: c.customerEligibility,
          start_date: c.startDate || null,
          end_date: c.endDate || null,
          status: c.status,
          current_redemptions: c.currentRedemptions,
          after_limit_behavior: c.afterLimitBehavior,
          created_at: c.createdAt,
          updated_at: c.updatedAt
        });
      }
    } catch {
      // Best-effort table sync
    }
  } catch (err: any) {
    console.error("[Coupons Store] Error saving coupons to Supabase:", err.message || err);
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

  // Return empty or fallback while initialization finishes
  return {
    coupons: [],
    redemptions: [],
    seedInitialized: true
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

  if (c.status === "ACTIVE") {
    c.status = "PAUSED";
  } else if (c.status === "PAUSED") {
    c.status = "ACTIVE";
  }
  c.updatedAt = new Date().toISOString();
  saveCouponsStore(store);
  return c;
}

export async function toggleCouponStatusAsync(id: string): Promise<CouponRecord | null> {
  const store = await initCouponsStore();
  const c = store.coupons.find(x => x.id === id);
  if (!c) return null;

  if (c.status === "ACTIVE") {
    c.status = "PAUSED";
  } else if (c.status === "PAUSED") {
    c.status = "ACTIVE";
  }
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

  const deletedCoupon = store.coupons[idx];
  store.coupons.splice(idx, 1);
  await saveCouponsToSupabase(store);

  // If table exists, delete row as well
  try {
    const supabase = getSupabase();
    await supabase.from("coupons").delete().eq("id", deletedCoupon.id);
  } catch {
    // Best-effort table delete
  }

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

export function validateAndCalculateCoupon(
  code: string,
  planId: string,
  customerEmail: string,
  baseWebsitePrice: number,
  baseHostingPrice?: number,
  options?: CouponValidationOptions
): {
  valid: boolean;
  error?: string;
  discountAmount?: number;
  finalWebsitePrice?: number;
  hostingWaived?: boolean;
  hostingDiscountAmount?: number;
  finalHostingPrice?: number;
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

  // 8. Calculate discount
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

  // 9. Calculate hosting waiver using authoritative getHostingPlanConfig
  let effectiveHostingPrice: number;
  if (typeof baseHostingPrice === "number" && !isNaN(baseHostingPrice) && baseHostingPrice >= 0) {
    effectiveHostingPrice = baseHostingPrice;
  } else {
    try {
      effectiveHostingPrice = getHostingPlanConfig(planId).monthlyHostingPrice;
    } catch {
      effectiveHostingPrice = 999;
    }
  }

  const hostingWaived = coupon.hostingRule === "waive_hosting";
  const hostingDiscountAmount = hostingWaived ? effectiveHostingPrice : 0;
  const finalHostingPrice = hostingWaived ? 0 : effectiveHostingPrice;

  // 10. Final total
  const finalTotal = finalWebsitePrice + finalHostingPrice;

  return {
    valid: true,
    discountAmount,
    finalWebsitePrice,
    hostingWaived,
    hostingDiscountAmount,
    finalHostingPrice,
    finalTotal,
    coupon
  };
}

/**
 * Authoritatively determines if a customer already exists in Supabase DB or Preview Store.
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
    return priorProjects.length > 0;
  }

  // 2. Production Supabase check
  try {
    const projects = await getProjects(reqId, {
      email: cleanEmail || undefined,
      userId: cleanUserId || undefined
    });
    const priorProjects = projects.filter(p => p.id !== currentProjectId);
    return priorProjects.some(
      p => p.paymentStatus === "paid" || p.paymentStatus === "partially_paid" || (p.status && p.status !== "draft")
    );
  } catch (err) {
    console.warn("[Customer Eligibility] Error querying customer projects:", err);
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
