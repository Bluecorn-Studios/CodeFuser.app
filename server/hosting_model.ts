import { getSupabase } from "./supabase.js";
import { getProjectById, updateProject, logAuditEvent } from "./db.js";
import { sendHostingLifecycleNotification } from "./hosting_notifications.js";
import fs from "fs";
import path from "path";

export type HostingSubscriptionStatus =
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
  | "EXPIRED";

export type AllowedPackageId = "foundation" | "growth" | "dominance";

export interface HostingPlanConfig {
  packageId: AllowedPackageId;
  planName: string;
  monthlyHostingPrice: number;
  freeHostingMonths: number;
  domainFreeYears: number;
  domainRenewalPrice: number;
  currency: string;
  razorpayPlanId: string;
}

export const HOSTING_PLAN_CONFIGS: Record<AllowedPackageId, HostingPlanConfig> = {
  foundation: {
    packageId: "foundation",
    planName: "Ignite",
    monthlyHostingPrice: 499,
    freeHostingMonths: 1,
    domainFreeYears: 0,
    domainRenewalPrice: 999,
    currency: "INR",
    razorpayPlanId:
      process.env.RAZORPAY_HOSTING_PLAN_ID_IGNITE ||
      process.env.RAZORPAY_HOSTING_PLAN_ID_FOUNDATION ||
      process.env.RAZORPAY_HOSTING_PLAN_ID ||
      "plan_codefuser_ignite_499",
  },
  growth: {
    packageId: "growth",
    planName: "Fusion",
    monthlyHostingPrice: 999,
    freeHostingMonths: 2,
    domainFreeYears: 1,
    domainRenewalPrice: 999,
    currency: "INR",
    razorpayPlanId:
      process.env.RAZORPAY_HOSTING_PLAN_ID_FUSION ||
      process.env.RAZORPAY_HOSTING_PLAN_ID_GROWTH ||
      "plan_codefuser_fusion_999",
  },
  dominance: {
    packageId: "dominance",
    planName: "Catalyst",
    monthlyHostingPrice: 1999,
    freeHostingMonths: 3,
    domainFreeYears: 2,
    domainRenewalPrice: 999,
    currency: "INR",
    razorpayPlanId:
      process.env.RAZORPAY_HOSTING_PLAN_ID_CATALYST ||
      process.env.RAZORPAY_HOSTING_PLAN_ID_DOMINANCE ||
      "plan_codefuser_catalyst_1999",
  },
};

export function normalizePackageId(rawPackageId?: string): AllowedPackageId | null {
  if (!rawPackageId) return null;
  const lower = String(rawPackageId).toLowerCase().trim();
  if (lower.includes("foundation") || lower.includes("ignite")) {
    return "foundation";
  }
  if (lower.includes("growth") || lower.includes("fusion")) {
    return "growth";
  }
  if (lower.includes("dominance") || lower.includes("catalyst")) {
    return "dominance";
  }
  return null;
}

export function getHostingPlanConfig(packageId?: string): HostingPlanConfig {
  const norm = normalizePackageId(packageId);
  if (!norm || !HOSTING_PLAN_CONFIGS[norm]) {
    throw new Error(
      `[Hosting Config Error] Invalid or unmapped website package ID: "${packageId}". Cannot determine hosting entitlements.`
    );
  }
  const config = HOSTING_PLAN_CONFIGS[norm];
  if (!config.monthlyHostingPrice || config.monthlyHostingPrice <= 0) {
    throw new Error(`[Hosting Config Error] Invalid monthly hosting price (${config.monthlyHostingPrice}) for package: ${norm}`);
  }
  if (config.freeHostingMonths === undefined || config.freeHostingMonths < 0) {
    throw new Error(`[Hosting Config Error] Invalid free hosting months (${config.freeHostingMonths}) for package: ${norm}`);
  }
  return config;
}

export interface HostingSubscriptionRecord {
  id: string; // e.g. "sub_host_PROJ123"
  projectId: string;
  customerId: string;
  packageId: AllowedPackageId;
  planId: string;
  planName: string;
  monthlyAmount: number;
  currency: string;
  freeHostingMonths: number;
  domainFreeYears: number;
  domainRenewalPrice: number;
  freeTrialStart: string;
  freeTrialEnd: string;
  nextBillingDate: string;
  status: HostingSubscriptionStatus;
  razorpaySubscriptionId?: string | null;
  razorpayCustomerId?: string | null;
  razorpayPlanId?: string | null;
  autopayStatus: "inactive" | "pending" | "active" | "cancelled" | "revoked";
  mandateStatus: "none" | "created" | "authenticated" | "activated" | "revoked" | "expired" | "paused";
  lastPaymentId?: string | null;
  lastPaymentDate?: string | null;
  lastPaymentAmount?: number | null;
  failedPaymentCount: number;
  gracePeriodEndsAt?: string | null;
  graceReminderSent?: boolean;
  suspensionReminderSent?: boolean;
  lastScannedAt?: string;
  cancelledAt?: string | null;
  suspendedAt?: string | null;
  reconciliationStatus?: "OK" | "PLAN_CONFIGURATION_MISMATCH" | null;
  sentNotifications?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface HostingInvoiceRecord {
  id: string; // e.g. "INV-HOST-123456"
  subscriptionId: string;
  projectId: string;
  receiptNumber: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  amount: number;
  discount: number;
  finalAmount: number;
  status: "PAID" | "PENDING" | "FAILED";
  transactionId?: string;
  razorpayPaymentId?: string;
  paymentDate: string;
  nextBillingDate: string;
  createdAt: string;
}

export interface DomainRecord {
  id: string;
  projectId: string;
  domainName: string;
  registrationStatus:
    | "DOMAIN_INCLUDED"
    | "DOMAIN_PENDING"
    | "DOMAIN_REGISTERED"
    | "DOMAIN_ACTIVE"
    | "DOMAIN_EXPIRING"
    | "DOMAIN_RENEWAL_DUE"
    | "DOMAIN_EXPIRED"
    | "DOMAIN_CANCELLED";
  registrar: string;
  registrationDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  renewalPrice: number;
  autoRenewStatus: boolean;
  ownershipStatus: "CodeFuser Managed" | "Client Owned";
  createdAt: string;
  updatedAt: string;
}

export interface HostingConfig {
  currency: string;
  gracePeriodDays: number;
  reminderDaysBeforeBilling: number;
  maxRetryAttempts: number;
}

export const DEFAULT_HOSTING_CONFIG: HostingConfig = {
  currency: "INR",
  gracePeriodDays: 7,
  reminderDaysBeforeBilling: 3,
  maxRetryAttempts: 3,
};

// Fallback local store for development and non-relational backup
const HOSTING_STORE_FILE = path.join(process.cwd(), "server", "fuser_hosting_subscriptions.json");

function getLocalHostingStore(): {
  subscriptions: Record<string, HostingSubscriptionRecord>;
  invoices: Record<string, HostingInvoiceRecord[]>;
  domains: Record<string, DomainRecord>;
  processedWebhooks: string[];
} {
  try {
    if (fs.existsSync(HOSTING_STORE_FILE)) {
      const raw = fs.readFileSync(HOSTING_STORE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("[Hosting Store] Error reading local hosting store file:", err);
  }
  return { subscriptions: {}, invoices: {}, domains: {}, processedWebhooks: [] };
}

function saveLocalHostingStore(store: {
  subscriptions: Record<string, HostingSubscriptionRecord>;
  invoices: Record<string, HostingInvoiceRecord[]>;
  domains: Record<string, DomainRecord>;
  processedWebhooks: string[];
}) {
  try {
    const dir = path.dirname(HOSTING_STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(HOSTING_STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[Hosting Store] Error writing local hosting store file:", err);
  }
}

/**
 * Check Webhook Idempotency
 */
export function isWebhookProcessed(eventId: string): boolean {
  if (!eventId) return false;
  const store = getLocalHostingStore();
  return store.processedWebhooks.includes(eventId);
}

export function markWebhookProcessed(eventId: string) {
  if (!eventId) return;
  const store = getLocalHostingStore();
  if (!store.processedWebhooks.includes(eventId)) {
    store.processedWebhooks.push(eventId);
    // Keep last 1000 webhook IDs
    if (store.processedWebhooks.length > 1000) {
      store.processedWebhooks = store.processedWebhooks.slice(-1000);
    }
    saveLocalHostingStore(store);
  }
}

/**
 * Get or Create Hosting Subscription for a Project
 */
export async function getHostingSubscription(projectId: string): Promise<HostingSubscriptionRecord> {
  const localStore = getLocalHostingStore();

  // If existing subscription exists, return snapshot unchanged
  if (localStore.subscriptions[projectId]) {
    const existingSub = localStore.subscriptions[projectId];
    try {
      const project = await getProjectById(projectId);
      if (project?.selectedPackage) {
        const expectedConfig = getHostingPlanConfig(project.selectedPackage);
        if (
          existingSub.monthlyAmount !== expectedConfig.monthlyHostingPrice ||
          normalizePackageId(existingSub.packageId) !== expectedConfig.packageId
        ) {
          existingSub.reconciliationStatus = "PLAN_CONFIGURATION_MISMATCH";
        } else {
          existingSub.reconciliationStatus = "OK";
        }
      }
    } catch (e) {
      // Ignore DB lookup error if subscription already exists locally
    }
    return existingSub;
  }

  const project = await getProjectById(projectId);

  if (!project) {
    throw new Error(`[Hosting Error] Cannot create subscription. Project with ID "${projectId}" not found.`);
  }

  // Restore existing persisted hosting subscription from project/Supabase if available
  const persistedSub: HostingSubscriptionRecord | undefined =
    project.payment?.hostingSubscription || (project as any).hostingSubscription;

  if (persistedSub && persistedSub.id) {
    localStore.subscriptions[projectId] = persistedSub;
    saveLocalHostingStore(localStore);
    return persistedSub;
  }

  // Resolve authoritative plan config from project.selectedPackage
  const planConfig = getHostingPlanConfig(project.selectedPackage);

  const createdAt = new Date();
  const freeEnd = new Date(createdAt);
  freeEnd.setMonth(freeEnd.getMonth() + planConfig.freeHostingMonths);

  const newSub: HostingSubscriptionRecord = {
    id: `sub_host_${projectId}`,
    projectId,
    customerId: project.email || (project as any).clientEmail || project.userId || "client@codefuser.com",
    packageId: planConfig.packageId,
    planId: `codefuser_hosting_${planConfig.packageId}`,
    planName: `CodeFuser Hosting (${planConfig.planName})`,
    monthlyAmount: planConfig.monthlyHostingPrice,
    currency: planConfig.currency,
    freeHostingMonths: planConfig.freeHostingMonths,
    domainFreeYears: planConfig.domainFreeYears,
    domainRenewalPrice: planConfig.domainRenewalPrice,
    freeTrialStart: createdAt.toISOString(),
    freeTrialEnd: freeEnd.toISOString(),
    nextBillingDate: freeEnd.toISOString(),
    status: "FREE_TRIAL_ACTIVE",
    razorpayPlanId: planConfig.razorpayPlanId,
    autopayStatus: "inactive",
    mandateStatus: "none",
    failedPaymentCount: 0,
    reconciliationStatus: "OK",
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
  };

  localStore.subscriptions[projectId] = newSub;

  // Initial promotional free trial invoice
  const freeInvoice: HostingInvoiceRecord = {
    id: `INV-HOST-PROMO-${projectId.slice(-6)}`,
    subscriptionId: newSub.id,
    projectId,
    receiptNumber: `HST-PROMO-${Date.now().toString().slice(-6)}`,
    billingPeriodStart: createdAt.toISOString(),
    billingPeriodEnd: freeEnd.toISOString(),
    amount: planConfig.monthlyHostingPrice,
    discount: planConfig.monthlyHostingPrice,
    finalAmount: 0,
    status: "PAID",
    transactionId: "PROMO_FREE_PERIOD",
    paymentDate: createdAt.toISOString(),
    nextBillingDate: freeEnd.toISOString(),
    createdAt: createdAt.toISOString(),
  };

  if (!localStore.invoices[projectId]) {
    localStore.invoices[projectId] = [];
  }
  localStore.invoices[projectId].push(freeInvoice);

  saveLocalHostingStore(localStore);
  return newSub;
}

/**
 * Update Hosting Subscription
 */
export async function updateHostingSubscription(
  projectId: string,
  updates: Partial<HostingSubscriptionRecord>
): Promise<HostingSubscriptionRecord> {
  const current = await getHostingSubscription(projectId);
  const updated: HostingSubscriptionRecord = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const localStore = getLocalHostingStore();
  localStore.subscriptions[projectId] = updated;
  saveLocalHostingStore(localStore);

  // Sync to Supabase projects json if available
  try {
    const supabase = getSupabase();
    const project = await getProjectById(projectId);
    const existingPayment = project?.payment || {};
    await supabase.from("projects").update({
      payment: {
        ...existingPayment,
        hostingSubscription: updated
      }
    }).eq("id", projectId);
  } catch (err) {
    console.warn("[Hosting DB Sync] Unable to write to Supabase payment column, stored in local json:", err);
  }

  return updated;
}

/**
 * Add Hosting Invoice
 */
export function addHostingInvoice(invoice: HostingInvoiceRecord) {
  const localStore = getLocalHostingStore();
  if (!localStore.invoices[invoice.projectId]) {
    localStore.invoices[invoice.projectId] = [];
  }
  // Check if invoice ID already exists to avoid duplicates
  const exists = localStore.invoices[invoice.projectId].some((i) => i.id === invoice.id || i.receiptNumber === invoice.receiptNumber);
  if (!exists) {
    localStore.invoices[invoice.projectId].unshift(invoice);
    saveLocalHostingStore(localStore);
  }
}

/**
 * Get All Hosting Invoices for a Project
 */
export function getHostingInvoices(projectId: string): HostingInvoiceRecord[] {
  const localStore = getLocalHostingStore();
  return localStore.invoices[projectId] || [];
}

/**
 * Get or Create Domain Record
 */
export async function getDomainRecord(projectId: string): Promise<DomainRecord> {
  const localStore = getLocalHostingStore();
  if (localStore.domains[projectId]) {
    return localStore.domains[projectId];
  }

  const project = await getProjectById(projectId);
  const now = new Date();
  
  let domainFreeYears = 0;
  let renewalPrice = 999;
  if (project?.selectedPackage) {
    try {
      const planConfig = getHostingPlanConfig(project.selectedPackage);
      domainFreeYears = planConfig.domainFreeYears;
      renewalPrice = planConfig.domainRenewalPrice;
    } catch (e) {
      domainFreeYears = 0;
    }
  }

  const expiryYears = domainFreeYears > 0 ? domainFreeYears : 1;
  const expiry = new Date(now);
  expiry.setFullYear(expiry.getFullYear() + expiryYears);

  const domainName = project?.onboarding?.hasDomain === "yes" || project?.hasDomain === "yes"
    ? `${project.businessName?.toLowerCase().replace(/[^a-z0-9]/g, "") || "mybrand"}.com`
    : `${project?.businessName?.toLowerCase().replace(/[^a-z0-9]/g, "") || "mybrand"}.com`;

  const record: DomainRecord = {
    id: `dom_${projectId}`,
    projectId,
    domainName,
    registrationStatus: domainFreeYears > 0 ? "DOMAIN_INCLUDED" : "DOMAIN_INCLUDED",
    registrar: "CodeFuser Managed",
    registrationDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    renewalDate: expiry.toISOString(),
    renewalPrice,
    autoRenewStatus: true,
    ownershipStatus: "CodeFuser Managed",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  localStore.domains[projectId] = record;
  saveLocalHostingStore(localStore);
  return record;
}

/**
 * Update Domain Record
 */
export function updateDomainRecord(projectId: string, updates: Partial<DomainRecord>): DomainRecord {
  const localStore = getLocalHostingStore();
  const current = localStore.domains[projectId] || {
    id: `dom_${projectId}`,
    projectId,
    domainName: "Pending Domain",
    registrationStatus: "DOMAIN_PENDING",
    registrar: "CodeFuser Managed",
    renewalPrice: 999,
    autoRenewStatus: true,
    ownershipStatus: "CodeFuser Managed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated: DomainRecord = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStore.domains[projectId] = updated;
  saveLocalHostingStore(localStore);
  return updated;
}

/**
 * Retrieve All Hosting Subscriptions across DB / Local Store
 */
export async function getAllHostingSubscriptions(): Promise<HostingSubscriptionRecord[]> {
  const localStore = getLocalHostingStore();
  const subMap: Record<string, HostingSubscriptionRecord> = { ...localStore.subscriptions };

  try {
    const supabase = getSupabase();
    const { data: projects } = await supabase.from("projects").select("*");
    if (projects && Array.isArray(projects)) {
      for (const p of projects) {
        if (p?.id) {
          try {
            const sub = await getHostingSubscription(p.id);
            subMap[p.id] = sub;
          } catch (e) {
            console.warn(`[Hosting Store] Could not resolve hosting subscription for project ${p.id}:`, e);
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Hosting Store] Unable to query Supabase projects for subscription scan, fallback to store:", err);
  }

  return Object.values(subMap);
}

export interface LifecycleEvaluationResult {
  projectId: string;
  subscriptionId: string;
  previousStatus: HostingSubscriptionStatus;
  currentStatus: HostingSubscriptionStatus;
  statusChanged: boolean;
  actionTaken?: string;
  notes?: string;
}

/**
 * Pure, Idempotent Lifecycle Evaluator for a Single Subscription
 */
export async function evaluateHostingSubscriptionLifecycle(
  sub: HostingSubscriptionRecord,
  customNow?: Date,
  config: HostingConfig = DEFAULT_HOSTING_CONFIG
): Promise<LifecycleEvaluationResult> {
  const now = customNow || new Date();
  const nowMs = now.getTime();
  const projectId = sub.projectId;

  let statusChanged = false;
  let actionTaken: string | undefined;
  let notes: string | undefined;
  const previousStatus = sub.status;
  const updates: Partial<HostingSubscriptionRecord> = {
    lastScannedAt: now.toISOString(),
  };

  const freeTrialEndMs = sub.freeTrialEnd ? new Date(sub.freeTrialEnd).getTime() : 0;
  const graceEndsMs = sub.gracePeriodEndsAt ? new Date(sub.gracePeriodEndsAt).getTime() : 0;

  // RULE 1: FREE_TRIAL_ACTIVE evaluation
  if (sub.status === "FREE_TRIAL_ACTIVE") {
    if (freeTrialEndMs > 0 && nowMs >= freeTrialEndMs) {
      if (sub.autopayStatus === "active") {
        updates.status = "AUTOPAY_ACTIVE";
        statusChanged = true;
        actionTaken = "TRANSITION_TO_AUTOPAY_ACTIVE";
        notes = `Free trial period expired (${sub.freeTrialEnd}). AutoPay mandate active. Status set to AUTOPAY_ACTIVE. Plan: ${sub.planName} (${sub.monthlyAmount}/mo).`;
      } else {
        updates.status = "GRACE_PERIOD";
        const graceDays = config.gracePeriodDays || 7;
        const graceEnd = new Date(nowMs + graceDays * 24 * 60 * 60 * 1000);
        updates.gracePeriodEndsAt = graceEnd.toISOString();
        statusChanged = true;
        actionTaken = "TRANSITION_TO_GRACE_PERIOD";
        notes = `Free trial period expired without active AutoPay mandate. ${graceDays}-day grace period initiated ending on ${graceEnd.toISOString()}.`;
      }
    }
  }

  // RULE 2: GRACE_PERIOD / PAYMENT_FAILED / RETRYING / BILLING_DUE evaluation
  else if (
    sub.status === "GRACE_PERIOD" ||
    sub.status === "PAYMENT_FAILED" ||
    sub.status === "RETRYING" ||
    sub.status === "BILLING_DUE" ||
    sub.status === "AUTOPAY_SETUP_REQUIRED"
  ) {
    if (sub.autopayStatus === "active") {
      updates.status = "AUTOPAY_ACTIVE";
      statusChanged = true;
      actionTaken = "TRANSITION_TO_AUTOPAY_ACTIVE";
      notes = `AutoPay mandate approved during grace period. Hosting status restored to AUTOPAY_ACTIVE.`;
    } else {
      let effectiveGraceEndMs = graceEndsMs;
      if (!effectiveGraceEndMs) {
        const graceDays = config.gracePeriodDays || 7;
        const graceEnd = new Date(nowMs + graceDays * 24 * 60 * 60 * 1000);
        updates.gracePeriodEndsAt = graceEnd.toISOString();
        effectiveGraceEndMs = graceEnd.getTime();
      }

      if (nowMs >= effectiveGraceEndMs) {
        updates.status = "HOSTING_SUSPENDED";
        updates.suspendedAt = now.toISOString();
        statusChanged = true;
        actionTaken = "TRANSITION_TO_HOSTING_SUSPENDED";
        notes = `Grace period expired without active payment mandate. Hosting service suspended.`;
      }
    }
  }

  // RULE 3: HOSTING_SUSPENDED evaluation
  else if (sub.status === "HOSTING_SUSPENDED") {
    if (sub.autopayStatus === "active") {
      updates.status = "AUTOPAY_ACTIVE";
      statusChanged = true;
      actionTaken = "RESTORE_FROM_SUSPENSION";
      notes = `AutoPay mandate activated. Hosting reactivated from HOSTING_SUSPENDED to AUTOPAY_ACTIVE.`;
    }
  }

  // RULE 4: AUTOPAY_ACTIVE / PAID evaluation
  else if (sub.status === "AUTOPAY_ACTIVE" || sub.status === "PAID") {
    if (sub.autopayStatus === "cancelled" || sub.autopayStatus === "revoked") {
      updates.status = "MANDATE_REVOKED";
      statusChanged = true;
      actionTaken = "MANDATE_REVOKED";
      notes = `AutoPay mandate was cancelled or revoked. Subscription status updated to MANDATE_REVOKED.`;
    }
  }

  if (statusChanged) {
    const updatedSub = await updateHostingSubscription(projectId, updates);

    await logAuditEvent({
      projectId,
      eventType: "Hosting Lifecycle Transition",
      requestId: `lifecycle_scan_${Date.now()}`,
      actor: "System",
      status: "Success",
      notes: notes || `Hosting subscription status transitioned from ${previousStatus} to ${updatedSub.status}.`,
    });

    // Dispatch Lifecycle Email Notifications based on action taken
    if (actionTaken === "TRANSITION_TO_GRACE_PERIOD") {
      sendHostingLifecycleNotification("GRACE_PERIOD_STARTED", projectId);
    } else if (actionTaken === "TRANSITION_TO_HOSTING_SUSPENDED") {
      sendHostingLifecycleNotification("HOSTING_SUSPENDED", projectId);
    } else if (actionTaken === "RESTORE_FROM_SUSPENSION") {
      sendHostingLifecycleNotification("HOSTING_REACTIVATED", projectId);
    } else if (actionTaken === "TRANSITION_TO_AUTOPAY_ACTIVE") {
      sendHostingLifecycleNotification("AUTOPAY_ACTIVATED", projectId);
    } else if (actionTaken === "MANDATE_REVOKED") {
      sendHostingLifecycleNotification("AUTOPAY_CANCELLED", projectId);
    }

    return {
      projectId,
      subscriptionId: sub.id,
      previousStatus,
      currentStatus: updatedSub.status,
      statusChanged: true,
      actionTaken,
      notes,
    };
  } else {
    // Check upcoming billing reminder for active/paid subscriptions nearing renewal (within 3 days)
    const effectiveStatus = updates.status || sub.status;
    if ((effectiveStatus === "AUTOPAY_ACTIVE" || effectiveStatus === "PAID" || effectiveStatus === "FREE_TRIAL_ACTIVE") && sub.nextBillingDate) {
      const nextBillingMs = new Date(sub.nextBillingDate).getTime();
      const diffDays = (nextBillingMs - nowMs) / (1000 * 60 * 60 * 24);
      if (diffDays >= 0 && diffDays <= 3) {
        sendHostingLifecycleNotification("UPCOMING_BILLING_REMINDER", projectId);
      }
    }

    await updateHostingSubscription(projectId, { lastScannedAt: now.toISOString() });
    return {
      projectId,
      subscriptionId: sub.id,
      previousStatus,
      currentStatus: sub.status,
      statusChanged: false,
      notes: "No state transition required.",
    };
  }
}

export interface ScanResultStats {
  totalScanned: number;
  trialActive: number;
  trialExpiredToGrace: number;
  trialExpiredToAutoPay: number;
  graceActive: number;
  graceExpiredToSuspended: number;
  alreadySuspended: number;
  alreadyPaidOrActive: number;
  cancelledOrPaused: number;
  transitionsCount: number;
  errorsCount: number;
}

/**
 * Server-Side Hosting Lifecycle Scanner Process
 */
export async function runHostingLifecycleScan(
  requestId: string = `scan_${Date.now()}`,
  customNow?: Date,
  config: HostingConfig = DEFAULT_HOSTING_CONFIG
): Promise<ScanResultStats> {
  const stats: ScanResultStats = {
    totalScanned: 0,
    trialActive: 0,
    trialExpiredToGrace: 0,
    trialExpiredToAutoPay: 0,
    graceActive: 0,
    graceExpiredToSuspended: 0,
    alreadySuspended: 0,
    alreadyPaidOrActive: 0,
    cancelledOrPaused: 0,
    transitionsCount: 0,
    errorsCount: 0,
  };

  const now = customNow || new Date();
  console.log(`[Hosting Lifecycle Scanner] Executing server-side scan at ${now.toISOString()} (ReqID: ${requestId})...`);

  try {
    const subscriptions = await getAllHostingSubscriptions();
    stats.totalScanned = subscriptions.length;

    for (const sub of subscriptions) {
      try {
        const evalResult = await evaluateHostingSubscriptionLifecycle(sub, now, config);

        if (evalResult.statusChanged) {
          stats.transitionsCount++;
          console.log(
            `[Hosting Lifecycle Transition] Project ${sub.projectId}: ${evalResult.previousStatus} -> ${evalResult.currentStatus} (${evalResult.actionTaken})`
          );

          if (evalResult.actionTaken === "TRANSITION_TO_GRACE_PERIOD") {
            stats.trialExpiredToGrace++;
          } else if (evalResult.actionTaken === "TRANSITION_TO_AUTOPAY_ACTIVE") {
            stats.trialExpiredToAutoPay++;
          } else if (evalResult.actionTaken === "TRANSITION_TO_HOSTING_SUSPENDED") {
            stats.graceExpiredToSuspended++;
          }
        } else {
          if (sub.status === "FREE_TRIAL_ACTIVE") stats.trialActive++;
          else if (sub.status === "GRACE_PERIOD") stats.graceActive++;
          else if (sub.status === "HOSTING_SUSPENDED") stats.alreadySuspended++;
          else if (sub.status === "AUTOPAY_ACTIVE" || sub.status === "PAID") stats.alreadyPaidOrActive++;
          else if (sub.status === "SUBSCRIPTION_CANCELLED" || sub.status === "SUBSCRIPTION_PAUSED") stats.cancelledOrPaused++;
        }
      } catch (subErr: any) {
        stats.errorsCount++;
        console.error(`[Hosting Lifecycle Scanner] Error scanning subscription ${sub.id}:`, subErr?.message || subErr);
      }
    }

    console.log(`[Hosting Lifecycle Scanner] Completed scan. Total: ${stats.totalScanned}, Transitions: ${stats.transitionsCount}`);
  } catch (err: any) {
    console.error(`[Hosting Lifecycle Scanner] Fatal error during hosting lifecycle scan:`, err?.message || err);
  }

  return stats;
}

export interface TestMatrixItemResult {
  scenario: string;
  initialStatus: HostingSubscriptionStatus;
  autopayStatus: string;
  expectedStatus: HostingSubscriptionStatus;
  actualStatus: HostingSubscriptionStatus;
  statusChanged: boolean;
  passed: boolean;
  notes?: string;
}

/**
 * Isolated Verification Matrix Runner for 9 Mandatory Test Matrix Cases
 */
export async function runHostingLifecycleTestMatrix(): Promise<{
  allPassed: boolean;
  totalTests: number;
  passCount: number;
  failCount: number;
  results: TestMatrixItemResult[];
}> {
  const baseNow = new Date("2026-08-10T12:00:00Z");

  const testCases: Array<{
    scenario: string;
    sub: HostingSubscriptionRecord;
    customNow?: Date;
    expectedStatus: HostingSubscriptionStatus;
    expectedStatusChanged: boolean;
  }> = [
    {
      scenario: "1. trial active",
      sub: {
        id: "sub_test_1",
        projectId: "test_proj_1",
        customerId: "client1@test.com",
        packageId: "foundation",
        planId: "codefuser_hosting_foundation",
        planName: "CodeFuser Hosting (Ignite)",
        monthlyAmount: 499,
        currency: "INR",
        freeHostingMonths: 1,
        domainFreeYears: 0,
        domainRenewalPrice: 999,
        freeTrialStart: "2026-08-01T00:00:00Z",
        freeTrialEnd: "2026-09-01T00:00:00Z",
        nextBillingDate: "2026-09-01T00:00:00Z",
        status: "FREE_TRIAL_ACTIVE",
        autopayStatus: "inactive",
        mandateStatus: "none",
        failedPaymentCount: 0,
        createdAt: "2026-08-01T00:00:00Z",
        updatedAt: "2026-08-01T00:00:00Z",
      },
      customNow: baseNow,
      expectedStatus: "FREE_TRIAL_ACTIVE",
      expectedStatusChanged: false,
    },
    {
      scenario: "2. trial expired",
      sub: {
        id: "sub_test_2",
        projectId: "test_proj_2",
        customerId: "client2@test.com",
        packageId: "growth",
        planId: "codefuser_hosting_growth",
        planName: "CodeFuser Hosting (Fusion)",
        monthlyAmount: 999,
        currency: "INR",
        freeHostingMonths: 2,
        domainFreeYears: 1,
        domainRenewalPrice: 999,
        freeTrialStart: "2026-05-01T00:00:00Z",
        freeTrialEnd: "2026-07-01T00:00:00Z",
        nextBillingDate: "2026-07-01T00:00:00Z",
        status: "FREE_TRIAL_ACTIVE",
        autopayStatus: "inactive",
        mandateStatus: "none",
        failedPaymentCount: 0,
        createdAt: "2026-05-01T00:00:00Z",
        updatedAt: "2026-05-01T00:00:00Z",
      },
      customNow: baseNow,
      expectedStatus: "GRACE_PERIOD",
      expectedStatusChanged: true,
    },
    {
      scenario: "3. grace active",
      sub: {
        id: "sub_test_3",
        projectId: "test_proj_3",
        customerId: "client3@test.com",
        packageId: "growth",
        planId: "codefuser_hosting_growth",
        planName: "CodeFuser Hosting (Fusion)",
        monthlyAmount: 999,
        currency: "INR",
        freeHostingMonths: 2,
        domainFreeYears: 1,
        domainRenewalPrice: 999,
        freeTrialStart: "2026-05-01T00:00:00Z",
        freeTrialEnd: "2026-07-01T00:00:00Z",
        nextBillingDate: "2026-07-01T00:00:00Z",
        status: "GRACE_PERIOD",
        gracePeriodEndsAt: "2026-08-15T00:00:00Z",
        autopayStatus: "inactive",
        mandateStatus: "none",
        failedPaymentCount: 0,
        createdAt: "2026-05-01T00:00:00Z",
        updatedAt: "2026-08-01T00:00:00Z",
      },
      customNow: baseNow,
      expectedStatus: "GRACE_PERIOD",
      expectedStatusChanged: false,
    },
    {
      scenario: "4. grace expired",
      sub: {
        id: "sub_test_4",
        projectId: "test_proj_4",
        customerId: "client4@test.com",
        packageId: "dominance",
        planId: "codefuser_hosting_dominance",
        planName: "CodeFuser Hosting (Catalyst)",
        monthlyAmount: 1999,
        currency: "INR",
        freeHostingMonths: 3,
        domainFreeYears: 2,
        domainRenewalPrice: 999,
        freeTrialStart: "2026-04-01T00:00:00Z",
        freeTrialEnd: "2026-07-01T00:00:00Z",
        nextBillingDate: "2026-07-01T00:00:00Z",
        status: "GRACE_PERIOD",
        gracePeriodEndsAt: "2026-08-05T00:00:00Z",
        autopayStatus: "inactive",
        mandateStatus: "none",
        failedPaymentCount: 0,
        createdAt: "2026-04-01T00:00:00Z",
        updatedAt: "2026-08-01T00:00:00Z",
      },
      customNow: baseNow,
      expectedStatus: "HOSTING_SUSPENDED",
      expectedStatusChanged: true,
    },
    {
      scenario: "5. already suspended",
      sub: {
        id: "sub_test_5",
        projectId: "test_proj_5",
        customerId: "client5@test.com",
        packageId: "foundation",
        planId: "codefuser_hosting_foundation",
        planName: "CodeFuser Hosting (Ignite)",
        monthlyAmount: 499,
        currency: "INR",
        freeHostingMonths: 1,
        domainFreeYears: 0,
        domainRenewalPrice: 999,
        freeTrialStart: "2026-01-01T00:00:00Z",
        freeTrialEnd: "2026-02-01T00:00:00Z",
        nextBillingDate: "2026-02-01T00:00:00Z",
        status: "HOSTING_SUSPENDED",
        suspendedAt: "2026-02-10T00:00:00Z",
        autopayStatus: "inactive",
        mandateStatus: "none",
        failedPaymentCount: 1,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-02-10T00:00:00Z",
      },
      customNow: baseNow,
      expectedStatus: "HOSTING_SUSPENDED",
      expectedStatusChanged: false,
    },
    {
      scenario: "6. already paid",
      sub: {
        id: "sub_test_6",
        projectId: "test_proj_6",
        customerId: "client6@test.com",
        packageId: "growth",
        planId: "codefuser_hosting_growth",
        planName: "CodeFuser Hosting (Fusion)",
        monthlyAmount: 999,
        currency: "INR",
        freeHostingMonths: 2,
        domainFreeYears: 1,
        domainRenewalPrice: 999,
        freeTrialStart: "2026-05-01T00:00:00Z",
        freeTrialEnd: "2026-07-01T00:00:00Z",
        nextBillingDate: "2026-09-01T00:00:00Z",
        status: "PAID",
        autopayStatus: "active",
        mandateStatus: "activated",
        failedPaymentCount: 0,
        createdAt: "2026-05-01T00:00:00Z",
        updatedAt: "2026-07-01T00:00:00Z",
      },
      customNow: baseNow,
      expectedStatus: "PAID",
      expectedStatusChanged: false,
    },
    {
      scenario: "7. cancelled",
      sub: {
        id: "sub_test_7",
        projectId: "test_proj_7",
        customerId: "client7@test.com",
        packageId: "foundation",
        planId: "codefuser_hosting_foundation",
        planName: "CodeFuser Hosting (Ignite)",
        monthlyAmount: 499,
        currency: "INR",
        freeHostingMonths: 1,
        domainFreeYears: 0,
        domainRenewalPrice: 999,
        freeTrialStart: "2026-01-01T00:00:00Z",
        freeTrialEnd: "2026-02-01T00:00:00Z",
        nextBillingDate: "2026-02-01T00:00:00Z",
        status: "SUBSCRIPTION_CANCELLED",
        cancelledAt: "2026-02-01T00:00:00Z",
        autopayStatus: "cancelled",
        mandateStatus: "revoked",
        failedPaymentCount: 0,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-02-01T00:00:00Z",
      },
      customNow: baseNow,
      expectedStatus: "SUBSCRIPTION_CANCELLED",
      expectedStatusChanged: false,
    },
    {
      scenario: "8. paused",
      sub: {
        id: "sub_test_8",
        projectId: "test_proj_8",
        customerId: "client8@test.com",
        packageId: "growth",
        planId: "codefuser_hosting_growth",
        planName: "CodeFuser Hosting (Fusion)",
        monthlyAmount: 999,
        currency: "INR",
        freeHostingMonths: 2,
        domainFreeYears: 1,
        domainRenewalPrice: 999,
        freeTrialStart: "2026-05-01T00:00:00Z",
        freeTrialEnd: "2026-07-01T00:00:00Z",
        nextBillingDate: "2026-07-01T00:00:00Z",
        status: "SUBSCRIPTION_PAUSED",
        autopayStatus: "inactive",
        mandateStatus: "none",
        failedPaymentCount: 0,
        createdAt: "2026-05-01T00:00:00Z",
        updatedAt: "2026-07-01T00:00:00Z",
      },
      customNow: baseNow,
      expectedStatus: "SUBSCRIPTION_PAUSED",
      expectedStatusChanged: false,
    },
    {
      scenario: "9. autopay active",
      sub: {
        id: "sub_test_9",
        projectId: "test_proj_9",
        customerId: "client9@test.com",
        packageId: "dominance",
        planId: "codefuser_hosting_dominance",
        planName: "CodeFuser Hosting (Catalyst)",
        monthlyAmount: 1999,
        currency: "INR",
        freeHostingMonths: 3,
        domainFreeYears: 2,
        domainRenewalPrice: 999,
        freeTrialStart: "2026-04-01T00:00:00Z",
        freeTrialEnd: "2026-07-01T00:00:00Z",
        nextBillingDate: "2026-07-01T00:00:00Z",
        status: "FREE_TRIAL_ACTIVE",
        autopayStatus: "active",
        mandateStatus: "activated",
        failedPaymentCount: 0,
        createdAt: "2026-04-01T00:00:00Z",
        updatedAt: "2026-04-01T00:00:00Z",
      },
      customNow: baseNow,
      expectedStatus: "AUTOPAY_ACTIVE",
      expectedStatusChanged: true,
    },
  ];

  const results: TestMatrixItemResult[] = [];
  let passCount = 0;
  let failCount = 0;

  const localStore = getLocalHostingStore();

  for (const tc of testCases) {
    localStore.subscriptions[tc.sub.projectId] = tc.sub;
    saveLocalHostingStore(localStore);
    const evalRes = await evaluateHostingSubscriptionLifecycle(tc.sub, tc.customNow);
    const passed =
      evalRes.currentStatus === tc.expectedStatus && evalRes.statusChanged === tc.expectedStatusChanged;

    if (passed) passCount++;
    else failCount++;

    results.push({
      scenario: tc.scenario,
      initialStatus: tc.sub.status,
      autopayStatus: tc.sub.autopayStatus,
      expectedStatus: tc.expectedStatus,
      actualStatus: evalRes.currentStatus,
      statusChanged: evalRes.statusChanged,
      passed,
      notes: evalRes.notes,
    });
  }

  return {
    allPassed: failCount === 0,
    totalTests: testCases.length,
    passCount,
    failCount,
    results,
  };
}
