import { getProjectById, logAuditEvent } from "./db.js";
import { getHostingSubscription, HostingSubscriptionRecord, HostingInvoiceRecord } from "./hosting_model.js";

export type WhatsAppLifecycleEvent =
  | "AUTOPAY_ACTIVATED"
  | "UPCOMING_BILLING_REMINDER"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "GRACE_PERIOD_STARTED"
  | "HOSTING_SUSPENDED"
  | "HOSTING_REACTIVATED"
  | "AUTOPAY_CANCELLED";

export interface WhatsAppNotificationPayload {
  invoice?: HostingInvoiceRecord;
  customKey?: string;
  forced?: boolean;
}

export interface WhatsAppProviderConfig {
  phoneNumberId?: string;
  accessToken?: string;
  businessAccountId?: string;
  apiVersion?: string;
}

export interface WhatsAppStatusReport {
  providerDetected: string;
  providerConfigured: boolean;
  templatesConfigured: string[];
  actualDeliveryPossible: boolean;
  status: "READY_FOR_PROVIDER_CONFIGURATION" | "CONFIGURED_AND_ACTIVE";
  remainingConfiguration: {
    expectedProvider: string;
    requiredCredentials: string[];
    requiredTemplates: Array<{ templateId: string; description: string; parameters: string[] }>;
    requiredEnvironmentVariables: string[];
    webhookConfig: {
      url: string;
      events: string[];
    };
    metaChargeNotice: string;
  };
}

/**
  * Reads WhatsApp Meta Cloud API / Provider Credentials from Environment
  */
function getWhatsAppProviderConfig(): WhatsAppProviderConfig {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_WHATSAPP_PHONE_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    apiVersion: process.env.WHATSAPP_API_VERSION || "v18.0"
  };
}

/**
  * Returns complete Status & Configuration Diagnostics for CodeFuser WhatsApp Notifications
  */
export function getWhatsAppSystemStatus(): WhatsAppStatusReport {
  const config = getWhatsAppProviderConfig();
  const isConfigured = Boolean(config.phoneNumberId && config.accessToken);

  return {
    providerDetected: isConfigured ? "Meta Cloud API (Official Graph API)" : "None",
    providerConfigured: isConfigured,
    templatesConfigured: [
      "codefuser_hosting_autopay_activated",
      "codefuser_hosting_billing_reminder",
      "codefuser_hosting_payment_success",
      "codefuser_hosting_payment_failed",
      "codefuser_hosting_grace_period",
      "codefuser_hosting_suspended",
      "codefuser_hosting_reactivated",
      "codefuser_hosting_autopay_cancelled"
    ],
    actualDeliveryPossible: isConfigured,
    status: isConfigured ? "CONFIGURED_AND_ACTIVE" : "READY_FOR_PROVIDER_CONFIGURATION",
    remainingConfiguration: {
      expectedProvider: "Meta WhatsApp Cloud API (Graph API v18.0+) or WhatsApp BSP (Interakt / AiSensy / Twilio)",
      requiredCredentials: [
        "WhatsApp Business Account (WABA) ID",
        "Meta Developer App with WhatsApp Product enabled",
        "System User Permanent Access Token (WhatsApp Business Management & Messaging permissions)",
        "Verified Phone Number ID (from Meta WhatsApp Manager)"
      ],
      requiredTemplates: [
        {
          templateId: "codefuser_hosting_autopay_activated",
          description: "Notification when AutoPay mandate is successfully activated for hosting",
          parameters: ["client_name", "business_name", "plan_name", "monthly_price", "next_billing_date"]
        },
        {
          templateId: "codefuser_hosting_billing_reminder",
          description: "3-day advance notification before hosting AutoPay charge",
          parameters: ["client_name", "business_name", "plan_name", "monthly_price", "next_billing_date"]
        },
        {
          templateId: "codefuser_hosting_payment_success",
          description: "Receipt & confirmation for successful hosting renewal payment",
          parameters: ["client_name", "business_name", "invoice_number", "monthly_price", "next_billing_date"]
        },
        {
          templateId: "codefuser_hosting_payment_failed",
          description: "Alert when monthly hosting payment attempt fails and retry is active",
          parameters: ["client_name", "business_name", "plan_name", "monthly_price", "grace_ends_date"]
        },
        {
          templateId: "codefuser_hosting_grace_period",
          description: "Notification when hosting enters the 7-day grace period",
          parameters: ["client_name", "business_name", "plan_name", "grace_ends_date"]
        },
        {
          templateId: "codefuser_hosting_suspended",
          description: "Urgent notice when hosting is suspended due to unpaid invoice after grace period",
          parameters: ["client_name", "business_name", "plan_name", "suspended_date"]
        },
        {
          templateId: "codefuser_hosting_reactivated",
          description: "Confirmation when hosting service is reactivated after payment",
          parameters: ["client_name", "business_name", "plan_name"]
        },
        {
          templateId: "codefuser_hosting_autopay_cancelled",
          description: "Confirmation when AutoPay subscription is cancelled or revoked",
          parameters: ["client_name", "business_name", "plan_name", "cancelled_date"]
        }
      ],
      requiredEnvironmentVariables: [
        "WHATSAPP_PHONE_NUMBER_ID",
        "WHATSAPP_ACCESS_TOKEN",
        "WHATSAPP_BUSINESS_ACCOUNT_ID"
      ],
      webhookConfig: {
        url: `${process.env.APP_URL || process.env.DEV_APP_URL || "https://your-domain.com"}/api/webhooks/whatsapp`,
        events: ["messages", "message_deliveries", "message_reads"]
      },
      metaChargeNotice: "Meta charges per utility conversation category (Meta WhatsApp Business API conversation pricing). Creating templates or enabling the provider in CodeFuser incurs $0 until actual WhatsApp messages are sent by Meta to customer mobile numbers."
    }
  };
}

/**
 * Format ISO date for WhatsApp templates e.g. "15 Aug 2026"
 */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/**
 * Format mobile phone number into E.164 standard e.g. "919876543210"
 */
function formatPhoneNumber(phone?: string | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) return `91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith("91")) return cleaned;
  if (cleaned.length >= 10 && cleaned.length <= 15) return cleaned;
  return null;
}

// Memory lock set for WhatsApp idempotency
const activeWhatsAppMemoryKeys = new Set<string>();

/**
 * Server-Side Provider-Agnostic WhatsApp Lifecycle Dispatcher
 *
 * Guarantees:
 * 1. ZERO simulation / ZERO fake delivery records.
 * 2. Uses strictly authoritative customer plan, pricing (Ignite ₹499, Fusion ₹999, Catalyst ₹1999), and billing dates.
 * 3. Returns status READY_FOR_PROVIDER_CONFIGURATION when credentials are absent.
 * 4. Strictly isolated: Errors or missing credentials NEVER interrupt hosting processing or throw exceptions.
 */
export async function sendHostingWhatsAppNotification(
  eventType: WhatsAppLifecycleEvent,
  projectId: string,
  payload: WhatsAppNotificationPayload = {}
): Promise<{
  attempted: boolean;
  delivered: boolean;
  status: "READY_FOR_PROVIDER_CONFIGURATION" | "DELIVERED" | "FAILED" | "SKIPPED";
  reason?: string;
  providerMessageId?: string;
  notificationKey?: string;
}> {
  try {
    const config = getWhatsAppProviderConfig();

    // Authoritative Record Retrieval
    const project = await getProjectById(projectId);
    if (!project) {
      return { attempted: false, delivered: false, status: "SKIPPED", reason: "project_not_found" };
    }

    const sub: HostingSubscriptionRecord = await getHostingSubscription(projectId);
    if (!sub) {
      return { attempted: false, delivered: false, status: "SKIPPED", reason: "subscription_not_found" };
    }

    // Determine target recipient phone number
    const projAny = project as any;
    const subAny = sub as any;
    const rawPhone = projAny.phone || projAny.clientPhone || subAny.clientPhone || projAny.onboarding?.phone || null;
    const recipientPhone = formatPhoneNumber(rawPhone);

    // Formulate deterministic idempotency key
    let notificationKey = payload.customKey;
    if (!notificationKey) {
      switch (eventType) {
        case "AUTOPAY_ACTIVATED":
          notificationKey = `wa_autopay_activated_${projectId}_${sub.razorpaySubscriptionId || "active"}`;
          break;
        case "UPCOMING_BILLING_REMINDER":
          notificationKey = `wa_upcoming_reminder_${projectId}_${(sub.nextBillingDate || "").slice(0, 10)}`;
          break;
        case "PAYMENT_SUCCESS":
          notificationKey = `wa_payment_success_${projectId}_${payload.invoice?.receiptNumber || payload.invoice?.id || sub.lastPaymentId || "charge"}`;
          break;
        case "PAYMENT_FAILED":
          notificationKey = `wa_payment_failed_${projectId}_${(sub.nextBillingDate || "").slice(0, 10) || Date.now()}`;
          break;
        case "GRACE_PERIOD_STARTED":
          notificationKey = `wa_grace_period_${projectId}_${(sub.gracePeriodEndsAt || "").slice(0, 10)}`;
          break;
        case "HOSTING_SUSPENDED":
          notificationKey = `wa_suspended_${projectId}_${(sub.suspendedAt || "").slice(0, 10)}`;
          break;
        case "HOSTING_REACTIVATED":
          notificationKey = `wa_reactivated_${projectId}_${(sub.updatedAt || "").slice(0, 10)}`;
          break;
        case "AUTOPAY_CANCELLED":
          notificationKey = `wa_cancelled_${projectId}_${(sub.cancelledAt || "").slice(0, 10)}`;
          break;
      }
    }

    // Memory Lock Check for idempotency
    if (!payload.forced && notificationKey && activeWhatsAppMemoryKeys.has(notificationKey)) {
      return { attempted: false, delivered: false, status: "SKIPPED", reason: "duplicate_prevented_memory", notificationKey };
    }

    if (notificationKey) {
      activeWhatsAppMemoryKeys.add(notificationKey);
    }

    // Authoritative Data Prep
    const clientName = project.clientName || "Valued Client";
    const businessName = project.businessName || "Your Business";
    const planName = sub.planName ? `CodeFuser Hosting (${sub.planName})` : "CodeFuser Hosting";
    const monthlyPrice = `Rs. ${sub.monthlyAmount.toLocaleString("en-IN")}/month`;
    const nextBillingDate = formatDate(sub.nextBillingDate);
    const invoiceNumber = payload.invoice?.receiptNumber || payload.invoice?.id || "INV-LATEST";
    const graceEndsAt = formatDate(sub.gracePeriodEndsAt);
    const suspendedAt = formatDate(sub.suspendedAt);
    const cancelledAt = formatDate(sub.cancelledAt);

    // Map Event to Template ID and Parameters
    let templateName = "";
    let templateParameters: string[] = [];

    switch (eventType) {
      case "AUTOPAY_ACTIVATED":
        templateName = "codefuser_hosting_autopay_activated";
        templateParameters = [clientName, businessName, planName, monthlyPrice, nextBillingDate];
        break;
      case "UPCOMING_BILLING_REMINDER":
        templateName = "codefuser_hosting_billing_reminder";
        templateParameters = [clientName, businessName, planName, monthlyPrice, nextBillingDate];
        break;
      case "PAYMENT_SUCCESS":
        templateName = "codefuser_hosting_payment_success";
        templateParameters = [clientName, businessName, invoiceNumber, monthlyPrice, nextBillingDate];
        break;
      case "PAYMENT_FAILED":
        templateName = "codefuser_hosting_payment_failed";
        templateParameters = [clientName, businessName, planName, monthlyPrice, graceEndsAt];
        break;
      case "GRACE_PERIOD_STARTED":
        templateName = "codefuser_hosting_grace_period";
        templateParameters = [clientName, businessName, planName, graceEndsAt];
        break;
      case "HOSTING_SUSPENDED":
        templateName = "codefuser_hosting_suspended";
        templateParameters = [clientName, businessName, planName, suspendedAt];
        break;
      case "HOSTING_REACTIVATED":
        templateName = "codefuser_hosting_reactivated";
        templateParameters = [clientName, businessName, planName];
        break;
      case "AUTOPAY_CANCELLED":
        templateName = "codefuser_hosting_autopay_cancelled";
        templateParameters = [clientName, businessName, planName, cancelledAt];
        break;
    }

    // CHECK IF PROVIDER CREDENTIALS ARE CONFIGURED
    if (!config.phoneNumberId || !config.accessToken) {
      // Audit log the status without simulating delivery
      await logAuditEvent({
        projectId,
        eventType: "WHATSAPP_NOTIFICATION_ATTEMPTED",
        actor: "System",
        status: "Pending",
        notes: `WhatsApp notification for event ${eventType} is READY_FOR_PROVIDER_CONFIGURATION. Provider credentials missing in environment. Template: ${templateName}, Phone: ${recipientPhone || "None"}`
      });

      console.log(
        `[WhatsApp System] Event "${eventType}" for project "${projectId}" is READY_FOR_PROVIDER_CONFIGURATION. Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN.`
      );

      return {
        attempted: false,
        delivered: false,
        status: "READY_FOR_PROVIDER_CONFIGURATION",
        reason: "provider_credentials_unconfigured",
        notificationKey
      };
    }

    // IF PROVIDER CREDENTIALS ARE CONFIGURED: Perform Actual API Request to Meta Cloud API
    if (!recipientPhone) {
      return { attempted: false, delivered: false, status: "FAILED", reason: "no_valid_phone_number", notificationKey };
    }

    const apiUrl = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
    const bodyPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: templateParameters.map((p) => ({ type: "text", text: p }))
          }
        ]
      }
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyPayload)
    });

    const responseData = await response.json();

    if (response.ok && responseData?.messages?.[0]?.id) {
      const providerMsgId = responseData.messages[0].id;

      await logAuditEvent({
        projectId,
        eventType: "WHATSAPP_NOTIFICATION_DELIVERED",
        actor: "System",
        status: "Success",
        notes: `WhatsApp notification ${eventType} successfully dispatched via Meta Cloud API. Message ID: ${providerMsgId}`
      });

      return {
        attempted: true,
        delivered: true,
        status: "DELIVERED",
        providerMessageId: providerMsgId,
        notificationKey
      };
    } else {
      const errorMsg = responseData?.error?.message || response.statusText || "Meta API request rejected";
      console.error(`[WhatsApp Provider Error] Failed to send ${eventType} to ${recipientPhone}: ${errorMsg}`);

      await logAuditEvent({
        projectId,
        eventType: "WHATSAPP_NOTIFICATION_FAILED",
        actor: "System",
        status: "Failed",
        notes: `WhatsApp notification ${eventType} provider delivery failed: ${errorMsg}`
      });

      return {
        attempted: true,
        delivered: false,
        status: "FAILED",
        reason: errorMsg,
        notificationKey
      };
    }
  } catch (err: any) {
    console.error(`[WhatsApp Notification Error] Exception during ${eventType} dispatch for ${projectId}:`, err?.message || err);
    return {
      attempted: false,
      delivered: false,
      status: "FAILED",
      reason: err?.message || "whatsapp_dispatch_exception"
    };
  }
}
