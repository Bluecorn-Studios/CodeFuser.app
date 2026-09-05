import { getExtraData } from "./extra_store.js";
import { withRetry } from "./retry.js";
import { getSupabase } from "./supabase.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const AUDIT_TRAIL_FILE = path.join(process.cwd(), "server", "fuser_audit_trail.json");

export function getLocalAuditTrail(): any[] {
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  try {
    if (fs.existsSync(AUDIT_TRAIL_FILE)) {
      const data = fs.readFileSync(AUDIT_TRAIL_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[Audit Trail Fallback] Error reading local audit trail file:", err);
  }
  return [];
}

export function saveLocalAuditEvent(event: any) {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  try {
    const events = getLocalAuditTrail();
    events.push({
      ...event,
      timestamp: new Date().toISOString()
    });
    const dir = path.dirname(AUDIT_TRAIL_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(AUDIT_TRAIL_FILE, JSON.stringify(events, null, 2), "utf-8");
  } catch (err) {
    console.error("[Audit Trail Fallback] Error writing local audit trail file:", err);
  }
}

export function normalizeOwnershipChoice(val: any): "buyout" | "subscription" {
  if (!val || typeof val !== "string") return "buyout";
  const s = val.trim().toLowerCase();
  if (s === "subscription" || s === "managed" || s === "sublet" || s.includes("subscription")) {
    return "subscription";
  }
  if (s === "buyout" || s === "full" || s.includes("buyout")) {
    return "buyout";
  }
  return "buyout";
}

export function normalizeStatus(val: any): "draft" | "pending_payment" | "paid" | "in_progress" | "completed" | "cancelled" {
  if (!val || typeof val !== "string") return "draft";
  const s = val.trim().toLowerCase();

  if (s === "draft") return "draft";
  if (s === "pending_payment" || s === "pending payment") return "pending_payment";
  if (s === "paid") return "paid";
  if (s === "in_progress" || s === "in progress" || s === "inprogress") return "in_progress";
  if (s === "completed" || s === "complete") return "completed";
  if (s === "cancelled" || s === "canceled") return "cancelled";

  if (s.includes("unpaid") || s.includes("payment")) {
    return "pending_payment";
  }
  if (s.includes("draft") || s.includes("pending") || s.includes("onboarding") || s.includes("created") || s.includes("new") || s.includes("asset")) {
    return "draft";
  }
  if (s.includes("complete") || s.includes("ready") || s.includes("launch") || s.includes("deliver") || s.includes("live") || s.includes("finish")) {
    return "completed";
  }
  if (s.includes("cancel")) {
    return "cancelled";
  }
  if (s.includes("paid")) {
    return "paid";
  }
  if (s.includes("progress") || s.includes("design") || s.includes("develop") || s.includes("review") || s.includes("test") || s.includes("revision") || s.includes("active") || s.includes("plan") || s.includes("strategy") || s.includes("requirement")) {
    return "in_progress";
  }

  return "draft";
}

export interface ChangeRequestRecord {
  id: string;
  projectId: string;
  requestText: string;
  category?: string;
  chips?: string[];
  photoName?: string | null;
  photoUrl?: string | null;
  status: "SUBMITTED" | "REVIEWING" | "APPROVED" | "IN_PROGRESS" | "READY_FOR_REVIEW" | "COMPLETED" | "REJECTED";
  priority?: "normal" | "urgent";
  adminNotes?: string;
  estimatedTurnaround?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ProjectRecord {
  id: string;
  userId?: string;
  clientName: string;
  businessName: string;
  email: string;
  whatsapp: string;
  selectedPackage: string;
  ownershipChoice: string;
  industry: string;
  customIndustry: string;
  goal: string;
  customGoal: string;
  hasDomain: string;
  hasLogo: string;
  contentReady: string;
  galleryReady?: string;
  businessDetails?: string;
  address?: string;
  timestamp: string;
  status: string; // Initial Project Status = "Assets Pending"
  paymentStatus?: string; // 'paid' | 'unpaid'
  portalAccess?: boolean; // true | false
  paymentProvider?: string; // e.g. "razorpay"
  paymentId?: string; // e.g. "pay_XYZ"
  orderId?: string; // e.g. "order_XYZ"
  purchasedPlan?: string; // e.g. "Track A - custom"
  purchaseDate?: string; // ISO string
  portalAccessSource?: "automatic" | "manual"; // "automatic" | "manual"
  quote?: any;
  assets?: any[];
  aiPrompt?: string;
  projectVersion?: number;
  launchStatus?: "NOT_READY" | "DRAFT" | "IN_PROGRESS" | "READY_TO_LAUNCH" | "DEPLOYING" | "VERIFYING" | "LAUNCHED" | "PAUSED" | "ATTENTION" | "VERIFICATION_FAILED";
  websiteStatus?: "ONLINE" | "DEGRADED" | "OFFLINE" | "MAINTENANCE" | "PROVISIONING";
  websiteUrl?: string;
  stagingUrl?: string;
  healthStatus?: "healthy" | "degraded" | "unreachable" | "maintenance" | "HEALTHY" | "UNHEALTHY" | "UNKNOWN";
  lastHealthCheck?: string;
  dnsStatus?: "connected" | "propagating" | "failed" | "unconfigured";
  sslStatus?: "active" | "issuing" | "expired" | "unconfigured";
  changeRequests?: ChangeRequestRecord[];
  onboarding?: {
    industry?: string;
    customIndustry?: string;
    goal?: string;
    customGoal?: string;
    hasDomain?: string;
    hasLogo?: string;
    contentReady?: string;
    galleryReady?: string;
    businessDetails?: string;
    address?: string;
    [key: string]: any;
  };
  payment?: {
    provider?: string;
    paymentId?: string;
    orderId?: string;
    purchasedPlan?: string;
    purchaseDate?: string;
    [key: string]: any;
  };
}

export function toUuid(str: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) {
    return str;
  }
  const hash = crypto.createHash("sha256").update(str).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function addProject(proj: Partial<ProjectRecord> & { idempotencyKey?: string }, reqId: string = "N/A"): Promise<ProjectRecord> {
  const supabase = getSupabase();
  console.log("Saving project directly to Supabase table 'projects'...");

  // Support explicit ID or idempotencyKey mapped to UUID
  const targetId = proj.id || (proj.idempotencyKey ? toUuid(proj.idempotencyKey) : undefined);

  if (targetId) {
    const existing = await getProjectById(targetId);
    if (existing) {
      console.log(`[addProject] Found existing project matching ID/idempotencyKey (${targetId}). Updating existing record instead of duplicate insert.`);
      return await updateProject(existing.id, proj, reqId);
    }
  }

  const onboardingObj = proj.onboarding || {
    industry: proj.industry || "",
    customIndustry: proj.customIndustry || "",
    goal: proj.goal || "",
    customGoal: proj.customGoal || "",
    hasDomain: proj.hasDomain || "",
    hasLogo: proj.hasLogo || "",
    contentReady: proj.contentReady || "",
    galleryReady: proj.galleryReady || "",
    businessDetails: proj.businessDetails || "",
    address: proj.address || ""
  };

  if (proj.idempotencyKey) {
    (onboardingObj as any).idempotencyKey = proj.idempotencyKey;
  }

  const paymentObj = proj.payment || {
    provider: proj.paymentProvider || "",
    paymentId: proj.paymentId || "",
    orderId: proj.orderId || "",
    purchasedPlan: proj.purchasedPlan || "",
    purchaseDate: proj.purchaseDate || null,
    portalAccessSource: proj.portalAccessSource || "automatic"
  };
  
  const payload: any = {
    client_name: proj.clientName || "",
    business_name: proj.businessName || "",
    email: proj.email || "",
    whatsapp: proj.whatsapp || "",
    selected_package: proj.selectedPackage || "growth",
    ownership_choice: normalizeOwnershipChoice(proj.ownershipChoice),
    onboarding: onboardingObj || {},
    payment: paymentObj || {},
    created_at: proj.timestamp || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: normalizeStatus(proj.status),
    payment_status: proj.paymentStatus || "unpaid",
    portal_access: proj.portalAccess ?? false,
    project_version: proj.projectVersion || 1,
    quote: proj.quote || (proj.aiPrompt ? { aiPrompt: proj.aiPrompt } : {}),
    assets: proj.assets || []
  };

  if (targetId) {
    payload.id = targetId;
  }

  console.log("[addProject] Inserting project payload with quote:", payload.quote);
  console.log({ ownership_choice: payload.ownership_choice });
  console.log({ status: payload.status });

  if (proj.userId) {
    payload.user_id = proj.userId;
  }

  try {
    const response = await supabase
      .from("projects")
      .insert([payload])
      .select();

    if (response.error) {
      console.error("[addProject] Supabase insert error:", response.error);
      // Handle primary key or unique constraint conflict (e.g. 23505) due to concurrent requests
      if (response.error.code === "23505" || String(response.error.message || "").toLowerCase().includes("duplicate key")) {
        const fetchId = targetId || payload.id;
        if (fetchId) {
          console.log(`[addProject] Caught duplicate key constraint on ${fetchId}. Fetching existing record and updating...`);
          const existing = await getProjectById(fetchId);
          if (existing) {
            return await updateProject(existing.id, proj, reqId);
          }
        }
      }
      throw new Error(`Failed to create project: ${response.error.message}`);
    }

    if (!response.data || response.data.length === 0) {
      throw new Error("Failed to insert project: No data returned");
    }

    console.dir(response.data[0], { depth: null });
    return mapProjectRow(response.data[0]);
  } catch (err: any) {
    console.error("[addProject] Exception during project insertion:", err);
    throw err;
  }
}

export function mapProjectRow(item: any): ProjectRecord {
  const onboarding = item.onboarding || {};
  const payment = item.payment || {};
  const quote = item.quote || {};
  const normStatus = normalizeStatus(item.status);
  const isExplicitLive = typeof item.status === "string" && item.status.toLowerCase().includes("live");
  const isCompleted = normStatus === "completed" || (typeof item.status === "string" && (item.status.toLowerCase().includes("complete") || item.status.toLowerCase().includes("delivery")));

  const launchStatus = item.launch_status || quote.launchStatus || (isExplicitLive ? "LAUNCHED" : isCompleted ? "READY_TO_LAUNCH" : "NOT_READY");
  const websiteStatus = item.website_status || quote.websiteStatus || (launchStatus === "LAUNCHED" ? "ONLINE" : "OFFLINE");
  const websiteUrl = item.website_url || quote.websiteUrl || onboarding.websiteUrl || "";
  const stagingUrl = item.staging_url || quote.stagingUrl || "";
  const healthStatus = item.health_status || quote.healthStatus || (launchStatus === "LAUNCHED" && websiteStatus === "ONLINE" ? "healthy" : "maintenance");
  const lastHealthCheck = quote.lastHealthCheck || item.last_health_check || null;
  const dnsStatus = quote.dnsStatus || (websiteStatus === "ONLINE" ? "connected" : "unconfigured");
  const sslStatus = quote.sslStatus || (websiteStatus === "ONLINE" ? "active" : "unconfigured");
  const changeRequests = quote.changeRequests || [];

  return {
    id: item.id || "",
    clientName: item.client_name || item.clientName || "",
    businessName: item.business_name || item.businessName || "",
    email: item.email || "",
    whatsapp: item.whatsapp || "",
    selectedPackage: item.selected_package || item.selectedPackage || "",
    ownershipChoice: normalizeOwnershipChoice(item.ownership_choice || item.ownershipChoice),
    industry: onboarding.industry || "",
    customIndustry: onboarding.customIndustry || onboarding.custom_industry || "",
    goal: onboarding.goal || "",
    customGoal: onboarding.customGoal || onboarding.custom_goal || "",
    hasDomain: onboarding.hasDomain || onboarding.has_domain || "",
    hasLogo: onboarding.hasLogo || onboarding.has_logo || "",
    contentReady: onboarding.contentReady || onboarding.content_ready || "",
    galleryReady: onboarding.galleryReady || onboarding.gallery_ready || item.galleryReady || item.gallery_ready || "",
    businessDetails: onboarding.businessDetails || onboarding.business_details || item.businessDetails || item.business_details || "",
    address: onboarding.address || item.address || "",
    timestamp: item.timestamp || item.created_at || "",
    status: item.status || "Assets Pending",
    userId: item.user_id || item.userId || "",
    paymentStatus: item.payment_status !== null && item.payment_status !== undefined ? item.payment_status : "unpaid",
    portalAccess: item.portal_access !== null && item.portal_access !== undefined ? item.portal_access : false,
    paymentProvider: payment.provider || payment.paymentProvider || "",
    paymentId: payment.paymentId || payment.payment_id || "",
    orderId: payment.orderId || payment.order_id || "",
    purchasedPlan: payment.purchasedPlan || payment.purchased_plan || "",
    purchaseDate: payment.purchaseDate || payment.purchase_date || "",
    portalAccessSource: payment.portalAccessSource || payment.portal_access_source || "automatic",
    quote: item.quote || null,
    assets: item.assets || [],
    aiPrompt: item.quote?.aiPrompt || "",
    launchStatus,
    websiteStatus,
    websiteUrl,
    stagingUrl,
    healthStatus,
    lastHealthCheck,
    dnsStatus,
    sslStatus,
    changeRequests,
    onboarding,
    payment
  };
}

export async function getProjects(reqId: string = "N/A", filter?: { userId?: string; email?: string }): Promise<ProjectRecord[]> {
  const supabase = getSupabase();
  console.log("Retrieving projects from Supabase (server-side filtered)...");
  
  const data = await withRetry(async () => {
    let query = supabase
      .from("projects")
      .select("*");

    if (filter) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const rawUserId = String(filter.userId || "").trim();
      const validUserId = rawUserId && rawUserId !== "undefined" && rawUserId !== "null" && uuidRegex.test(rawUserId) ? rawUserId : undefined;
      const rawEmail = String(filter.email || "").trim().toLowerCase();
      const validEmail = rawEmail && rawEmail !== "undefined" && rawEmail !== "null" ? rawEmail : undefined;

      if (validUserId && validEmail) {
        // Find projects matching either the user ID OR the email address
        query = query.or(`user_id.eq.${validUserId},email.eq.${validEmail}`);
      } else if (validUserId) {
        query = query.eq("user_id", validUserId);
      } else if (validEmail) {
        query = query.eq("email", validEmail);
      }
    }

    const { data: resData, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }
    return resData;
  }, {
    reqId,
    operationName: "Supabase SELECT (getProjects)",
    isIdempotent: true
  });

  if (!data) return [];

  return data
    .filter(item => item.id !== "c0090000-0000-0000-0000-000000000001" && item.email !== "coupons@codefuser.com" && item.email !== "system-coupons@codefuser.com")
    .map(item => mapProjectRow(item));
}

export async function updateProject(id: string, updates: Partial<ProjectRecord>, reqId: string = "N/A"): Promise<ProjectRecord> {
  if (id === "c0090000-0000-0000-0000-000000000001") {
    throw new Error("[DB Protection] Cannot update system coupon store record via updateProject.");
  }
  const supabase = getSupabase();
  console.log(`Updating project ${id} in Supabase...`);
  
  const dbUpdates: any = {};
  if (updates.status !== undefined) dbUpdates.status = normalizeStatus(updates.status);
  if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
  if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
  if (updates.selectedPackage !== undefined) dbUpdates.selected_package = updates.selectedPackage;
  if (updates.ownershipChoice !== undefined) dbUpdates.ownership_choice = normalizeOwnershipChoice(updates.ownershipChoice);
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp;
  if (updates.userId !== undefined) dbUpdates.user_id = updates.userId;
  if (updates.quote !== undefined) {
    dbUpdates.quote = updates.quote ?? {};
  }
  
  if (
    updates.launchStatus !== undefined ||
    updates.websiteStatus !== undefined ||
    updates.websiteUrl !== undefined ||
    updates.stagingUrl !== undefined ||
    updates.healthStatus !== undefined ||
    updates.lastHealthCheck !== undefined ||
    updates.dnsStatus !== undefined ||
    updates.sslStatus !== undefined ||
    updates.changeRequests !== undefined
  ) {
    const existing = await getProjectById(id);
    const existingQuote = existing?.quote || {};
    dbUpdates.quote = {
      ...existingQuote,
      ...(dbUpdates.quote || {}),
      ...(updates.launchStatus !== undefined && { launchStatus: updates.launchStatus }),
      ...(updates.websiteStatus !== undefined && { websiteStatus: updates.websiteStatus }),
      ...(updates.websiteUrl !== undefined && { websiteUrl: updates.websiteUrl }),
      ...(updates.stagingUrl !== undefined && { stagingUrl: updates.stagingUrl }),
      ...(updates.healthStatus !== undefined && { healthStatus: updates.healthStatus }),
      ...(updates.lastHealthCheck !== undefined && { lastHealthCheck: updates.lastHealthCheck }),
      ...(updates.dnsStatus !== undefined && { dnsStatus: updates.dnsStatus }),
      ...(updates.sslStatus !== undefined && { sslStatus: updates.sslStatus }),
      ...(updates.changeRequests !== undefined && { changeRequests: updates.changeRequests })
    };
  }
  if (updates.assets !== undefined) dbUpdates.assets = updates.assets ?? [];
  if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
  if (updates.portalAccess !== undefined) dbUpdates.portal_access = updates.portalAccess;
  // Handle onboarding JSONB column
  if (updates.onboarding !== undefined) {
    dbUpdates.onboarding = updates.onboarding ?? {};
  } else if (
    updates.industry !== undefined ||
    updates.customIndustry !== undefined ||
    updates.goal !== undefined ||
    updates.customGoal !== undefined ||
    updates.hasDomain !== undefined ||
    updates.hasLogo !== undefined ||
    updates.contentReady !== undefined ||
    updates.galleryReady !== undefined ||
    updates.businessDetails !== undefined ||
    updates.address !== undefined
  ) {
    const existing = await getProjectById(id);
    const existingOnboarding = existing?.onboarding || {
      industry: existing?.industry || "",
      customIndustry: existing?.customIndustry || "",
      goal: existing?.goal || "",
      customGoal: existing?.customGoal || "",
      hasDomain: existing?.hasDomain || "",
      hasLogo: existing?.hasLogo || "",
      contentReady: existing?.contentReady || "",
      galleryReady: existing?.galleryReady || "",
      businessDetails: existing?.businessDetails || "",
      address: existing?.address || ""
    };
    dbUpdates.onboarding = {
      ...existingOnboarding,
      ...(updates.industry !== undefined && { industry: updates.industry }),
      ...(updates.customIndustry !== undefined && { customIndustry: updates.customIndustry }),
      ...(updates.goal !== undefined && { goal: updates.goal }),
      ...(updates.customGoal !== undefined && { customGoal: updates.customGoal }),
      ...(updates.hasDomain !== undefined && { hasDomain: updates.hasDomain }),
      ...(updates.hasLogo !== undefined && { hasLogo: updates.hasLogo }),
      ...(updates.contentReady !== undefined && { contentReady: updates.contentReady }),
      ...(updates.galleryReady !== undefined && { galleryReady: updates.galleryReady }),
      ...(updates.businessDetails !== undefined && { businessDetails: updates.businessDetails }),
      ...(updates.address !== undefined && { address: updates.address })
    };
  }

  // Handle payment JSONB column
  if (updates.payment !== undefined) {
    dbUpdates.payment = updates.payment ?? {};
  } else if (
    updates.paymentProvider !== undefined ||
    updates.paymentId !== undefined ||
    updates.orderId !== undefined ||
    updates.purchasedPlan !== undefined ||
    updates.purchaseDate !== undefined ||
    updates.portalAccessSource !== undefined
  ) {
    const existing = await getProjectById(id);
    const existingPayment = existing?.payment || {
      provider: existing?.paymentProvider || "",
      paymentId: existing?.paymentId || "",
      orderId: existing?.orderId || "",
      purchasedPlan: existing?.purchasedPlan || "",
      purchaseDate: existing?.purchaseDate || "",
      portalAccessSource: existing?.portalAccessSource || "automatic"
    };
    dbUpdates.payment = {
      ...existingPayment,
      ...(updates.paymentProvider !== undefined && { provider: updates.paymentProvider }),
      ...(updates.paymentId !== undefined && { paymentId: updates.paymentId }),
      ...(updates.orderId !== undefined && { orderId: updates.orderId }),
      ...(updates.purchasedPlan !== undefined && { purchasedPlan: updates.purchasedPlan }),
      ...(updates.purchaseDate !== undefined && { purchaseDate: updates.purchaseDate }),
      ...(updates.portalAccessSource !== undefined && { portalAccessSource: updates.portalAccessSource })
    };
  }

  if (Object.keys(dbUpdates).length === 0) {
    const existing = await getProjectById(id);
    if (!existing) {
      throw new Error(`Project with ID ${id} not found.`);
    }
    return existing;
  }

  const data = await withRetry(async () => {
    let { data: resData, error } = await supabase
      .from("projects")
      .update(dbUpdates)
      .eq("id", id)
      .select();
       
    if (error && (error.message.includes("user_id") || error.message.includes("column"))) {
      console.warn("user_id column might be absent in update. Retrying update without user_id.");
      const dbUpdatesNoUserId = { ...dbUpdates };
      delete dbUpdatesNoUserId.user_id;
      if (Object.keys(dbUpdatesNoUserId).length > 0) {
        const retry = await supabase
          .from("projects")
          .update(dbUpdatesNoUserId)
          .eq("id", id)
          .select();
        resData = retry.data;
        error = retry.error;
      } else {
        resData = null;
        error = null;
      }
    }

    if (error) {
      throw new Error(`Supabase update error: ${error.message}`);
    }
    return resData;
  }, {
    reqId,
    operationName: `Supabase UPDATE (updateProject ${id})`,
    isIdempotent: true
  });
  
  if (!data || data.length === 0) {
    const existing = await getProjectById(id);
    if (existing) {
      return { ...existing, ...updates };
    }
    throw new Error(`Project with ID ${id} not found.`);
  }
  
  return mapProjectRow(data[0]);
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  if (id === "c0090000-0000-0000-0000-000000000001") {
    return null;
  }
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProjectRow(data);
  } catch (err) {
    console.error(`Failed to get project by ID ${id}:`, err);
    return null;
  }
}

// Durable Cloud Audit Trail
export async function logAuditEvent(event: {
  projectId: string;
  eventType: string;
  requestId?: string;
  actor: "Client" | "Admin" | "System";
  status: "Success" | "Failed" | "Pending";
  notes?: string;
}) {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    // Always log to local backup file first so events are never lost
    saveLocalAuditEvent(event);
  } else {
    console.log(`[Audit Trail] Event logged: ${event.eventType} for project ${event.projectId} (${event.status})`);
  }

  const supabase = getSupabase();
  try {
    const { error } = await supabase.from("audit_trail").insert([{
      project_id: event.projectId,
      event_type: event.eventType,
      request_id: event.requestId || null,
      actor: event.actor,
      status: event.status,
      notes: event.notes || null,
    }]);
    if (error) {
      if (
        error.message?.includes("Could not find the table") ||
        error.message?.includes("Could not find") ||
        error.message?.includes("schema cache") ||
        error.code === "PGRST205" ||
        error.code === "PGRST204"
      ) {
        if (isProduction) {
          console.warn(`[Audit Trail Notice] Table public.audit_trail schema is not fully synchronized in Supabase: ${error.message}. Saving to local backup.`);
        } else {
          console.warn(`[Audit Trail Notice] Table public.audit_trail schema is not fully synchronized in Supabase. Successfully wrote event to local fallback.`);
        }
        saveLocalAuditEvent(event);
      } else {
        console.error("[Audit Trail Error] Failed to write event:", error.message);
      }
    }
  } catch (err: any) {
    console.error("[Audit Trail Error] Exception logging event:", err.message || err);
  }
}

export interface UserProfile {
  id: string;
  email: string;
  role: "super_admin" | "admin" | "client";
  fullName?: string;
  businessName?: string;
  createdAt?: string;
}

const USER_PROFILES_FILE = path.join(process.cwd(), "server", "fuser_user_profiles.json");

export function getLocalUserProfiles(): any[] {
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  try {
    if (fs.existsSync(USER_PROFILES_FILE)) {
      const data = fs.readFileSync(USER_PROFILES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[User Profile Fallback] Error reading local profiles file:", err);
  }
  return [];
}

export function saveLocalUserProfile(profile: any) {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  try {
    const profiles = getLocalUserProfiles();
    const existingIndex = profiles.findIndex(p => p.id === profile.id);
    if (existingIndex !== -1) {
      profiles[existingIndex] = { ...profiles[existingIndex], ...profile };
    } else {
      profiles.push(profile);
    }
    const dir = path.dirname(USER_PROFILES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USER_PROFILES_FILE, JSON.stringify(profiles, null, 2), "utf-8");
  } catch (err) {
    console.error("[User Profile Fallback] Error writing local profiles file:", err);
  }
}

export async function getUserProfile(id: string, reqId: string = "N/A"): Promise<UserProfile | null> {
  const isProduction = process.env.NODE_ENV === "production";
  const supabase = getSupabase();
  try {
    const data = await withRetry(async () => {
      const { data: resData, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw new Error(`Supabase select profile error: ${error.message}`);
      }
      return resData;
    }, {
      reqId,
      operationName: `Supabase SELECT (getUserProfile ${id})`,
      isIdempotent: true
    });

    if (!data) {
      if (!isProduction) {
        // Try local fallback
        const localProfiles = getLocalUserProfiles();
        const localProfile = localProfiles.find(p => p.id === id);
        if (localProfile) {
          return {
            id: localProfile.id,
            email: localProfile.email,
            role: localProfile.role,
            fullName: localProfile.fullName || "",
            businessName: localProfile.businessName || "",
            createdAt: localProfile.createdAt || ""
          };
        }
      }
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      role: data.role as any,
      fullName: data.full_name || "",
      businessName: data.business_name || "",
      createdAt: data.created_at || "",
    };
  } catch (err: any) {
    if (isProduction) {
      console.error(`[User Profile Error] Failed to retrieve user profile ${id} from database:`, err.message || err);
      throw new Error("Unable to retrieve user profile due to a temporary database connection issue. Please try again later.");
    }

    console.warn(`[User Profile Fallback] Failed to retrieve user profile ${id} from Supabase, attempting local fallback:`, err.message || err);
    const localProfiles = getLocalUserProfiles();
    const localProfile = localProfiles.find(p => p.id === id);
    if (localProfile) {
      return {
        id: localProfile.id,
        email: localProfile.email,
        role: localProfile.role,
        fullName: localProfile.fullName || "",
        businessName: localProfile.businessName || "",
        createdAt: localProfile.createdAt || ""
      };
    }
    return null;
  }
}

export async function createUserProfile(profile: Omit<UserProfile, "createdAt">, reqId: string = "N/A"): Promise<UserProfile> {
  const supabase = getSupabase();
  const newProfile = {
    id: profile.id,
    email: profile.email,
    role: profile.role || "client",
    full_name: profile.fullName || "",
    business_name: profile.businessName || "",
    created_at: new Date().toISOString()
  };

  const profileObj: UserProfile = {
    id: newProfile.id,
    email: newProfile.email,
    role: newProfile.role as any,
    fullName: newProfile.full_name,
    businessName: newProfile.business_name,
    createdAt: newProfile.created_at
  };

  try {
    console.log("Before insert");

    const { data, error } = await supabase
      .from("user_profiles")
      .insert([newProfile])
      .select();

    console.log("After insert");
    console.log({ data, error });

    if (error) throw error;
  } catch (err: any) {
    console.warn(`[User Profile Fallback] Failed to create user profile in Supabase DB, using local profile fallback:`, err.message || err);
    saveLocalUserProfile(profileObj);
  }

  return profileObj;
}

export async function updateUserProfileRole(id: string, role: string, reqId: string = "N/A"): Promise<UserProfile> {
  const isProduction = process.env.NODE_ENV === "production";
  const supabase = getSupabase();
  try {
    const data = await withRetry(async () => {
      const { data: resData, error } = await supabase
        .from("user_profiles")
        .update({ role })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase update profile role error: ${error.message}`);
      }
      return resData;
    }, {
      reqId,
      operationName: `Supabase UPDATE (updateUserProfileRole ${id})`,
      isIdempotent: true
    });

    return {
      id: data.id,
      email: data.email,
      role: data.role as any,
      fullName: data.full_name,
      businessName: data.business_name,
      createdAt: data.created_at
    };
  } catch (err: any) {
    if (isProduction) {
      console.error(`[User Profile Error] Failed to update user profile in database:`, err.message || err);
      throw new Error("Unable to update user profile role due to a temporary database connection issue. Please try again later.");
    }

    console.warn(`[User Profile Fallback] Failed to update user profile in Supabase, using local update fallback:`, err.message || err);
    const localProfiles = getLocalUserProfiles();
    const localProfile = localProfiles.find(p => p.id === id);
    if (localProfile) {
      localProfile.role = role;
      saveLocalUserProfile(localProfile);
      return {
        id: localProfile.id,
        email: localProfile.email,
        role: localProfile.role as any,
        fullName: localProfile.fullName,
        businessName: localProfile.businessName,
        createdAt: localProfile.createdAt
      };
    }
    throw err;
  }
}

export async function getAllUserProfiles(reqId: string = "N/A"): Promise<UserProfile[]> {
  const isProduction = process.env.NODE_ENV === "production";
  const supabase = getSupabase();
  try {
    const data = await withRetry(async () => {
      const { data: resData, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Supabase select all profiles error: ${error.message}`);
      }
      return resData;
    }, {
      reqId,
      operationName: "Supabase SELECT (getAllUserProfiles)",
      isIdempotent: true
    });

    if (!data) return [];
    return data.map((item: any) => ({
      id: item.id,
      email: item.email,
      role: item.role as any,
      fullName: item.full_name,
      businessName: item.business_name,
      createdAt: item.created_at
    }));
  } catch (err: any) {
    if (isProduction) {
      console.error(`[User Profile Error] Failed to retrieve all profiles from database:`, err.message || err);
      throw new Error("Unable to retrieve user profiles due to a temporary database connection issue. Please try again later.");
    }

    console.warn(`[User Profile Fallback] Failed to get all profiles from Supabase, returning local profiles:`, err.message || err);
    const localProfiles = getLocalUserProfiles();
    return localProfiles.map(lp => ({
      id: lp.id,
      email: lp.email,
      role: lp.role,
      fullName: lp.fullName,
      businessName: lp.businessName,
      createdAt: lp.createdAt
    }));
  }
}

export async function getChangeRequests(projectId: string): Promise<ChangeRequestRecord[]> {
  const project = await getProjectById(projectId);
  return project?.changeRequests || [];
}

export async function createChangeRequest(
  projectId: string,
  reqData: Partial<ChangeRequestRecord>
): Promise<ChangeRequestRecord> {
  const project = await getProjectById(projectId);
  if (!project) throw new Error("Project not found");

  const existingRequests: ChangeRequestRecord[] = project.changeRequests || [];

  // Idempotency: Prevent duplicate submissions from rapid double-clicks / network retries within 15 seconds
  const trimmedText = (reqData.requestText || "").trim();
  const duplicate = existingRequests.find((r) => {
    const isSameText = r.requestText.trim() === trimmedText;
    const isRecent = Date.now() - new Date(r.createdAt).getTime() < 15000;
    return isSameText && isRecent;
  });
  if (duplicate) {
    return duplicate;
  }

  const newRequest: ChangeRequestRecord = {
    id: `cr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    projectId,
    requestText: reqData.requestText || "",
    category: reqData.category || "General Update",
    chips: reqData.chips || [],
    photoName: reqData.photoName || null,
    photoUrl: reqData.photoUrl || null,
    status: (reqData.status as any) || "SUBMITTED",
    priority: reqData.priority || "normal",
    adminNotes: reqData.adminNotes || "",
    estimatedTurnaround: reqData.estimatedTurnaround || "24-48 hours",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updatedRequests = [newRequest, ...existingRequests];
  await updateProject(projectId, { changeRequests: updatedRequests });
  return newRequest;
}

export async function updateChangeRequest(
  projectId: string,
  requestId: string,
  updates: Partial<ChangeRequestRecord>
): Promise<ChangeRequestRecord | null> {
  const project = await getProjectById(projectId);
  if (!project) throw new Error("Project not found");

  const requests: ChangeRequestRecord[] = project.changeRequests || [];
  const index = requests.findIndex((r) => r.id === requestId);
  if (index === -1) return null;

  const current = requests[index];
  const updatedItem: ChangeRequestRecord = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
    ...(updates.status === "COMPLETED" && !current.completedAt ? { completedAt: new Date().toISOString() } : {})
  };

  requests[index] = updatedItem;
  await updateProject(projectId, { changeRequests: requests });
  return updatedItem;
}

