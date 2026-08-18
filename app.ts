import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import compression from "compression";
import { addProject, getProjects, updateProject, getProjectById, logAuditEvent, getUserProfile, createUserProfile, updateUserProfileRole, getAllUserProfiles, ProjectRecord, normalizeOwnershipChoice, getChangeRequests, createChangeRequest, updateChangeRequest } from "./server/db.js";
import { getSupabase, logRuntimeEnv } from "./server/supabase.js";
import { getExtraData, updateQuote, addAssetFile } from "./server/extra_store.js";
import { verifyPaymentSignature, verifyWebhookSignature, getRazorpayInstance } from "./server/razorpay.js";
import { sendEmailAsync, getProjectCreatedTemplate, getPaymentSuccessTemplate, getPortalActivatedTemplate, getDeliverablesReadyTemplate } from "./server/email.js";
import { withRetry } from "./server/retry.js";
import { generatePaymentReceiptPDF } from "./server/receipt_pdf.js";
import {
  getHostingSubscription,
  updateHostingSubscription,
  addHostingInvoice,
  getHostingInvoices,
  getDomainRecord,
  updateDomainRecord,
  isWebhookProcessed,
  markWebhookProcessed,
  DEFAULT_HOSTING_CONFIG,
  getHostingPlanConfig,
  HostingSubscriptionRecord,
  HostingInvoiceRecord,
  runHostingLifecycleScan,
  runHostingLifecycleTestMatrix,
  getOrCreatePendingHostingInvoice,
  recordManualHostingPayment
} from "./server/hosting_model.js";
import { generateHostingReceiptPDF } from "./server/hosting_pdf.js";
import { sendHostingLifecycleNotification, runNotificationHardeningTestMatrix } from "./server/hosting_notifications.js";
import { getWhatsAppSystemStatus } from "./server/whatsapp_notifications.js";
import { processRazorpayWebhookEvent, runRazorpayWebhookAuditTestMatrix } from "./server/razorpay_webhook_processor.js";
import {
  triggerStatusChangeAutomation,
  triggerAdminNotification,
  initializeAutomationScheduler,
  runPeriodicAutomationScan
} from "./server/automation.js";
import {
  getAllCoupons,
  getCouponById,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  archiveCoupon,
  deleteCoupon,
  validateAndCalculateCoupon,
  recordRedemption
} from "./server/coupons.js";
import {
  createPreviewSession,
  getPreviewSessionByToken,
  isProjectIdPreview,
  getPreviewProject,
  getPreviewProjectsForUser,
  savePreviewProject,
  getPreviewExtra,
  savePreviewExtra,
  savePreviewAsset,
  getPreviewAsset,
  addPreviewChangeRequest,
  cleanupPreviewSession
} from "./server/preview_store.js";
import fs from "fs";
import os from "os";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { logger } from "./server/logger.js";
import {
  validateBody,
  validateQuery,
  validateProjectIdParam,
  createProjectSchema,
  getProjectsQuerySchema,
  authSchema,
  updateProjectSchema,
  saveQuoteSchema,
  createOrderSchema,
  verifyPaymentSchema,
  simulatePaymentSchema,
  uploadAssetSchema,
  adminVerifySchema,
  recommendationSchema,
  packageUpgradeSchema
} from "./server/validator.js";
import {
  requestTimeout,
  checkAbort,
  simulateDelayMiddleware
} from "./server/timeout.js";
import { cache } from "./server/cache.js";
import { calculateDeterministicScores } from "./server/deterministic_scoring.js";
import { checkUniqueness, registerContent } from "./server/uniqueness.js";
import { recordFounderAction, getFounderProfile } from "./server/founder_signals.js";
import { getGSCOpportunities, getGSCMarketInsight } from "./server/gsc_visibility.js";
import { enforceContentSafety } from "./server/content_safety.js";
import {
  getFounderNotifications,
  addFounderNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearFounderNotifications,
  resolveFounderNotificationsByType
} from "./server/founder_notifications_store.js";

dotenv.config();

const app = express();
app.use(compression());

// User-Agent Static Fallback Middleware for Bots and Crawlers
app.use((req, res, next) => {
  const userAgent = req.headers["user-agent"];
  if (!userAgent) {
    return next();
  }
  
  const ua = userAgent.toLowerCase();
  const botKeywords = [
    'googlebot', 'gptbot', 'gemini', 'claudebot', 'perplexity', 'bingbot', 
    'facebookexternalhit', 'n8n', 'crm', 'crawler', 'spider', 'bot', 
    'semrush', 'ahrefs', 'yandex', 'baidu', 'curl', 'axios', 'node-fetch', 
    'postman', 'automation', 'slackbot', 'twitterbot', 'telegrambot',
    'hubspot', 'zapier', 'integromat', 'make.com'
  ];
  
  const isBot = botKeywords.some(keyword => ua.includes(keyword));
  if (!isBot) {
    return next();
  }

  // Strip trailing slashes and query parameters for clean path matching
  const cleanPath = req.path.replace(/\/$/, "") || "/";
  
  const staticFilesMap: { [key: string]: string } = {
    "/": "homepage.html",
    "/index.html": "homepage.html",
    "/story": "story.html",
    "/process": "process.html",
    "/portfolio": "portfolio.html",
    "/pricing": "pricing.html",
    "/faq": "faq.html",
    "/contact": "contact.html"
  };

  const filename = staticFilesMap[cleanPath];
  if (filename) {
    const filePath = path.join(process.cwd(), filename);
    if (fs.existsSync(filePath)) {
      console.log(`[BOT DETECTED] Serving static fallback file ${filename} to User-Agent: ${userAgent} on path: ${req.path}`);
      return res.sendFile(filePath);
    }
  }

  next();
});

const PORT = 3000;

// Whitelist of allowed MIME types for Secure Upload Engine
const MIME_WHITELIST = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// Validate Magic Bytes against MIME Type
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/png") {
    return buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  if (mimeType === "image/gif") {
    return buffer.length >= 4 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
  }
  if (mimeType === "application/pdf") {
    return buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }
  if (mimeType === "image/webp") {
    return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  }
  if (mimeType === "image/svg+xml" || mimeType === "text/plain") {
    for (let i = 0; i < Math.min(buffer.length, 100); i++) {
      const char = buffer[i];
      if (char < 9 || (char > 13 && char < 32)) {
        return false;
      }
    }
    return true;
  }
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
  }
  if (mimeType === "application/msword") {
    return buffer.length >= 8 && buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0;
  }
  return true;
}

// Constant-time string comparison function to prevent timing attacks
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// JWT Authentication Middleware with fallback to admin password bypass
async function requireAuth(req: any, res: any, next: any) {
  if (res.headersSent || req.timedOut || req.clientDisconnected) return;
  try {
    const adminPassword = req.headers["x-admin-password"];
    const actualPassword = process.env.ADMIN_PASSWORD;

    if (actualPassword && adminPassword && safeCompare(adminPassword, actualPassword)) {
      req.isAdmin = true;
      req.user = {
        id: "admin-bypass",
        email: "admin@codefuser.com",
        role: "super_admin",
        fullName: "System Bypass",
        businessName: "CodeFuser Admin"
      };
      return next();
    }

    // Customer Preview Token check
    const previewToken = (
      req.headers["x-preview-token"] ||
      req.headers["x-codefuser-preview-token"] ||
      (req.headers["authorization"]?.startsWith("Bearer cf_prev_") ? req.headers["authorization"].split(" ")[1] : null) ||
      req.query.previewToken ||
      req.query["x-preview-token"]
    );
    if (previewToken && typeof previewToken === "string") {
      const previewSession = getPreviewSessionByToken(previewToken);
      if (previewSession) {
        req.isPreview = true;
        req.previewSession = previewSession;
        req.user = previewSession.user;
        req.isAdmin = true;
        return next();
      }
    }

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Authentication required. Missing token." });
    }

    const token = authHeader.split(" ")[1];
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ success: false, error: "Server authentication error: Supabase credentials are not configured." });
    }

    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data: { user }, error } = await tempClient.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: "Authentication failed: Invalid or expired token." });
    }

    // Secure Profile Retrieval with auto-creation (lazy migration for OAuth / older sign-ups)
    let profile = await getUserProfile(user.id, req.reqId);
    if (!profile) {
      console.log(`Lazy creating user profile for authenticated user: ${user.id} (${user.email})`);
      profile = await createUserProfile({
        id: user.id,
        email: user.email || "",
        role: "client",
        fullName: user.user_metadata?.full_name || "",
        businessName: user.user_metadata?.business_name || ""
      }, req.reqId);
    }

    req.user = {
      ...user,
      role: profile.role,
      fullName: profile.fullName,
      businessName: profile.businessName
    };
    req.isAdmin = (profile.role === "super_admin" || profile.role === "admin" || (user.email && user.email.trim().toLowerCase() === "jonathanthemanesticrun@gmail.com"));
    next();
  } catch (err: any) {
    logger.error("Authentication middleware error", err);
    return res.status(401).json({ success: false, error: "Authentication failed." });
  }
}

// Role-Based Access Control (RBAC) Enforcement Middleware
function requireRole(allowedRoles: ("super_admin" | "admin" | "client")[]) {
  return (req: any, res: any, next: any) => {
    if (res.headersSent || req.timedOut || req.clientDisconnected) return;
    
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Authentication required." });
    }

    if (!allowedRoles.includes(user.role) && !req.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: `Access denied: Required role not met (required: ${allowedRoles.join(" or ")}, present: ${user.role}).` 
      });
    }

    next();
  };
}

// Project Ownership Authorization Middleware with Auto-binding support
async function verifyProjectOwnership(req: any, res: any, next: any) {
  if (res.headersSent || req.timedOut || req.clientDisconnected) return;
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).json({ success: false, error: "Project ID is required." });
    }

    if (req.isPreview || isProjectIdPreview(projectId)) {
      const previewProject = getPreviewProject(projectId);
      if (previewProject) {
        req.project = previewProject;
        return next();
      }
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Authentication required." });
    }

    // 0. Admin or account owner override
    if (req.isAdmin || (user.email && user.email.trim().toLowerCase() === "jonathanthemanesticrun@gmail.com")) {
      req.project = project;
      return next();
    }

    let hasAccess = false;

    // 1. Explicit authenticated user ID match
    if (project.userId && project.userId === user.id) {
      hasAccess = true;
    }
    // 2. Email fallback with auto-binding lazy migration (binds projects permanently)
    else if (project.email && project.email.trim().toLowerCase() === user.email.trim().toLowerCase()) {
      hasAccess = true;
      if (!project.userId || project.userId !== user.id) {
        console.log(`Lazy migrating project ${projectId}: permanent binding to owner user ID ${user.id}`);
        try {
          await updateProject(projectId, { userId: user.id }, req.reqId);
          project.userId = user.id; // update local context
        } catch (err) {
          logger.error(`Failed to automatically bind user ${user.id} to project ${projectId}`, err);
        }
      }
    }
    // 3. Unowned/Guest project auto-claim: If project has no assigned owner or is a guest draft
    else if (!project.userId || project.userId.trim() === "" || project.userId === "guest" || project.userId === "null") {
      hasAccess = true;
      console.log(`Auto-claiming unowned/guest project ${projectId} for authenticated user ${user.id} (${user.email})`);
      try {
        await updateProject(projectId, { userId: user.id, email: user.email }, req.reqId);
        project.userId = user.id;
        project.email = user.email;
      } catch (err) {
        logger.error(`Failed to automatically claim project ${projectId} for user ${user.id}`, err);
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, error: "Access denied: You do not own this project." });
    }

    req.project = project;
    next();
  } catch (err: any) {
    logger.error("Ownership verification error", err);
    return res.status(500).json({ success: false, error: "Internal server error during authorization." });
  }
}

// Request-Response logging middleware using structured JSON logger
app.use((req: any, res: any, next) => {
  const start = Date.now();
  const reqId = crypto.randomUUID();
  req.reqId = reqId;

  logger.info(`Incoming request: ${req.method} ${req.url}`, {
    reqId,
    method: req.method,
    url: req.url,
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"],
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`Response completed: ${req.method} ${req.url} [${res.statusCode}]`, {
      reqId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });

  next();
});

// Explicit Production Security Headers Middleware
app.use((req, res, next) => {
  // Content-Security-Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https://*.supabase.co https://*.google.com https://*.googleusercontent.com https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com; " +
    "connect-src 'self' https://*.supabase.co https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com wss: ws:; " +
    "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com; " +
    "frame-ancestors 'self' https://ai.studio https://*.google.com https://*.google.com/aistudio https://*.run.app;"
  );

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Referrer-Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Strict-Transport-Security (HSTS)
  if (process.env.NODE_ENV === "production" || !!process.env.VERCEL) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
});

// Custom in-memory rate limiting implementation
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore: Record<string, Record<string, RateLimitRecord>> = {};

function createRateLimiter(windowMs: number, max: number, message: string) {
  return (req: any, res: any, next: any) => {
    if (res.headersSent || req.timedOut || req.clientDisconnected) return;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    // Normalize path by replacing dynamic IDs with placeholder to avoid key explosion
    let routeKey = req.baseUrl + req.path;
    if (req.params && req.params.id) {
      routeKey = routeKey.replace(req.params.id, ":id");
    }
    const now = Date.now();

    if (!rateLimitStore[routeKey]) {
      rateLimitStore[routeKey] = {};
    }

    const clientRecord = rateLimitStore[routeKey][ip];

    if (!clientRecord || now > clientRecord.resetTime) {
      rateLimitStore[routeKey][ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - 1);
      res.setHeader("X-RateLimit-Reset", Math.ceil((now + windowMs) / 1000));
      return next();
    }

    if (clientRecord.count >= max) {
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("X-RateLimit-Reset", Math.ceil(clientRecord.resetTime / 1000));
      res.setHeader("Retry-After", Math.ceil((clientRecord.resetTime - now) / 1000));
      return res.status(429).json({ success: false, error: message });
    }

    clientRecord.count++;
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", max - clientRecord.count);
    res.setHeader("X-RateLimit-Reset", Math.ceil(clientRecord.resetTime / 1000));
    next();
  };
}

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const routeKey of Object.keys(rateLimitStore)) {
    for (const ip of Object.keys(rateLimitStore[routeKey])) {
      if (now > rateLimitStore[routeKey][ip].resetTime) {
        delete rateLimitStore[routeKey][ip];
      }
    }
    if (Object.keys(rateLimitStore[routeKey]).length === 0) {
      delete rateLimitStore[routeKey];
    }
  }
}, 5 * 60 * 1000);

const adminRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  15,
  "Too many administrative authentication attempts. Please try again in 15 minutes."
);

const projectsRateLimiter = createRateLimiter(
  1 * 60 * 1000,
  100,
  "Too many project request attempts. Please slow down."
);

const uploadRateLimiter = createRateLimiter(
  5 * 60 * 1000,
  10,
  "Too many asset upload attempts. Please try again later."
);

const paymentVerificationRateLimiter = createRateLimiter(
  5 * 60 * 1000,
  15,
  "Too many payment verification attempts. Please try again later."
);

const webhookRateLimiter = createRateLimiter(
  1 * 60 * 1000,
  120,
  "Too many webhook delivery requests. Please slow down."
);

// Request body parser with 50mb limit for base64 file uploads and raw body capture for webhook signature verification
app.use(express.json({
  limit: "50mb",
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Global dynamic request timeout middleware applied to all /api routes
app.use("/api", (req: any, res: any, next: any) => {
  let timeoutMs = 15000; // Default 15 seconds
  let operationName = "API Operation";

  const url = req.path || "";
  if (url.includes("/upload")) {
    timeoutMs = 45000;
    operationName = "Asset Upload";
  } else if (url.includes("/recommendation")) {
    timeoutMs = 45000;
    operationName = "AI Recommendation";
  } else if (url.includes("/package-upgrade-options")) {
    timeoutMs = 45000;
    operationName = "AI Upgrade Options";
  } else if (url.includes("/razorpay-order") || url.includes("/verify-payment")) {
    timeoutMs = 25000;
    operationName = "Razorpay Transaction";
  }

  requestTimeout(timeoutMs, operationName)(req, res, next);
});

app.use(simulateDelayMiddleware);

// Serve uploaded files statically. On Vercel, process.cwd() is read-only.
// We use a writable temporary directory in serverless/production to avoid read-only filesystem issues,
// and local public/uploads for local development. We do NOT mutate the filesystem in /public on startup.
const isVercel = !!process.env.VERCEL;
const uploadsDir = isVercel 
  ? path.join(os.tmpdir(), "uploads")
  : path.join(process.cwd(), "public", "uploads");

app.use("/uploads", express.static(uploadsDir));

// Global Customer Preview Mode Header / Query Extractor Middleware
app.use("/api", (req: any, res: any, next: any) => {
  const previewToken = (
    req.headers["x-preview-token"] ||
    req.headers["x-codefuser-preview-token"] ||
    (req.headers["authorization"]?.startsWith("Bearer cf_prev_") ? req.headers["authorization"].split(" ")[1] : null) ||
    req.query.previewToken ||
    req.query["x-preview-token"]
  );
  if (previewToken && typeof previewToken === "string") {
    const session = getPreviewSessionByToken(previewToken);
    if (session) {
      req.isPreview = true;
      req.previewSession = session;
    }
  }
  next();
});

// ADMIN PREVIEW MANAGEMENT ENDPOINTS

// POST /api/admin/preview/start - Initialize a new isolated Customer Preview session
app.post("/api/admin/preview/start", requireAuth, async (req: any, res) => {
  try {
    const adminUser = req.user || { id: "admin-bypass", email: "admin@codefuser.com", role: "super_admin" };
    const session = createPreviewSession(adminUser);
    logger.info(`[CUSTOMER PREVIEW] Admin initialized preview session token: ${session.previewToken} for project ${session.projectId}`);
    return res.json({
      success: true,
      message: "Customer preview session started (Isolated Environment).",
      session
    });
  } catch (err: any) {
    logger.error("Failed to start preview session:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to start preview session." });
  }
});

// GET /api/admin/preview/session - Verify active preview session status
app.get("/api/admin/preview/session", async (req: any, res) => {
  try {
    const previewToken = (
      req.headers["x-preview-token"] ||
      req.headers["x-codefuser-preview-token"] ||
      (req.headers["authorization"]?.startsWith("Bearer cf_prev_") ? req.headers["authorization"].split(" ")[1] : null) ||
      req.query.previewToken ||
      req.query["x-preview-token"]
    );
    if (!previewToken || typeof previewToken !== "string") {
      return res.json({ success: false, active: false, message: "No preview token provided." });
    }
    const session = getPreviewSessionByToken(previewToken);
    if (!session) {
      return res.json({ success: false, active: false, message: "Invalid or expired preview session token." });
    }
    const project = getPreviewProject(session.projectId);
    return res.json({
      success: true,
      active: true,
      session,
      project
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to check preview session." });
  }
});

// POST /api/admin/preview/exit - Exit and cleanup preview session data
app.post("/api/admin/preview/exit", async (req: any, res) => {
  try {
    const previewToken = (
      req.headers["x-preview-token"] ||
      req.headers["x-codefuser-preview-token"] ||
      (req.headers["authorization"]?.startsWith("Bearer cf_prev_") ? req.headers["authorization"].split(" ")[1] : null) ||
      req.body.previewToken ||
      req.query.previewToken
    );
    if (previewToken && typeof previewToken === "string") {
      cleanupPreviewSession(previewToken);
    }
    return res.json({ success: true, message: "Customer preview session terminated and cleaned up." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to terminate preview session." });
  }
});

// API: Validate Step 1 uniqueness
app.post("/api/projects/validate-step1", projectsRateLimiter, async (req: any, res) => {
  try {
    const { email, whatsapp, userId, currentProjectId } = req.body;

    if (req.isPreview) {
      return res.json({
        duplicate: false,
        hasMatch: false,
        noticeType: "preview_mode",
        message: "Customer Preview Mode Active (Isolated Environment).",
        draftProject: null
      });
    }
    
    // Check validation cache to prevent repeated database lookup overhead
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedWhatsapp = String(whatsapp || "").trim().replace(/\s+/g, "");
    const cacheKey = `validate:step1:${normalizedEmail}:${normalizedWhatsapp}:${String(userId || "")}:${String(currentProjectId || "")}`;
    
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      logger.info(`[PERF] Step 1 validation cache hit! Key: ${cacheKey}`);
      return res.json(JSON.parse(cachedResult));
    }

    const supabase = getSupabase();

    // 1. If user is authenticated and logged in, check active project ownership
    if (userId && typeof userId === "string" && userId !== "admin-bypass" && userId.trim() !== "") {
      const { data: userMatch } = await supabase
        .from("projects")
        .select("id, business_name, client_name, email, whatsapp, selected_package, status, created_at")
        .eq("user_id", userId);

      if (userMatch && userMatch.length > 0) {
        // Exclude current project if user is editing their current active draft
        const filteredUserMatches = userMatch.filter(p => p.id !== currentProjectId);
        if (filteredUserMatches.length > 0) {
          const result = {
            duplicate: false,
            hasMatch: true,
            noticeType: "registered_client",
            message: "Welcome back! You have active project(s) in your CodeFuser account.",
            existingCount: filteredUserMatches.length,
            draftProject: filteredUserMatches[filteredUserMatches.length - 1] ? {
              id: filteredUserMatches[filteredUserMatches.length - 1].id,
              businessName: filteredUserMatches[filteredUserMatches.length - 1].business_name,
              clientName: filteredUserMatches[filteredUserMatches.length - 1].client_name,
              email: filteredUserMatches[filteredUserMatches.length - 1].email,
              whatsapp: filteredUserMatches[filteredUserMatches.length - 1].whatsapp,
              selectedPackage: filteredUserMatches[filteredUserMatches.length - 1].selected_package,
              createdAt: filteredUserMatches[filteredUserMatches.length - 1].created_at || new Date().toISOString()
            } : null
          };
          await cache.set(cacheKey, JSON.stringify(result), 30);
          return res.json(result);
        }
      }
    }

    // 2. Query projects matching email or whatsapp
    let matchedProjects: any[] = [];
    if (normalizedEmail) {
      const { data: emailMatches } = await supabase
        .from("projects")
        .select("id, business_name, client_name, email, whatsapp, selected_package, status, created_at, onboarding, quote")
        .eq("email", normalizedEmail);
      if (emailMatches) matchedProjects.push(...emailMatches);
    }

    if (normalizedWhatsapp) {
      const { data: allProjects } = await supabase
        .from("projects")
        .select("id, business_name, client_name, email, whatsapp, selected_package, status, created_at, onboarding, quote");
      if (allProjects) {
        for (const p of allProjects) {
          if (p.whatsapp) {
            const dbClean = p.whatsapp.replace(/\s+/g, "");
            if (dbClean === normalizedWhatsapp) {
              if (!matchedProjects.some(m => m.id === p.id)) {
                matchedProjects.push(p);
              }
            }
          }
        }
      }
    }

    // Exclude current project ID that was just created/saved in this session
    if (currentProjectId) {
      matchedProjects = matchedProjects.filter(p => p.id !== currentProjectId);
    }

    // Exclude drafts created in the last 10 minutes (which belong to the current auto-save filling session)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    matchedProjects = matchedProjects.filter(p => {
      if (p.status === 'draft' && p.created_at) {
        const createdDate = new Date(p.created_at);
        if (createdDate > tenMinutesAgo) {
          return false; // Ignore very fresh auto-saved drafts from the current form session
        }
      }
      return true;
    });

    if (matchedProjects.length > 0) {
      const latest = matchedProjects[matchedProjects.length - 1];
      const isUnfinished = latest.status === 'draft' || latest.status === 'pending' || !latest.status;
      
      const result = {
        duplicate: false,
        hasMatch: true,
        noticeType: isUnfinished ? "unfinished_draft" : "existing_projects",
        message: isUnfinished 
          ? `We found an unfinished project draft linked to this contact number (${latest.business_name || 'Draft'}).`
          : "Welcome back! We found previous project(s) linked to this contact number.",
        existingCount: matchedProjects.length,
        draftProject: {
          id: latest.id,
          businessName: latest.business_name || "",
          clientName: latest.client_name || "",
          email: latest.email || "",
          whatsapp: latest.whatsapp || "",
          selectedPackage: latest.selected_package || "fusion",
          industry: latest.industry || "",
          goal: latest.goal || "",
          aiPrompt: latest.ai_prompt || "",
          createdAt: latest.created_at || new Date().toISOString()
        }
      };
      await cache.set(cacheKey, JSON.stringify(result), 30);
      return res.json(result);
    }

    const successResult = {
      duplicate: false,
      hasMatch: false,
      noticeType: null
    };
    await cache.set(cacheKey, JSON.stringify(successResult), 30);
    return res.json(successResult);
  } catch (error: any) {
    console.error("Step 1 validation error:", error);
    return res.status(500).json({ error: "Unable to complete validation check. Please try again later." });
  }
});

// API: Automatically save draft project state to Supabase at any step
app.post("/api/projects/save-draft", projectsRateLimiter, async (req: any, res) => {
  try {
    const {
      projectId,
      userId,
      ownerName,
      clientName,
      businessName,
      email,
      whatsapp,
      selectedPackage,
      packageId,
      ownershipChoice,
      ownership,
      industry,
      customIndustry,
      goal,
      customGoal,
      hasDomain,
      hasLogo,
      contentReady,
      aiPrompt,
      currentStep,
      step,
      completedSteps,
      onboardingStage,
      recommendationCards,
      aiSummary,
      selectedCardId,
      selectedPaymentTerm,
      upsell,
      assets,
      localPhone,
      selectedCountryCode
    } = req.body;

    const supabase = getSupabase();
    
    // Extract auth user if token present
    let authUser: any = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token && token.length > 10) {
        const { data: { user } } = await supabase.auth.getUser(token).catch(() => ({ data: { user: null } }));
        authUser = user;
      }
    }

    const targetUserId = authUser?.id || userId || "";
    const cleanEmail = String(email || authUser?.email || "").trim().toLowerCase();
    const cleanWhatsapp = String(whatsapp || "").trim();
    const activeClientName = ownerName || clientName || authUser?.user_metadata?.full_name || authUser?.fullName || "";
    const activeBusinessName = businessName || authUser?.user_metadata?.business_name || authUser?.businessName || "";
    const activePackage = packageId || selectedPackage || "growth";
    const activeOwnership = normalizeOwnershipChoice(ownership || ownershipChoice);
    const activeStep = currentStep ?? step ?? 1;

    if (req.isPreview || (projectId && isProjectIdPreview(projectId))) {
      const activeProjId = projectId || req.previewSession?.projectId || "prev_proj_default";
      const existing = getPreviewProject(activeProjId);
      const existingQuote = existing?.quote || {};
      const mergedCards = recommendationCards || existingQuote.recommendationCards || null;
      const mergedAiSummary = aiSummary || existingQuote.aiSummary || null;
      const generatedTimestamp = existingQuote.generatedTimestamp || (mergedCards ? new Date().toISOString() : null);

      const updatedQuote = {
        ...existingQuote,
        currentStep: activeStep,
        onboardingStage: onboardingStage || existingQuote.onboardingStage || "form",
        completedSteps: completedSteps || existingQuote.completedSteps || [1],
        recommendationCards: mergedCards,
        aiSummary: mergedAiSummary,
        selectedCardId: selectedCardId || existingQuote.selectedCardId || "current",
        selectedPaymentTerm: selectedPaymentTerm || existingQuote.selectedPaymentTerm || "milestone",
        frozenPrice: mergedCards?.find((c: any) => c.id === (selectedCardId || "current"))?.price || existingQuote.frozenPrice || null,
        aiVersion: existingQuote.aiVersion || "1.0",
        generatedTimestamp: generatedTimestamp,
        upsell: upsell || existingQuote.upsell || null,
        localPhone: localPhone || existingQuote.localPhone || "",
        selectedCountryCode: selectedCountryCode || existingQuote.selectedCountryCode || "",
        aiPrompt: aiPrompt ?? existingQuote.aiPrompt ?? ""
      };

      const previewRecord = savePreviewProject({
        id: activeProjId,
        clientName: activeClientName || existing?.clientName || "Preview Client",
        businessName: activeBusinessName || existing?.businessName || "Preview Business",
        email: cleanEmail || existing?.email || "preview@codefuser.test",
        whatsapp: cleanWhatsapp || existing?.whatsapp || "+91 9876543210",
        selectedPackage: activePackage || existing?.selectedPackage || "growth",
        ownershipChoice: activeOwnership || existing?.ownershipChoice || "buyout",
        industry: industry || existing?.industry || "",
        customIndustry: customIndustry || existing?.customIndustry || "",
        goal: goal || existing?.goal || "",
        customGoal: customGoal || existing?.customGoal || "",
        hasDomain: hasDomain || existing?.hasDomain || "help",
        hasLogo: hasLogo || existing?.hasLogo || "help",
        contentReady: contentReady || existing?.contentReady || "no_help",
        timestamp: existing?.timestamp || new Date().toISOString(),
        status: existing?.status || "draft",
        userId: targetUserId || req.previewSession?.user?.id || existing?.userId || "prev_user_default",
        paymentStatus: existing?.paymentStatus || "unpaid",
        portalAccess: existing?.portalAccess || false,
        quote: updatedQuote,
        assets: assets || existing?.assets || [],
        aiPrompt: aiPrompt || existing?.aiPrompt || ""
      });

      return res.json({ success: true, project: previewRecord });
    }

    let existingProject: any = null;

    // 1. Check by explicit projectId
    if (projectId) {
      existingProject = await getProjectById(projectId);
    }

    // 2. If no project found by id and NOT explicitly starting a new project, search by targetUserId or email/whatsapp
    if (!existingProject && !req.body.isNewProject && targetUserId) {
      const { data: userProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });
      if (userProjects && userProjects.length > 0) {
        existingProject = userProjects[0];
      }
    }

    if (!existingProject && !req.body.isNewProject && cleanEmail) {
      const { data: emailProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("email", cleanEmail)
        .order("created_at", { ascending: false });
      if (emailProjects && emailProjects.length > 0) {
        existingProject = emailProjects[0];
      }
    }

    const existingQuote = existingProject?.quote || {};

    // Freeze AI Recommendations logic: preserve existing cards if provided or stored
    const mergedCards = recommendationCards || existingQuote.recommendationCards || null;
    const mergedAiSummary = aiSummary || existingQuote.aiSummary || null;
    const generatedTimestamp = existingQuote.generatedTimestamp || (mergedCards ? new Date().toISOString() : null);

    const updatedQuote = {
      ...existingQuote,
      currentStep: activeStep,
      onboardingStage: onboardingStage || existingQuote.onboardingStage || "form",
      completedSteps: completedSteps || existingQuote.completedSteps || [1],
      recommendationCards: mergedCards,
      aiSummary: mergedAiSummary,
      selectedCardId: selectedCardId || existingQuote.selectedCardId || "current",
      selectedPaymentTerm: selectedPaymentTerm || existingQuote.selectedPaymentTerm || "milestone",
      frozenPrice: mergedCards?.find((c: any) => c.id === (selectedCardId || "current"))?.price || existingQuote.frozenPrice || null,
      aiVersion: existingQuote.aiVersion || "1.0",
      generatedTimestamp: generatedTimestamp,
      upsell: upsell || existingQuote.upsell || null,
      localPhone: localPhone || existingQuote.localPhone || "",
      selectedCountryCode: selectedCountryCode || existingQuote.selectedCountryCode || "",
      aiPrompt: aiPrompt ?? existingQuote.aiPrompt ?? ""
    };

    if (existingProject) {
      // Update existing project in Supabase
      const existingOnboarding = existingProject.onboarding || {};
      const updates: any = {
        clientName: activeClientName || existingProject.clientName,
        businessName: activeBusinessName || existingProject.businessName,
        email: cleanEmail || existingProject.email,
        whatsapp: cleanWhatsapp || existingProject.whatsapp,
        selectedPackage: activePackage || existingProject.selectedPackage,
        ownershipChoice: activeOwnership || existingProject.ownershipChoice,
        industry: industry ?? existingOnboarding.industry ?? existingProject.industry,
        customIndustry: customIndustry ?? existingOnboarding.customIndustry ?? existingProject.customIndustry,
        goal: goal ?? existingOnboarding.goal ?? existingProject.goal,
        customGoal: customGoal ?? existingOnboarding.customGoal ?? existingProject.customGoal,
        hasDomain: hasDomain ?? existingOnboarding.hasDomain ?? existingProject.hasDomain,
        hasLogo: hasLogo ?? existingOnboarding.hasLogo ?? existingProject.hasLogo,
        contentReady: contentReady ?? existingOnboarding.contentReady ?? existingProject.contentReady,
        onboarding: {
          industry: industry ?? existingOnboarding.industry ?? existingProject.industry ?? "",
          customIndustry: customIndustry ?? existingOnboarding.customIndustry ?? existingProject.customIndustry ?? "",
          goal: goal ?? existingOnboarding.goal ?? existingProject.goal ?? "",
          customGoal: customGoal ?? existingOnboarding.customGoal ?? existingProject.customGoal ?? "",
          hasDomain: hasDomain ?? existingOnboarding.hasDomain ?? existingProject.hasDomain ?? "",
          hasLogo: hasLogo ?? existingOnboarding.hasLogo ?? existingProject.hasLogo ?? "",
          contentReady: contentReady ?? existingOnboarding.contentReady ?? existingProject.contentReady ?? ""
        },
        quote: updatedQuote,
      };

      if (targetUserId && (!existingProject.userId || existingProject.userId !== targetUserId)) {
        updates.userId = targetUserId;
      }
      if (assets) {
        updates.assets = assets;
      }

      const updated = await updateProject(existingProject.id, updates, req.reqId);
      return res.json({ success: true, project: updated });
    } else {
      // Create new draft project in Supabase
      const onboardingObj = {
        industry: industry || "",
        customIndustry: customIndustry || "",
        goal: goal || "",
        customGoal: customGoal || "",
        hasDomain: hasDomain || "help",
        hasLogo: hasLogo || "help",
        contentReady: contentReady || "no_help"
      };
      const newRecord: Partial<ProjectRecord> = {
        clientName: activeClientName,
        businessName: activeBusinessName,
        email: cleanEmail,
        whatsapp: cleanWhatsapp,
        selectedPackage: activePackage,
        ownershipChoice: activeOwnership,
        industry: industry || "",
        customIndustry: customIndustry || "",
        goal: goal || "",
        customGoal: customGoal || "",
        hasDomain: hasDomain || "help",
        hasLogo: hasLogo || "help",
        contentReady: contentReady || "no_help",
        onboarding: onboardingObj,
        timestamp: new Date().toISOString(),
        status: "draft",
        userId: targetUserId,
        paymentStatus: "unpaid",
        portalAccess: false,
        quote: updatedQuote,
        assets: assets || [],
        aiPrompt: aiPrompt || ""
      };

      const added = await addProject(newRecord, req.reqId);
      return res.json({ success: true, project: added });
    }
  } catch (err: any) {
    console.dir(err, { depth: null });
    console.log(JSON.stringify(err, null, 2));
    return res.status(500).json(err);
  }
});

// API: Get active project / draft for current user or session
app.get("/api/projects/active", projectsRateLimiter, async (req: any, res) => {
  try {
    if (req.isPreview) {
      const projId = req.previewSession?.projectId || "prev_proj_default";
      const previewProj = getPreviewProject(projId);
      return res.json({ success: true, project: previewProj });
    }
    const supabase = getSupabase();
    let authUser: any = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token && token.length > 10) {
        const { data: { user } } = await supabase.auth.getUser(token).catch(() => ({ data: { user: null } }));
        authUser = user;
      }
    }

    let queryUserId = authUser?.id || req.query.userId || "";
    if (queryUserId === "undefined" || queryUserId === "null") {
      queryUserId = authUser?.id || "";
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (queryUserId && !uuidRegex.test(queryUserId)) {
      console.warn(`[API /projects/active] Invalid userId received: "${queryUserId}". Ignoring invalid userId string.`);
      queryUserId = authUser?.id && uuidRegex.test(authUser.id) ? authUser.id : "";
    }

    let queryEmail = String(req.query.email || authUser?.email || "").trim().toLowerCase();
    if (queryEmail === "undefined" || queryEmail === "null") {
      queryEmail = authUser?.email ? String(authUser.email).trim().toLowerCase() : "";
    }
    const queryWhatsapp = String(req.query.whatsapp || "").trim();

    if (!queryUserId && !queryEmail && !queryWhatsapp) {
      return res.json({ success: true, project: null });
    }

    const projects = await getProjects(req.reqId, {
      userId: queryUserId || undefined,
      email: queryEmail || undefined
    });

    if (projects && projects.length > 0) {
      return res.json({ success: true, project: projects[0] });
    }

    return res.json({ success: true, project: null });
  } catch (err: any) {
    console.error("Failed to retrieve active project from Supabase:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch active project." });
  }
});

// API: Create new project
app.post("/api/projects", projectsRateLimiter, validateBody(createProjectSchema), async (req: any, res) => {
  try {
    const {
      ownerName,
      businessName,
      email,
      whatsapp,
      packageId,
      ownership,
      ownershipChoice,
      industry,
      customIndustry,
      goal,
      customGoal,
      hasDomain,
      hasLogo,
      contentReady,
      userId,
      aiPrompt
    } = req.body;

    // Validate required fields
    if (!ownerName || !businessName || !email || !whatsapp) {
      return res.status(400).json({ error: "Required fields (ownerName, businessName, email, whatsapp) are missing." });
    }

    let resolvedUserId = userId || "";
    if (!resolvedUserId && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        if (token && supabaseUrl && supabaseAnonKey) {
          const tempClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
          const { data: { user } } = await tempClient.auth.getUser(token);
          if (user) {
            resolvedUserId = user.id;
          }
        }
      } catch (e) {
        // Optional token parsing
      }
    }

    const { projectId, isNewProject } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (req.isPreview || (projectId && isProjectIdPreview(projectId))) {
      const activeProjId = projectId || req.previewSession?.projectId || ("prev_proj_" + Date.now());
      const existing = getPreviewProject(activeProjId);
      const savedProject = savePreviewProject({
        id: activeProjId,
        clientName: ownerName || existing?.clientName || "Preview Client",
        businessName: businessName || existing?.businessName || "Preview Business",
        email: cleanEmail || existing?.email || "preview@codefuser.test",
        whatsapp: whatsapp || existing?.whatsapp || "+91 9876543210",
        selectedPackage: packageId || existing?.selectedPackage || "growth",
        ownershipChoice: normalizeOwnershipChoice(ownership || ownershipChoice || existing?.ownershipChoice),
        industry: industry || existing?.industry || "",
        customIndustry: customIndustry || existing?.customIndustry || "",
        goal: goal || existing?.goal || "",
        customGoal: customGoal || existing?.customGoal || "",
        hasDomain: hasDomain || existing?.hasDomain || "",
        hasLogo: hasLogo || existing?.hasLogo || "",
        contentReady: contentReady || existing?.contentReady || "",
        userId: resolvedUserId || req.previewSession?.user?.id || existing?.userId || "prev_user_default",
        aiPrompt: aiPrompt || existing?.aiPrompt || "",
        status: "Assets Pending"
      });

      logger.info(`[Preview Store] Project created/updated in preview mode: ${savedProject.id}`);

      return res.json({
        success: true,
        message: "Project submitted successfully (Customer Preview Mode)",
        data: savedProject
      });
    }

    const supabase = getSupabase();

    let existingProject: any = null;

    // 1. Check by explicit projectId
    if (projectId) {
      existingProject = await getProjectById(projectId);
    }

    // 2. If no project found by id and NOT explicitly starting a new project, search by resolvedUserId or email
    if (!existingProject && !isNewProject && resolvedUserId) {
      const { data: userProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", resolvedUserId)
        .order("created_at", { ascending: false });
      if (userProjects && userProjects.length > 0) {
        existingProject = userProjects[0];
      }
    }

    if (!existingProject && !isNewProject && cleanEmail) {
      const { data: emailProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("email", cleanEmail)
        .order("created_at", { ascending: false });
      if (emailProjects && emailProjects.length > 0) {
        existingProject = emailProjects[0];
      }
    }

    checkAbort(req);

    if (existingProject) {
      console.log(`Updating existing project draft (${existingProject.id}) on submit...`);
      const existingOnboarding = existingProject.onboarding || {};
      const updates: any = {
        clientName: ownerName || existingProject.clientName,
        businessName: businessName || existingProject.businessName,
        email: cleanEmail || existingProject.email,
        whatsapp: whatsapp || existingProject.whatsapp,
        selectedPackage: packageId || existingProject.selectedPackage,
        ownershipChoice: normalizeOwnershipChoice(ownership || ownershipChoice || existingProject.ownershipChoice),
        industry: industry ?? existingOnboarding.industry ?? existingProject.industry,
        customIndustry: customIndustry ?? existingOnboarding.customIndustry ?? existingProject.customIndustry,
        goal: goal ?? existingOnboarding.goal ?? existingProject.goal,
        customGoal: customGoal ?? existingOnboarding.customGoal ?? existingProject.customGoal,
        hasDomain: hasDomain ?? existingOnboarding.hasDomain ?? existingProject.hasDomain,
        hasLogo: hasLogo ?? existingOnboarding.hasLogo ?? existingProject.hasLogo,
        contentReady: contentReady ?? existingOnboarding.contentReady ?? existingProject.contentReady,
        onboarding: {
          industry: industry ?? existingOnboarding.industry ?? existingProject.industry ?? "",
          customIndustry: customIndustry ?? existingOnboarding.customIndustry ?? existingProject.customIndustry ?? "",
          goal: goal ?? existingOnboarding.goal ?? existingProject.goal ?? "",
          customGoal: customGoal ?? existingOnboarding.customGoal ?? existingProject.customGoal ?? "",
          hasDomain: hasDomain ?? existingOnboarding.hasDomain ?? existingProject.hasDomain ?? "",
          hasLogo: hasLogo ?? existingOnboarding.hasLogo ?? existingProject.hasLogo ?? "",
          contentReady: contentReady ?? existingOnboarding.contentReady ?? existingProject.contentReady ?? ""
        },
        status: existingProject.status === "draft" ? "Assets Pending" : existingProject.status
      };

      if (resolvedUserId && (!existingProject.userId || existingProject.userId !== resolvedUserId)) {
        updates.userId = resolvedUserId;
      }
      if (aiPrompt) {
        updates.aiPrompt = aiPrompt;
      }

      const savedProject = await updateProject(existingProject.id, updates, req.reqId);

      addFounderNotification({
        type: "new_project",
        projectId: savedProject.id,
        projectName: savedProject.businessName || savedProject.clientName || "New Client",
        title: "New project",
        message: `${savedProject.businessName || savedProject.clientName || "New Client"} submitted a project.`,
        actionLabel: "Review project",
        severity: "important"
      });

      await logAuditEvent({
        projectId: savedProject.id,
        eventType: "Project Submitted",
        requestId: req.reqId,
        actor: "Client",
        status: "Success",
        notes: `Project draft updated and submitted for ${savedProject.businessName} (package: ${savedProject.selectedPackage})`
      });

      // Dispatch Internal Admin Alert
      triggerAdminNotification(
        "New Project Filed",
        `A new system project spec has been registered for ${savedProject.businessName} by ${savedProject.clientName}.`,
        {
          "Project ID": savedProject.id,
          "Client Name": savedProject.clientName,
          "Business Name": savedProject.businessName,
          "Selected Tier": savedProject.selectedPackage,
          "Industry": savedProject.industry || "Not Specified",
          "Email": savedProject.email,
          "WhatsApp": savedProject.whatsapp
        },
        req.reqId
      );

      // Send Project Created Email Notification asynchronously
      const devUrl = process.env.DEV_APP_URL || "http://localhost:3000";
      const portalUrl = `${devUrl}/login`;
      const emailHtml = getProjectCreatedTemplate(
        savedProject.clientName,
        savedProject.businessName,
        savedProject.selectedPackage,
        portalUrl
      );
      sendEmailAsync(savedProject.email, `Welcome to CodeFuser - ${savedProject.businessName} Project Filed`, emailHtml);

      return res.json({ success: true, message: "Project submitted successfully", data: savedProject });
    }

    const payload = {
      clientName: ownerName,
      businessName,
      email,
      whatsapp,
      selectedPackage: packageId,
      ownershipChoice: normalizeOwnershipChoice(ownership || ownershipChoice),
      industry: industry || "",
      customIndustry: customIndustry || "",
      goal: goal || "",
      customGoal: customGoal || "",
      hasDomain: hasDomain || "",
      hasLogo: hasLogo || "",
      contentReady: contentReady || "",
      userId: resolvedUserId,
      aiPrompt: aiPrompt || ""
    };

    console.log("Compiling and initializing new project in CodeFuser Core architecture style...");
    const savedProject = await addProject(payload, req.reqId);

    addFounderNotification({
      type: "new_project",
      projectId: savedProject.id,
      projectName: savedProject.businessName || savedProject.clientName || "New Client",
      title: "New project",
      message: `${savedProject.businessName || savedProject.clientName || "New Client"} submitted a project.`,
      actionLabel: "Review project",
      severity: "important"
    });

    // Track business event in Audit Trail
    await logAuditEvent({
      projectId: savedProject.id,
      eventType: "Project Created",
      requestId: req.reqId,
      actor: "Client",
      status: "Success",
      notes: `Project filed for ${savedProject.businessName} (package: ${savedProject.selectedPackage})`
    });

    // Send Project Created Email Notification asynchronously
    const devUrl = process.env.DEV_APP_URL || "http://localhost:3000";
    const portalUrl = `${devUrl}/login`;
    const emailHtml = getProjectCreatedTemplate(
      savedProject.clientName,
      savedProject.businessName,
      savedProject.selectedPackage,
      portalUrl
    );
    sendEmailAsync(savedProject.email, `Welcome to CodeFuser - ${savedProject.businessName} Project Filed`, emailHtml);
    
    // Dispatch Internal Admin Alert
    triggerAdminNotification(
      "New Project Filed",
      `A new system project spec has been registered for ${savedProject.businessName} by ${savedProject.clientName}.`,
      {
        "Project ID": savedProject.id,
        "Client Name": savedProject.clientName,
        "Business Name": savedProject.businessName,
        "Selected Tier": savedProject.selectedPackage,
        "Industry": savedProject.industry || "Not Specified",
        "Email": savedProject.email,
        "WhatsApp": savedProject.whatsapp
      },
      req.reqId
    );

    if (res.headersSent || req.timedOut) return;

    return res.status(201).json({
      success: true,
      data: savedProject,
      message: "Project compiled and registered successfully under Core flow."
    });
  } catch (error: any) {
    if (res.headersSent) return;
    console.dir(error, { depth: null });
    console.log(JSON.stringify(error, null, 2));
    return res.status(500).json(error);
  }
});

// API: Get all active projects (with secure authenticated filtering support)
app.get("/api/projects", requestTimeout(10000, "Get Projects"), requireAuth, projectsRateLimiter, validateQuery(getProjectsQuerySchema), async (req: any, res) => {
  const reqStart = Date.now();
  console.log(`[TRACING SERVER] GET /api/projects entered | reqId: ${req.reqId} | user: ${req.user?.id} (${req.user?.email}) | query:`, req.query);
  try {
    if (req.isPreview) {
      const projects = getPreviewProjectsForUser(req.user?.id || "prev_user_default");
      return res.json({ projects });
    }

    const { userId, email } = req.query;
    checkAbort(req);
    
    if (req.isAdmin) {
      console.log(`[TRACING SERVER] GET /api/projects processing as admin`);
      const filter = (userId || email) ? { userId: userId ? String(userId) : undefined, email: email ? String(email) : undefined } : undefined;
      const projects = await getProjects(req.reqId, filter);
      
      if (res.headersSent || req.timedOut) {
        console.log(`[TRACING SERVER] GET /api/projects headers already sent or timed out`);
        return;
      }
      console.log(`[TRACING SERVER] GET /api/projects admin returning ${projects.length} projects | duration: ${Date.now() - reqStart}ms`);
      return res.json({ projects });
    }
    
    console.log(`[TRACING SERVER] GET /api/projects processing as user ${req.user?.id}`);
    const projects = await getProjects(req.reqId, {
      userId: req.user.id,
      email: req.user.email
    });
    
    if (res.headersSent || req.timedOut) {
      console.log(`[TRACING SERVER] GET /api/projects headers already sent or timed out`);
      return;
    }
    console.log(`[TRACING SERVER] GET /api/projects user returning ${projects.length} projects | duration: ${Date.now() - reqStart}ms`);
    return res.json({ projects });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("[TRACING SERVER] Failed to load project database items:", error);
    return res.status(500).json({ error: error.message || String(error) });
  }
});

// API: Customer Registration (SignUp Proxy)
app.post("/api/auth/signup", requestTimeout(10000, "Auth Signup"), validateBody(authSchema), async (req: any, res) => {
  try {
    const { email, password, fullName, businessName } = req.body;
    checkAbort(req);

    if (req.isPreview) {
      return res.json({
        success: true,
        user: {
          id: req.previewSession?.user?.id || "prev_user_default",
          email: email || "preview@codefuser.test",
          fullName: fullName || "Preview Client",
          businessName: businessName || "Preview Business",
          role: "client"
        },
        session: {
          access_token: req.previewSession?.previewToken || "prev_token_mock",
          user: {
            id: req.previewSession?.user?.id || "prev_user_default",
            email: email || "preview@codefuser.test"
          }
        },
        message: "Customer preview account simulated (zero database users created)."
      });
    }

    const supabase = getSupabase();
    
    console.log("=== STEP 1: signUp() START ===");
    let { data, error } = await supabase.auth.signUp({ email, password });
    console.log("=== STEP 1: signUp() END ===", { hasUser: !!data?.user, error: error?.message });
    
    if (res.headersSent || req.timedOut) return;

    if (error && (error.message?.includes("already registered") || error.message?.includes("already exists") || (error as any).status === 400)) {
      console.log("=== STEP 1b: signInWithPassword fallback ===");
      const loginRes = await supabase.auth.signInWithPassword({ email, password });
      if (!loginRes.error && loginRes.data?.user) {
        data = loginRes.data;
        error = null;
      }
    }

    if (error) {
      console.log("=== STEP 1: signUp() FAILED ===", error);
      return res.status(400).json({ success: false, error: error.message });
    }

    if (data.user) {
      console.log("=== STEP 2: createUserProfile() START ===");
      try {
        await createUserProfile({
          id: data.user.id,
          email: data.user.email || email,
          role: "client",
          fullName: fullName || "",
          businessName: businessName || ""
        }, req.reqId);
        console.log("=== STEP 2: createUserProfile() END ===");
      } catch (profileErr: any) {
        console.warn(`[Auth Signup] User profile creation fallback notice for ${data.user.id}:`, profileErr?.message || profileErr);
      }
    }

    console.log("=== STEP 3: project linking ===");
    // project linking if any

    console.log("=== STEP 4: response ===");
    return res.json({ success: true, user: data.user, session: data.session });
  } catch (err: any) {
    if (res.headersSent) return;
    console.error("=== SIGNUP EXCEPTION CAUGHT ===");
    console.error(err);
    console.error(err?.stack);
    console.error(err?.message);
    console.error(err?.cause);
    return res.status(500).json({ success: false, error: err?.message || "Failed to sign up." });
  }
});

// API: Customer Authentication (Login Proxy)
app.post("/api/auth/login", requestTimeout(10000, "Auth Login"), validateBody(authSchema), async (req: any, res) => {
  try {
    const { email, password } = req.body;
    checkAbort(req);
    const supabase = getSupabase();
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (res.headersSent || req.timedOut) return;

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    let userRole = "client";
    let fullName = "";
    let businessName = "";

    if (data.user) {
      // Find or lazily migrate user profile to Database
      let profile = await getUserProfile(data.user.id, req.reqId);
      if (!profile) {
        console.log(`Lazy creating missing database profile for logging-in user: ${data.user.id}`);
        profile = await createUserProfile({
          id: data.user.id,
          email: data.user.email || email,
          role: "client",
          fullName: data.user.user_metadata?.full_name || "",
          businessName: data.user.user_metadata?.business_name || ""
        }, req.reqId);
      }
      userRole = profile.role;
      fullName = profile.fullName || "";
      businessName = profile.businessName || "";
    }

    return res.json({ 
      success: true, 
      user: data.user ? { ...data.user, role: userRole, fullName, businessName } : null, 
      session: data.session 
    });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Auth Login error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to log in." });
  }
});

// API: Customer Logout Proxy
app.post("/api/auth/logout", requestTimeout(10000, "Auth Logout"), async (req, res) => {
  try {
    checkAbort(req);
    const supabase = getSupabase();
    await supabase.auth.signOut();
    
    if (res.headersSent || req.timedOut) return;

    return res.json({ success: true });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Auth Logout error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to log out." });
  }
});

// API: Retrieve Current User Profile (Secure Profile & Role Sync)
app.get("/api/auth/me", requestTimeout(10000, "Get Current User Profile"), requireAuth, async (req: any, res) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        fullName: req.user.fullName,
        businessName: req.user.businessName
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Failed to retrieve current user profile." });
  }
});

// API: Founder Notifications
app.get("/api/admin/notifications", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res: any) => {
  try {
    const notifications = getFounderNotifications();
    res.json({ success: true, data: notifications });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/admin/notifications/:id/read", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    markNotificationRead(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/admin/notifications/read-all", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res: any) => {
  try {
    markAllNotificationsRead();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/admin/notifications", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res: any) => {
  try {
    clearFounderNotifications();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Get all user profiles (Admin/Super Admin only)
app.get("/api/admin/users", requestTimeout(10000, "Get All Users"), requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    checkAbort(req);
    const users = await getAllUserProfiles(req.reqId);
    if (res.headersSent || req.timedOut) return;
    return res.json({ success: true, users });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Failed to fetch user profiles:", error);
    return res.status(500).json({ success: false, error: "Failed to retrieve user profiles." });
  }
});

// API: Update user role (Super Admin only)
app.put("/api/admin/users/:id/role", requestTimeout(10000, "Update User Role"), requireAuth, requireRole(["super_admin"]), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["super_admin", "admin", "client"].includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role specified. Must be 'super_admin', 'admin', or 'client'." });
    }

    checkAbort(req);
    const updatedProfile = await updateUserProfileRole(id, role, req.reqId);
    if (res.headersSent || req.timedOut) return;

    return res.json({ 
      success: true, 
      user: updatedProfile,
      message: `User role updated to ${role} successfully.` 
    });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error(`Failed to update user role for ${req.params.id}:`, error);
    return res.status(500).json({ success: false, error: "Failed to update user role." });
  }
});

// API: Trigger administrative manual automation scan (Admin/Super Admin only)
app.post("/api/admin/automation/scan", requestTimeout(15000, "Automation Scan"), requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    checkAbort(req);
    const stats = await runPeriodicAutomationScan(`admin-manual-${req.user?.id || "unknown"}`);
    if (res.headersSent || req.timedOut) return;
    return res.json({
      success: true,
      stats,
      message: "Periodic commercial automation scan triggered and completed successfully."
    });
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ success: false, error: err.message || "Failed to execute manual scan." });
  }
});

// (Obsolete server-side OAuth endpoints are replaced by Vercel-compatible direct client-side Supabase authentication flow)

// API: Get a single project by ID
app.get("/api/projects/:id", requestTimeout(10000, "Get Single Project"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (req.isPreview || isProjectIdPreview(id)) {
      const previewProject = getPreviewProject(id);
      if (previewProject) {
        return res.json({ success: true, data: previewProject, project: previewProject });
      }
    }
    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }
    return res.json({ success: true, data: project, project });
  } catch (err: any) {
    logger.error("Failed to get project by ID:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch project." });
  }
});

// API: Update a single project state
app.put("/api/projects/:id", requestTimeout(10000, "Update Project"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, validateBody(updateProjectSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.isPreview || isProjectIdPreview(id)) {
      const updated = savePreviewProject({ ...updates, id });
      return res.json({ success: true, data: updated, project: updated });
    }

    const restrictedFields = [
      "paymentStatus",
      "portalAccess",
      "portalAccessSource",
      "paymentId",
      "orderId",
      "paymentProvider",
      "purchaseDate",
      "purchasedPlan"
    ];

    const hasRestrictedField = Object.keys(updates || {}).some(key => restrictedFields.includes(key));
    if (hasRestrictedField && !req.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized: Modifying payment status or authorization parameters is restricted to authenticated administrators." 
      });
    }

    checkAbort(req);

    const previousProject = await getProjectById(id);
    if (!previousProject) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const updated = await updateProject(id, updates, req.reqId);

    // Check if Portal Access is activated
    const portalAccessActivated = !previousProject.portalAccess && updated.portalAccess;
    if (portalAccessActivated) {
      await logAuditEvent({
        projectId: id,
        eventType: "Portal Activated",
        requestId: req.reqId,
        actor: "Admin",
        status: "Success",
        notes: "Client portal manually authorized and activated by administrator."
      });

      const devUrl = process.env.DEV_APP_URL || "http://localhost:3000";
      const portalUrl = `${devUrl}/login`;
      const emailHtml = getPortalActivatedTemplate(updated.clientName, updated.businessName, portalUrl);
      sendEmailAsync(updated.email, `Client Portal Activated - ${updated.businessName}`, emailHtml);
    } else if (previousProject.portalAccess && !updated.portalAccess) {
      // Portal Access Revoked
      await logAuditEvent({
        projectId: id,
        eventType: "Portal Access Revoked",
        requestId: req.reqId,
        actor: "Admin",
        status: "Success",
        notes: "Client portal access manually revoked by administrator."
      });
    }

    // Check if Deliverables are ready
    const isDeliverablesReady = ["Checklist Ready", "Launched"].includes(updated.status) &&
      !["Checklist Ready", "Launched"].includes(previousProject.status);

    if (isDeliverablesReady) {
      await logAuditEvent({
        projectId: id,
        eventType: "Deliverables Ready",
        requestId: req.reqId,
        actor: "Admin",
        status: "Success",
        notes: `Project status updated to: ${updated.status}. Deliverables ready.`
      });

      const devUrl = process.env.DEV_APP_URL || "http://localhost:3000";
      const portalUrl = `${devUrl}/login`;
      const emailHtml = getDeliverablesReadyTemplate(updated.clientName, updated.businessName, portalUrl);
      sendEmailAsync(updated.email, `Your CodeFuser Project Deliverables are Ready!`, emailHtml);
    } else if (updates.status && updates.status !== previousProject.status) {
      // General status update log
      await logAuditEvent({
        projectId: id,
        eventType: "Status Updated",
        requestId: req.reqId,
        actor: req.isAdmin ? "Admin" : "System",
        status: "Success",
        notes: `Status changed from '${previousProject.status}' to '${updated.status}'`
      });

      // Trigger Advanced status change automation workflow (Design, Development, Testing, etc.)
      triggerStatusChangeAutomation(id, previousProject.status, updated.status, req.reqId);
    }

    if (res.headersSent || req.timedOut) return;

    return res.json({ success: true, data: updated, message: "Project updated successfully in the core database." });
  } catch (error: any) {
    if (res.headersSent) return;
    logger.error("Failed to update project status / elements", error);
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
});

// API: Get extra project data (Quote and Uploaded Assets)
app.get("/api/projects/:id/extra", requestTimeout(10000, "Get Extra Project Data"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    checkAbort(req);

    if (req.isPreview || isProjectIdPreview(id)) {
      const previewExtra = getPreviewExtra(id);
      return res.json({ success: true, data: previewExtra });
    }

    const extra = await getExtraData(id);

    if (res.headersSent || req.timedOut) return;

    return res.json({ success: true, data: extra });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to get extra project data", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Save/Lock Official Quote for a project
app.post("/api/projects/:id/quote", requestTimeout(10000, "Save Quote"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, validateBody(saveQuoteSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { packageName, price, discount, features, summary, couponCode } = req.body;

    checkAbort(req);

    if (req.isPreview || isProjectIdPreview(id)) {
      let finalPrice = Number(price);
      let finalDiscount = Number(discount || 0);
      let verifiedCouponCode = couponCode ? couponCode.trim().toUpperCase() : undefined;
      if (verifiedCouponCode) {
        const basePrice = finalDiscount > 0 ? finalPrice + finalDiscount : finalPrice;
        const validation = validateAndCalculateCoupon(verifiedCouponCode, packageName, "", basePrice);
        if (validation.valid) {
          finalDiscount = validation.discountAmount !== undefined ? validation.discountAmount : finalDiscount;
          finalPrice = validation.finalWebsitePrice !== undefined ? validation.finalWebsitePrice : finalPrice;
        }
      }
      const quoteRecord = {
        packageName,
        price: finalPrice,
        discount: finalDiscount,
        features: features || [],
        summary: summary || "",
        couponCode: verifiedCouponCode || undefined,
        timestamp: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: "active" as const
      };
      const extra = savePreviewExtra(id, { quote: quoteRecord });
      return res.json({
        success: true,
        data: extra,
        message: "Official Quote locked successfully in Preview Mode."
      });
    }

    let finalPrice = Number(price);
    let finalDiscount = Number(discount || 0);
    let verifiedCouponCode = couponCode ? couponCode.trim().toUpperCase() : undefined;

    if (verifiedCouponCode) {
      const project = req.project;
      const basePrice = finalDiscount > 0 ? finalPrice + finalDiscount : finalPrice;
      const validation = validateAndCalculateCoupon(verifiedCouponCode, packageName, project?.email || "", basePrice);
      if (validation.valid && validation.coupon) {
        finalDiscount = validation.discountAmount !== undefined ? validation.discountAmount : finalDiscount;
        finalPrice = validation.finalWebsitePrice !== undefined ? validation.finalWebsitePrice : finalPrice;
      } else {
        return res.status(400).json({ success: false, error: validation.error || "Invalid coupon code." });
      }
    }

    const extra = await updateQuote(id, {
      packageName,
      price: finalPrice,
      discount: finalDiscount,
      features: features || [],
      summary: summary || "",
      couponCode: verifiedCouponCode || undefined
    });

    // Log quote generation event
    await logAuditEvent({
      projectId: id,
      eventType: "Quote Generated",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: `Generated quote for standard tier: ${packageName} at Rs. ${price}`
    });

    if (res.headersSent || req.timedOut) return;

    return res.json({ 
      success: true, 
      data: extra, 
      message: "Official Quote locked successfully. Standard price frozen for 7 days." 
    });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to update quote", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Unlock/Reset Quote for generating new recommendation
app.post("/api/projects/:id/quote/reset", requestTimeout(10000, "Reset Quote"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    checkAbort(req);

    if (req.isPreview || isProjectIdPreview(id)) {
      const extra = savePreviewExtra(id, { quote: null });
      return res.json({ success: true, data: extra, message: "Existing quotation has been unlocked in Preview Mode." });
    }

    const extra = await updateQuote(id, null);

    if (res.headersSent || req.timedOut) return;

    return res.json({ success: true, data: extra, message: "Existing quotation has been unlocked." });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to reset quote", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Generate AI Proposal manually
app.post("/api/projects/:id/proposal/generate", requestTimeout(25000, "Generate Proposal"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query;
    checkAbort(req);

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const supabase = getSupabase();
    const { data: projData } = await supabase
      .from("projects")
      .select("quote")
      .eq("id", id)
      .single();

    const currentQuote = projData?.quote || {};
    const existingProposal = currentQuote.proposal || null;

    // Preserve manual edits unless force parameter is provided
    if (existingProposal && existingProposal.manualEdits && force !== "true") {
      return res.json({
        success: false,
        requireConfirmation: true,
        message: "Existing administrator edits were detected. Regenerating will overwrite manual changes. Do you want to proceed?"
      });
    }

    let proposalContent = "";

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const systemPrompt = `You are an elite enterprise-grade technology consultant, CTO, and digital business architect at CodeFuser.
Your goal is to produce a high-impact, professional, consulting-grade strategic digital blueprint and proposal.
Focus on clear structure, crisp professional insights, and business outcomes. Avoid generic conversational fluff or introductory padding.
Format using standard Markdown with beautiful headers.
Include the following structured sections:
1. Executive Strategy & Business Alignment (How the site directly addresses their specific goal)
2. Custom Architecture & Core Tech Stack (Tailored specifically for their target package and industry)
3. Progressive Development Roadmap & Milestones (Concrete, structured phases)
4. Interactive Platform Feature Blueprint (Clear list of essential custom components to be built)
5. Competitive Business ROI Score & Performance Diagnostics`;

        const userPrompt = `Generate an enterprise strategy proposal for:
- Client Name: ${project.clientName}
- Company/Brand Name: ${project.businessName}
- Primary Business Category/Industry: ${project.industry || project.customIndustry || "Not Specified"}
- Primary Core Goal: ${project.goal || project.customGoal || "Not Specified"}
- Selected Base Tier: ${project.selectedPackage}
- Setup Readiness: Logo (${project.hasLogo}), Domain (${project.hasDomain}), Content (${project.contentReady})
- Technology Ownership model: ${project.ownershipChoice}`;

        const response = await withRetry(async () => {
          return await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
            }
          });
        }, {
          reqId: req.reqId || "N/A",
          operationName: "Gemini generateContent Proposal (gemini-2.5-flash)",
          isIdempotent: true
        });

        if (response && response.text) {
          proposalContent = response.text;
        } else {
          throw new Error("Empty response from Gemini.");
        }
      } catch (geminiErr: any) {
        console.error("Gemini proposal generation failed, using fallback:", geminiErr);
        proposalContent = getDefaultProposalContent(project);
      }
    } else {
      console.warn("GEMINI_API_KEY not set. Using consulting fallback blueprint.");
      proposalContent = getDefaultProposalContent(project);
    }

    const updatedProposal = {
      content: proposalContent,
      status: "draft",
      manualEdits: null,
      timestamp: new Date().toISOString()
    };

    const updatedQuote = {
      ...currentQuote,
      proposal: updatedProposal
    };

    const { error: updateErr } = await supabase
      .from("projects")
      .update({ quote: updatedQuote })
      .eq("id", id);

    if (updateErr) {
      throw new Error(`Failed to update proposal in database: ${updateErr.message}`);
    }

    // Log the audit event
    await logAuditEvent({
      projectId: id,
      eventType: "Proposal Generated",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: "Generated strategic AI blueprint and proposal manually."
    });

    if (res.headersSent || req.timedOut) return;

    const extra = await getExtraData(id);
    return res.json({
      success: true,
      data: extra,
      message: "AI Proposal and Strategic Blueprint generated successfully."
    });

  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to generate manual proposal", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Helper function for fallback proposal content
function getDefaultProposalContent(project: any) {
  return `# Strategic Digital Blueprint & Technical Proposal
## 1. Executive Strategy & Business Alignment
For **${project.businessName}**, we are launching a modern, high-performance digital platform tailored specifically for the **${project.industry || project.customIndustry || "Specified"}** sector. The primary objective is to build a foundation that addresses your primary goal: *"${project.goal || project.customGoal || "Maximize operational efficiency"}"*.

## 2. Custom Architecture & Core Tech Stack
- **Frontend Core**: React 18 with Vite and Tailwind CSS, utilizing high-contrast design visual identities and motion layouts.
- **Backend Architecture**: Express proxy servers with secure row-level client endpoints.
- **Database Layer**: Durable Supabase PostgreSQL cloud storage with complete offline redundancy.

## 3. Progressive Development Roadmap
- **Sprint 1 (Layout & Branding)**: Asset collection, interactive layouts, visual board approval.
- **Sprint 2 (Database & Integrations)**: Secure checkout setup, customized dashboard features, backend models.
- **Sprint 3 (Deployment & QA)**: Performance optimization, domain testing, official deployment.

## 4. Interactive Platform Feature Blueprint
- Responsive cross-device interface.
- Complete payment gateway synchronization.
- Interactive dashboard for managing services.

## 5. Competitive Business ROI Score
- Bypasses standard boilerplate layout limits.
- Binds customers permanently via secure portal access.
- Fully optimizes client onboarding conversions.`;
}

// API: Save manual edits to proposal
app.post("/api/projects/:id/proposal/save", requestTimeout(10000, "Save Proposal"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { content, status } = req.body;
    checkAbort(req);

    const supabase = getSupabase();
    const { data: projData } = await supabase.from("projects").select("quote").eq("id", id).single();
    const currentQuote = projData?.quote || {};
    const existingProposal = currentQuote.proposal || { status: "draft" };

    const updatedProposal = {
      ...existingProposal,
      content: content !== undefined ? content : existingProposal.content,
      manualEdits: content !== undefined ? content : existingProposal.manualEdits,
      status: status !== undefined ? status : existingProposal.status,
      timestamp: new Date().toISOString()
    };

    const updatedQuote = {
      ...currentQuote,
      proposal: updatedProposal
    };

    const { error: updateErr } = await supabase
      .from("projects")
      .update({ quote: updatedQuote })
      .eq("id", id);

    if (updateErr) {
      throw new Error(updateErr.message);
    }

    await logAuditEvent({
      projectId: id,
      eventType: "Proposal Updated",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: "Saved administrator edits to strategic proposal."
    });

    if (res.headersSent || req.timedOut) return;

    const extra = await getExtraData(id);
    return res.json({ success: true, data: extra, message: "Strategic proposal saved successfully." });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to save proposal", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Approve proposal
app.post("/api/projects/:id/proposal/approve", requestTimeout(10000, "Approve Proposal"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    checkAbort(req);

    const supabase = getSupabase();
    const { data: projData } = await supabase.from("projects").select("quote").eq("id", id).single();
    const currentQuote = projData?.quote || {};
    const existingProposal = currentQuote.proposal || { content: "", status: "draft" };

    const updatedProposal = {
      ...existingProposal,
      status: "approved"
    };

    const updatedQuote = {
      ...currentQuote,
      proposal: updatedProposal
    };

    await supabase.from("projects").update({ quote: updatedQuote }).eq("id", id);

    await logAuditEvent({
      projectId: id,
      eventType: "Proposal Approved",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: "Strategic proposal approved by administrator."
    });

    if (res.headersSent || req.timedOut) return;

    const extra = await getExtraData(id);
    return res.json({ success: true, data: extra, message: "Proposal approved successfully." });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to approve proposal", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Send proposal to client
app.post("/api/projects/:id/proposal/send", requestTimeout(10000, "Send Proposal"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    checkAbort(req);

    const supabase = getSupabase();
    const { data: projData } = await supabase.from("projects").select("quote").eq("id", id).single();
    const currentQuote = projData?.quote || {};
    const existingProposal = currentQuote.proposal || { content: "", status: "draft" };

    const updatedProposal = {
      ...existingProposal,
      status: "sent"
    };

    const updatedQuote = {
      ...currentQuote,
      proposal: updatedProposal
    };

    await supabase.from("projects").update({ quote: updatedQuote }).eq("id", id);

    await logAuditEvent({
      projectId: id,
      eventType: "Proposal Sent",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: "Strategic proposal officially sent to client portal."
    });

    if (res.headersSent || req.timedOut) return;

    const extra = await getExtraData(id);
    return res.json({ success: true, data: extra, message: "Proposal sent to client portal successfully." });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to send proposal", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Save launch checklist
app.post("/api/projects/:id/checklist/save", requestTimeout(10000, "Save Checklist"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { checklist } = req.body;
    checkAbort(req);

    const supabase = getSupabase();
    const { data: projData } = await supabase.from("projects").select("quote").eq("id", id).single();
    const currentQuote = projData?.quote || {};

    const updatedQuote = {
      ...currentQuote,
      checklist: checklist || []
    };

    await supabase.from("projects").update({ quote: updatedQuote }).eq("id", id);

    await logAuditEvent({
      projectId: id,
      eventType: "Checklist Configured",
      requestId: req.reqId,
      actor: req.isAdmin ? "Admin" : "Client",
      status: "Success",
      notes: `Configured launch checklist items (Total: ${checklist?.length || 0})`
    });

    if (res.headersSent || req.timedOut) return;

    const extra = await getExtraData(id);
    return res.json({ success: true, data: extra, message: "Launch checklist saved successfully." });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to save checklist", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Save deliverables
app.post("/api/projects/:id/deliverables/save", requestTimeout(10000, "Save Deliverables"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { deliverables } = req.body;
    checkAbort(req);

    const supabase = getSupabase();
    const { data: projData } = await supabase.from("projects").select("quote").eq("id", id).single();
    const currentQuote = projData?.quote || {};

    const updatedQuote = {
      ...currentQuote,
      deliverables: deliverables || []
    };

    await supabase.from("projects").update({ quote: updatedQuote }).eq("id", id);

    await logAuditEvent({
      projectId: id,
      eventType: "Deliverables Configured",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: `Configured deliverables vault items (Total: ${deliverables?.length || 0})`
    });

    if (res.headersSent || req.timedOut) return;

    const extra = await getExtraData(id);
    return res.json({ success: true, data: extra, message: "Deliverables saved successfully." });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to save deliverables", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Get project audit trail (Mission Control Activity Tracker)
app.get("/api/projects/:id/audit-trail", requestTimeout(10000, "Get Audit Trail"), validateProjectIdParam, requireAuth, verifyProjectOwnership, async (req: any, res) => {
  try {
    const { id } = req.params;
    checkAbort(req);

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("audit_trail")
      .select("*")
      .eq("project_id", id)
      .order("timestamp", { ascending: false });

    if (error) {
      throw error;
    }

    if (res.headersSent || req.timedOut) return;

    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to retrieve project audit trail:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch audit trail." });
  }
});

// API: Generate secure signed download URL and track event
app.get("/api/projects/:id/assets/:assetId/download-url", requestTimeout(10000, "Get Download URL"), validateProjectIdParam, requireAuth, verifyProjectOwnership, async (req: any, res) => {
  try {
    const { id, assetId } = req.params;
    checkAbort(req);

    const extra = await getExtraData(id);
    const asset = extra.assets.find(a => a.id === assetId);

    if (!asset) {
      return res.status(404).json({ success: false, error: "Asset not found." });
    }

    // Log the audit event!
    await logAuditEvent({
      projectId: id,
      eventType: "Deliverables Downloaded",
      requestId: req.reqId,
      actor: req.isAdmin ? "Admin" : "Client",
      status: "Success",
      notes: `Downloaded file: ${asset.name} (${asset.type}, ${asset.size} bytes)`
    });

    if (res.headersSent || req.timedOut) return;

    return res.json({ success: true, url: asset.url });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to generate and track download URL", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to process download." });
  }
});

// ==========================================
// CHANGE REQUESTS & SUPPORT ENGINE
// ==========================================

// GET /api/projects/:id/change-requests - Retrieve all change requests for a project
app.get("/api/projects/:id/change-requests", requestTimeout(10000, "Get Change Requests"), validateProjectIdParam, requireAuth, verifyProjectOwnership, async (req: any, res) => {
  try {
    const { id } = req.params;
    checkAbort(req);

    if (req.isPreview || isProjectIdPreview(id)) {
      const proj = getPreviewProject(id);
      return res.json({ success: true, data: proj?.changeRequests || [] });
    }

    const requests = await getChangeRequests(id);
    return res.json({ success: true, data: requests });
  } catch (err: any) {
    logger.error("Failed to get change requests:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch change requests." });
  }
});

// POST /api/projects/:id/change-requests - Submit a new client change/content request
app.post("/api/projects/:id/change-requests", requestTimeout(15000, "Create Change Request"), validateProjectIdParam, requireAuth, verifyProjectOwnership, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { requestText, category, chips, photoName, photoUrl, priority } = req.body;
    checkAbort(req);

    if (!requestText || !requestText.trim()) {
      return res.status(400).json({ success: false, error: "Please provide details for what you would like changed." });
    }

    if (req.isPreview || isProjectIdPreview(id)) {
      const cr = addPreviewChangeRequest(id, {
        requestText: requestText.trim(),
        category: category || "Design / Visuals",
        chips: chips || [],
        photoName: photoName || undefined,
        photoUrl: photoUrl || undefined,
        priority: priority || "normal"
      });
      return res.status(201).json({
        success: true,
        data: cr,
        message: "Change request submitted in Customer Preview Isolation Mode."
      });
    }

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const newRequest = await createChangeRequest(id, {
      requestText: requestText.trim(),
      category: category || "Content & Text",
      chips: Array.isArray(chips) ? chips : [],
      photoName: photoName || null,
      photoUrl: photoUrl || null,
      priority: priority === "urgent" ? "urgent" : "normal",
      status: "SUBMITTED"
    });

    addFounderNotification({
      type: "change_request",
      projectId: id,
      projectName: project.businessName || project.clientName || "Client",
      title: "Changes requested",
      message: `${project.businessName || project.clientName || "Client"} requested website changes.`,
      actionLabel: "Review changes",
      severity: "action_needed"
    });

    await logAuditEvent({
      projectId: id,
      eventType: "Change Request Submitted",
      requestId: req.reqId,
      actor: req.user?.fullName || "Client",
      status: "Success",
      notes: `Change request #${newRequest.id.slice(-6)} submitted: "${requestText.slice(0, 80)}..."`
    });

    return res.json({
      success: true,
      data: newRequest,
      message: "Your change request has been submitted. Our team will review and apply the updates shortly."
    });
  } catch (err: any) {
    logger.error("Failed to create change request:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to submit change request." });
  }
});

// PATCH /api/projects/:id/change-requests/:requestId - Update a change request status or notes (Admin/Client)
app.patch("/api/projects/:id/change-requests/:requestId", requestTimeout(10000, "Update Change Request"), validateProjectIdParam, requireAuth, async (req: any, res) => {
  try {
    const { id, requestId } = req.params;
    const { status, adminNotes, priority, estimatedTurnaround } = req.body;
    checkAbort(req);

    const updated = await updateChangeRequest(id, requestId, {
      ...(status && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
      ...(priority && { priority }),
      ...(estimatedTurnaround && { estimatedTurnaround })
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: "Change request not found." });
    }

    await logAuditEvent({
      projectId: id,
      eventType: "Change Request Updated",
      requestId: req.reqId,
      actor: req.isAdmin ? "Admin" : "System",
      status: "Success",
      notes: `Change request #${requestId.slice(-6)} updated to status: ${updated.status}`
    });

    return res.json({ success: true, data: updated, message: "Change request updated successfully." });
  } catch (err: any) {
    logger.error("Failed to update change request:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to update change request." });
  }
});

// ==========================================
// WEBSITE LAUNCH & HEALTH VERIFICATION ENGINE
// ==========================================

// POST /api/projects/:id/launch/start - Initiate website launch sequence
app.post("/api/projects/:id/launch/start", requestTimeout(15000, "Start Website Launch"), validateProjectIdParam, requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const targetUrl = req.body.websiteUrl || project.websiteUrl || project.onboarding?.websiteUrl || "";

    const updatedProject = await updateProject(id, {
      launchStatus: "DEPLOYING",
      websiteUrl: targetUrl || project.websiteUrl
    });

    await logAuditEvent({
      projectId: id,
      eventType: "Website Launch Initiated",
      requestId: req.reqId,
      actor: req.isAdmin ? "Admin" : "Client",
      status: "Success",
      notes: `Initiated deployment pipeline for ${project.businessName}. Target URL: ${targetUrl || 'default domain'}`
    });

    return res.json({
      success: true,
      data: updatedProject,
      message: "Website deployment initiated. Running verification checks."
    });
  } catch (err: any) {
    logger.error("Failed to initiate launch:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to start launch." });
  }
});

// POST /api/projects/:id/launch/verify - Verify deployed website and set live
app.post("/api/projects/:id/launch/verify", requestTimeout(20000, "Verify Live Website"), validateProjectIdParam, requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const testUrl = req.body.websiteUrl || project.websiteUrl || project.stagingUrl || "";
    let isLive = false;
    let checkDetails = {
      statusCode: 0,
      responseTimeMs: 0,
      sslValid: false,
      dnsResolved: false,
      checkedAt: new Date().toISOString()
    };

    if (testUrl && (testUrl.startsWith("http://") || testUrl.startsWith("https://"))) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const startTime = Date.now();
        const response = await fetch(testUrl, {
          method: "GET",
          signal: controller.signal,
          headers: { "User-Agent": "CodeFuser-HealthChecker/1.0" }
        });
        clearTimeout(timeoutId);
        checkDetails.responseTimeMs = Date.now() - startTime;
        checkDetails.statusCode = response.status;
        checkDetails.sslValid = testUrl.startsWith("https://");
        checkDetails.dnsResolved = true;
        isLive = response.status >= 200 && response.status < 400;
      } catch (pingErr: any) {
        console.warn(`[Health Check] Live ping to ${testUrl} encountered error:`, pingErr.message);
        isLive = false;
        checkDetails.statusCode = 0;
        checkDetails.sslValid = false;
        checkDetails.dnsResolved = false;
      }
    }

    const launchStatus = isLive ? "LAUNCHED" : "VERIFICATION_FAILED";
    const websiteStatus = isLive ? "ONLINE" : "OFFLINE";
    const healthStatus = isLive ? "healthy" : "degraded";
    const dnsStatus = isLive ? "connected" : "unconfigured";
    const sslStatus = isLive && testUrl.startsWith("https://") ? "active" : "unconfigured";

    const updated = await updateProject(id, {
      launchStatus,
      websiteStatus,
      healthStatus,
      dnsStatus,
      sslStatus,
      lastHealthCheck: checkDetails.checkedAt,
      ...(testUrl ? { websiteUrl: testUrl } : {})
    });

    if (isLive) {
      resolveFounderNotificationsByType(id, "launch_problem");
    } else {
      addFounderNotification({
        type: "launch_problem",
        projectId: id,
        projectName: project.businessName || project.clientName || "Client",
        title: "Launch problem",
        message: `${project.businessName || project.clientName || "Client"} could not be verified as live.`,
        actionLabel: "Check website",
        severity: "action_needed"
      });
    }

    await logAuditEvent({
      projectId: id,
      eventType: isLive ? "Website Live Verified" : "Website Verification Failed",
      requestId: req.reqId,
      actor: req.isAdmin ? "Admin" : "System",
      status: isLive ? "Success" : "Failed",
      notes: isLive
        ? `Live verification passed (${checkDetails.statusCode} OK, ${checkDetails.responseTimeMs}ms) for ${project.businessName}`
        : `Verification check returned non-200 status for ${testUrl}`
    });

    return res.json({
      success: true,
      data: updated,
      checkDetails,
      message: isLive ? "Website verified successfully and is now marked Live." : "Verification failed. Please check website URL or server configuration."
    });
  } catch (err: any) {
    logger.error("Failed to verify website launch:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to verify live website." });
  }
});

// POST /api/projects/:id/health-check - Ping website health check
app.post("/api/projects/:id/health-check", requestTimeout(15000, "Website Health Check"), validateProjectIdParam, requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const testUrl = project.websiteUrl || project.stagingUrl || "";
    let isHealthy = true;
    let latency = 120;
    const timestamp = new Date().toISOString();

    if (testUrl && (testUrl.startsWith("http://") || testUrl.startsWith("https://"))) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const startTime = Date.now();
        const response = await fetch(testUrl, {
          method: "HEAD",
          signal: controller.signal,
          headers: { "User-Agent": "CodeFuser-HealthBot/1.0" }
        });
        clearTimeout(timeoutId);
        latency = Date.now() - startTime;
        isHealthy = response.status >= 200 && response.status < 400;
      } catch (err: any) {
        console.warn(`[Health Check Ping] ${testUrl} ping error:`, err.message);
        isHealthy = false;
      }
    } else {
      // If no valid URL configured, mark unhealthy
      isHealthy = false;
    }

    const healthStatus = isHealthy ? "healthy" : "degraded";
    const websiteStatus = isHealthy ? "ONLINE" : "OFFLINE";
    const launchStatus = isHealthy ? "LAUNCHED" : "ATTENTION";

    const updated = await updateProject(id, {
      healthStatus,
      websiteStatus,
      launchStatus,
      lastHealthCheck: timestamp
    });

    if (isHealthy) {
      resolveFounderNotificationsByType(id, "health_problem");
    } else {
      addFounderNotification({
        type: "health_problem",
        projectId: id,
        projectName: project.businessName || project.clientName || "Client",
        title: "Website needs attention",
        message: `${project.businessName || project.clientName || "Client"} is not responding normally.`,
        actionLabel: "Check website",
        severity: "action_needed"
      });
    }

    return res.json({
      success: true,
      healthStatus,
      lastHealthCheck: timestamp,
      latencyMs: latency,
      data: updated
    });
  } catch (err: any) {
    logger.error("Failed to run health check:", err);
    return res.status(500).json({ success: false, error: err.message || "Health check failed." });
  }
});

// POST /api/projects/:id/lifecycle - Admin update lifecycle and availability statuses
app.post("/api/projects/:id/lifecycle", requestTimeout(10000, "Update Project Lifecycle"), validateProjectIdParam, requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const {
      launchStatus,
      websiteStatus,
      websiteUrl,
      stagingUrl,
      healthStatus,
      dnsStatus,
      sslStatus
    } = req.body;

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const updated = await updateProject(id, {
      ...(launchStatus !== undefined && { launchStatus }),
      ...(websiteStatus !== undefined && { websiteStatus }),
      ...(websiteUrl !== undefined && { websiteUrl }),
      ...(stagingUrl !== undefined && { stagingUrl }),
      ...(healthStatus !== undefined && { healthStatus }),
      ...(dnsStatus !== undefined && { dnsStatus }),
      ...(sslStatus !== undefined && { sslStatus }),
      lastHealthCheck: new Date().toISOString()
    });

    await logAuditEvent({
      projectId: id,
      eventType: "Lifecycle Updated",
      requestId: req.reqId,
      actor: req.isAdmin ? "Admin" : "System",
      status: "Success",
      notes: `Updated lifecycle state: Launch=${launchStatus || project.launchStatus}, Site=${websiteStatus || project.websiteStatus}`
    });

    return res.json({ success: true, data: updated, message: "Lifecycle status updated." });
  } catch (err: any) {
    logger.error("Failed to update project lifecycle:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to update lifecycle." });
  }
});


// API: Expose Razorpay Public Key ID & Payment Verification Status (Single source of truth: RAZORPAY_VERIFICATION)
app.get("/api/config/razorpay", (req, res) => {
  const verificationEnabled = process.env.RAZORPAY_VERIFICATION === "true";
  return res.json({
    keyId: process.env.RAZORPAY_KEY_ID || "",
    verificationEnabled,
    verificationModeActive: verificationEnabled,
    isDevSimulation: !verificationEnabled
  });
});

app.get("/api/config/dev-payment-mode", (req, res) => {
  const verificationEnabled = process.env.RAZORPAY_VERIFICATION === "true";
  return res.json({
    verificationEnabled,
    mode: verificationEnabled ? "live" : "simulation",
    isProduction: verificationEnabled,
    autoSimulateEnabled: !verificationEnabled
  });
});

app.post("/api/config/dev-payment-mode", (req, res) => {
  return res.status(400).json({
    success: false,
    error: "Payment mode is strictly controlled by RAZORPAY_VERIFICATION environment variable."
  });
});

app.get("/api/config/dev-simulation", (req, res) => {
  const verificationEnabled = process.env.RAZORPAY_VERIFICATION === "true";
  return res.json({
    enabled: !verificationEnabled,
    verificationEnabled,
    mode: verificationEnabled ? "live" : "simulation",
    environment: process.env.NODE_ENV || "development"
  });
});

// API: Create Razorpay Order
app.post("/api/projects/:id/razorpay-order", requestTimeout(15000, "Create Razorpay Order"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, validateBody(createOrderSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { term } = req.body; // 'milestone' | 'upfront'

    checkAbort(req);

    // Retrieve project by ID from pre-fetched request context
    const project = req.project;

    if (req.isPreview || isProjectIdPreview(id)) {
      const extra = getPreviewExtra(id);
      let amountInRupees = 19999;
      if (extra && extra.quote) {
        let totalPrice = extra.quote.price;
        const couponCode = extra.quote.couponCode;
        let finalWebsitePrice = totalPrice;
        if (couponCode) {
          const validation = validateAndCalculateCoupon(couponCode, extra.quote.packageName || "Package", "", totalPrice);
          if (validation.valid) {
            finalWebsitePrice = validation.finalWebsitePrice !== undefined ? validation.finalWebsitePrice : totalPrice;
          }
        }
        amountInRupees = term === "upfront" ? Math.round(finalWebsitePrice * 0.9) : Math.round(finalWebsitePrice * 0.5);
      }
      if (amountInRupees === 0) {
        savePreviewProject({
          id,
          paymentStatus: "paid",
          paymentId: "prev_waiver_pay_" + Date.now(),
          orderId: "prev_waiver_order_" + Date.now(),
          purchaseDate: new Date().toISOString()
        });
        return res.json({
          success: true,
          orderId: "prev_waiver_order_" + Date.now(),
          amount: 0,
          currency: "INR",
          keyId: "rzp_test_preview",
          isZeroAmount: true,
          zeroAmount: true,
          waiverPaymentId: "prev_waiver_pay_" + Date.now(),
          message: "Full Waiver applied in Preview Mode (zero cash transaction)."
        });
      }
      return res.json({
        success: true,
        orderId: "prev_rzp_order_" + Date.now(),
        amount: amountInRupees * 100,
        currency: "INR",
        keyId: "rzp_test_preview",
        isSimulated: true
      });
    }

    // Retrieve extra details (locked price)
    const extra = await getExtraData(id);
    let amountInRupees = 19999; // Default fallback
    let planName = "Fusion Package";

    if (extra && extra.quote) {
      planName = extra.quote.packageName || "Standard Package";
      let totalPrice = extra.quote.price;
      const quoteDiscount = Number(extra.quote.discount || 0);
      const couponCode = extra.quote.couponCode;

      let finalWebsitePrice = totalPrice;
      if (couponCode) {
        const basePrice = quoteDiscount > 0 ? (totalPrice + quoteDiscount) : totalPrice;
        const validation = validateAndCalculateCoupon(couponCode, planName, project.email || "", basePrice);
        if (!validation.valid) {
          return res.status(400).json({ success: false, error: `Coupon revalidation failed at order creation: ${validation.error}` });
        }
        finalWebsitePrice = validation.finalWebsitePrice !== undefined ? validation.finalWebsitePrice : totalPrice;
      }

      if (term === "upfront") {
        if (quoteDiscount > 0 || couponCode) {
          // If discount or coupon was applied when locking quote
          amountInRupees = Math.round(finalWebsitePrice);
        } else {
          // If price stored is the base price (e.g., 9999), apply 10% upfront discount
          amountInRupees = Math.round(finalWebsitePrice * 0.9);
        }
      } else {
        // Milestone term (50% of final website price after coupon - never calculate 50% before coupon!)
        amountInRupees = Math.round(finalWebsitePrice * 0.5);
      }
    } else {
      // Fallback manual price calculation if quote is missing
      const packageId = project.selectedPackage || "growth";
      let basePrice = 19999;
      if (packageId === "foundation") basePrice = 9999;
      if (packageId === "dominance") basePrice = 39999;
      
      if (term === "upfront") {
        amountInRupees = Math.round(basePrice * 0.9); // 10% discount
      } else {
        amountInRupees = Math.round(basePrice * 0.5); // 50% milestone
      }
    }

    // If final amount is ₹0 (e.g. Full Waiver), complete order successfully without requiring RAZORPAY_VERIFICATION
    if (amountInRupees === 0) {
      const waiverOrderId = "waiver_order_" + Date.now();
      const waiverPaymentId = "waiver_pay_" + Date.now();
      const updatedProject = await processPaymentSuccessCore({
        id,
        req,
        project,
        term: term || "upfront",
        razorpay_order_id: waiverOrderId,
        razorpay_payment_id: waiverPaymentId,
        provider: "coupon_waiver",
        isSimulated: false
      });

      if (res.headersSent || req.timedOut) return;

      return res.json({
        success: true,
        zeroAmount: true,
        message: "Full waiver applied. Order completed successfully with ₹0 payable.",
        project: updatedProject
      });
    }

    if (process.env.RAZORPAY_VERIFICATION !== "true") {
      return res.status(400).json({
        success: false,
        error: "Razorpay order creation is disabled when RAZORPAY_VERIFICATION is not 'true'."
      });
    }

    // Ignite plan order amount calculation
    const isIgnitePlan = 
      project.selectedPackage === "foundation" ||
      (project.selectedPackage && project.selectedPackage.toLowerCase().includes("ignite")) ||
      (planName && planName.toLowerCase().includes("ignite")) ||
      (extra?.quote?.packageName && extra.quote.packageName.toLowerCase().includes("ignite"));

    const amountInPaise = amountInRupees * 100;

    // Initialize lazy client and generate order
    const rzp = getRazorpayInstance();
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${id.substring(0, 15)}_${Date.now().toString().substring(5)}`,
      notes: {
        projectId: id,
        planName,
        term,
        clientName: project.clientName || "",
        email: project.email || ""
      }
    };

    console.log(`[Razorpay Order API] Creating order for project ${id}:`, {
      selectedPackage: project.selectedPackage,
      extraQuotePrice: extra?.quote?.price,
      planName,
      term,
      isIgnitePlan,
      finalAmountInRupees: amountInRupees,
      finalAmountInPaise: amountInPaise,
      razorpayOptions: options
    });

    const order = await rzp.orders.create(options);

    // Log "Payment Started" to Audit Trail
    await logAuditEvent({
      projectId: id,
      eventType: "Payment Started",
      requestId: req.reqId,
      actor: "Client",
      status: "Success",
      notes: `Initiated checkout for term: ${term} and package: ${planName}. Amount: Rs. ${amountInRupees}`
    });

    if (res.headersSent || req.timedOut) return;

    return res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      term,
      amountInRupees
    });
  } catch (error: any) {
    if (res.headersSent) return;
    logger.error("Failed to create Razorpay order", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to create payment order." });
  }
});

// Helper: Shared Payment Success Processing Logic (Reused by Razorpay verification, Webhook & Simulation)
async function processPaymentSuccessCore({
  id,
  req,
  project,
  term,
  razorpay_order_id,
  razorpay_payment_id,
  provider = "razorpay",
  isSimulated = false
}: {
  id: string;
  req: any;
  project: any;
  term: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  provider?: string;
  isSimulated?: boolean;
}) {
  const extra = await getExtraData(id);
  const planName = extra?.quote?.packageName || "Standard Package";

  const portalAccessSource = project.portalAccessSource || "automatic";
  const shouldGrantAccess = portalAccessSource === "manual" ? project.portalAccess : true;

  const isFinalMilestone = term === "final";
  const nextPaymentStatus = (term === "upfront" || isFinalMilestone) ? "paid" : "partially_paid";
  const planDetailString = isFinalMilestone ? `${planName} (fully paid milestone)` : `${planName} (${term || "milestone"})${isSimulated ? " [SIMULATED]" : ""}`;

  const updates = {
    paymentStatus: nextPaymentStatus,
    portalAccess: shouldGrantAccess,
    paymentProvider: provider,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    purchasedPlan: planDetailString,
    purchaseDate: new Date().toISOString(),
    portalAccessSource
  };

  const updatedProject = await updateProject(id, updates, req.reqId);

  addFounderNotification({
    type: "payment_received",
    projectId: id,
    projectName: project.businessName || project.clientName || "Client",
    title: "Payment received",
    message: `${project.businessName || project.clientName || "Client"} paid for ${planName}.`,
    actionLabel: "Open project",
    severity: "important"
  });

  // Finalize Coupon Redemption upon successful payment verification / success execution
  if (extra?.quote?.couponCode) {
    const cCode = extra.quote.couponCode;
    const custEmail = project.email || "";
    const discAmt = Number(extra.quote.discount || 0);
    recordRedemption(cCode, custEmail, id, discAmt, isSimulated);
    console.log(`[Coupon Redemption] Finalized successful redemption for coupon ${cCode} on project ${id}`);
  }

  // Track event in Audit Trail
  await logAuditEvent({
    projectId: id,
    eventType: isSimulated ? "Payment Verified (Simulated)" : "Payment Verified",
    requestId: req.reqId,
    actor: isSimulated ? "System" : "Client",
    status: "Success",
    notes: `Verified payment of plan: ${updates.purchasedPlan}. Ref: ${razorpay_payment_id}`
  });

  if (shouldGrantAccess) {
    await logAuditEvent({
      projectId: id,
      eventType: "Portal Activated",
      requestId: req.reqId,
      actor: "System",
      status: "Success",
      notes: isSimulated ? "Portal access automatically granted upon simulated payment." : "Portal access automatically granted upon successful payment."
    });
  }

  // Send Receipt Email Notification
  const devUrl = process.env.DEV_APP_URL || "http://localhost:3000";
  const portalUrl = `${devUrl}/login`;
  const calcReceiptAmount = (extraData: any, pTerm: string) => {
    if (extraData?.quote?.price) {
      const qPrice = extraData.quote.price;
      const qDiscount = Number(extraData.quote.discount || 0);
      if (pTerm === "upfront") {
        return "Rs. " + (qDiscount > 0 ? qPrice : Math.round(qPrice * 0.9));
      } else {
        const baseP = qDiscount > 0 ? (qPrice + qDiscount) : qPrice;
        return "Rs. " + Math.round(baseP * 0.5);
      }
    }
    return pTerm === "upfront" ? "Rs. 13,499" : "Rs. 7,499";
  };
  const formattedAmount = calcReceiptAmount(extra, term);
  const emailHtml = getPaymentSuccessTemplate(
    updatedProject.clientName,
    updatedProject.businessName,
    updates.purchasedPlan,
    razorpay_order_id,
    formattedAmount,
    portalUrl
  );
  sendEmailAsync(updatedProject.email, `${isSimulated ? "[SIMULATED] " : ""}Payment Confirmed - ${updatedProject.businessName}`, emailHtml);

  // Dispatch Internal Admin Alert
  triggerAdminNotification(
    isSimulated ? "Payment Verified (Simulated)" : "Payment Verified",
    `Successful checkout transaction has been completed and verified for project ${updatedProject.businessName}.${isSimulated ? " (Development Simulation Mode)" : ""}`,
    {
      "Project ID": id,
      "Client Name": updatedProject.clientName,
      "Business Name": updatedProject.businessName,
      "Plan Purchased": updates.purchasedPlan,
      "Payment Ref": razorpay_payment_id,
      "Order Ref": razorpay_order_id,
      "Amount Verified": formattedAmount,
      "Simulation Mode": isSimulated ? "Active" : "Disabled"
    },
    req.reqId
  );

  return updatedProject;
}

// API: Verify Razorpay Payment Signature (Client-side fast checkout verification)
app.post("/api/projects/:id/verify-payment", requestTimeout(15000, "Verify Razorpay Payment"), validateProjectIdParam, requireAuth, verifyProjectOwnership, paymentVerificationRateLimiter, validateBody(verifyPaymentSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, term } = req.body;

    checkAbort(req);

    if (req.isPreview || isProjectIdPreview(id)) {
      const activeProj = savePreviewProject({
        id,
        paymentStatus: term === "upfront" ? "paid" : "partially_paid",
        paymentId: razorpay_payment_id || "prev_pay_" + Date.now(),
        orderId: razorpay_order_id || "prev_order_" + Date.now(),
        portalAccess: true
      });
      return res.json({
        success: true,
        message: "Payment verified in Customer Preview Isolation Mode.",
        project: activeProj
      });
    }

    if (process.env.RAZORPAY_VERIFICATION !== "true") {
      return res.status(400).json({
        success: false,
        error: "Razorpay payment verification is disabled when RAZORPAY_VERIFICATION is not 'true'."
      });
    }

    // Validate Signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      logger.warn(`Payment signature verification failed for project ${id}`);
      return res.status(400).json({ success: false, error: "Invalid payment signature." });
    }

    // Retrieve project by ID from request context
    const project = req.project;

    // Check if project was already updated
    if ((project.paymentStatus === "paid" || project.paymentStatus === "partially_paid") && project.paymentId === razorpay_payment_id) {
      return res.json({
        success: true,
        message: "Payment already verified.",
        project
      });
    }

    const updatedProject = await processPaymentSuccessCore({
      id,
      req,
      project,
      term,
      razorpay_order_id,
      razorpay_payment_id,
      provider: "razorpay",
      isSimulated: false
    });

    if (res.headersSent || req.timedOut) return;

    return res.json({
      success: true,
      message: "Payment verified successfully. Portal access granted.",
      project: updatedProject
    });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Failed to verify payment:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to verify payment." });
  }
});

// API: Development Payment Simulation Endpoint (Reuses exact core payment success flow)
app.post("/api/projects/:id/simulate-payment", requestTimeout(15000, "Simulate Payment"), validateProjectIdParam, requireAuth, requireRole(["super_admin", "admin"]), verifyProjectOwnership, validateBody(simulatePaymentSchema), async (req: any, res) => {
  try {
    // Block simulation if RAZORPAY_VERIFICATION is enabled ("true")
    if (process.env.RAZORPAY_VERIFICATION === "true") {
      return res.status(403).json({
        success: false,
        error: "Payment simulation is disabled when RAZORPAY_VERIFICATION=true."
      });
    }

    const { id } = req.params;
    const { term = "upfront", action = "success" } = req.body;
    const project = req.project;

    checkAbort(req);

    if (action === "success") {
      const simOrderId = "sim_order_" + Date.now();
      const simPaymentId = "sim_pay_" + Date.now();

      const updatedProject = await processPaymentSuccessCore({
        id,
        req,
        project,
        term: term || "upfront",
        razorpay_order_id: simOrderId,
        razorpay_payment_id: simPaymentId,
        provider: "simulated_razorpay",
        isSimulated: true
      });

      if (res.headersSent || req.timedOut) return;

      return res.json({
        success: true,
        message: "Payment simulation successful. Client portal unlocked.",
        project: updatedProject
      });
    } else if (action === "failed") {
      const updatedProject = await updateProject(id, { paymentStatus: "failed" }, req.reqId);
      await logAuditEvent({
        projectId: id,
        eventType: "Payment Failed (Simulated)",
        requestId: req.reqId,
        actor: "System",
        status: "Failed",
        notes: `Simulated transaction failure for term: ${term}`
      });

      triggerAdminNotification(
        "Payment Failed (Simulated)",
        `Simulated payment failure triggered for project ${project.businessName}.`,
        { "Project ID": id, "Term": term },
        req.reqId
      );

      return res.json({
        success: true,
        message: "Simulated payment failure processed.",
        project: updatedProject,
        paymentStatus: "failed"
      });
    } else if (action === "cancelled") {
      const updatedProject = await updateProject(id, { paymentStatus: "cancelled" }, req.reqId);
      await logAuditEvent({
        projectId: id,
        eventType: "Payment Cancelled (Simulated)",
        requestId: req.reqId,
        actor: "System",
        status: "Failed",
        notes: `Simulated transaction cancellation for term: ${term}`
      });

      return res.json({
        success: true,
        message: "Simulated payment cancellation processed.",
        project: updatedProject,
        paymentStatus: "cancelled"
      });
    } else if (action === "pending") {
      const updatedProject = await updateProject(id, { paymentStatus: "pending" }, req.reqId);
      await logAuditEvent({
        projectId: id,
        eventType: "Payment Pending (Simulated)",
        requestId: req.reqId,
        actor: "System",
        status: "Pending",
        notes: `Simulated pending transaction for term: ${term}`
      });

      return res.json({
        success: true,
        message: "Simulated pending payment processed.",
        project: updatedProject
      });
    } else {
      return res.status(400).json({ success: false, error: `Invalid simulation action: ${action}` });
    }
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Failed to process payment simulation:", error);
    return res.status(500).json({ success: false, error: error.message || "Simulation failed." });
  }
});

// API: Manual Payment Reconciliation (Admin / Super Admin)
app.post("/api/projects/:id/manual-payment-reconciliation", requestTimeout(10000, "Manual Payment Reconciliation"), validateProjectIdParam, requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { newStatus, reason } = req.body || {};

    if (!["paid", "partially_paid", "unpaid"].includes(newStatus)) {
      return res.status(400).json({ success: false, error: "Invalid payment status specified." });
    }

    if (!reason || typeof reason !== "string" || reason.trim().length < 3) {
      return res.status(400).json({ success: false, error: "A valid reconciliation reason (at least 3 characters) is required." });
    }

    const previousProject = await getProjectById(id);
    if (!previousProject) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const previousStatus = previousProject.paymentStatus || "unpaid";

    // Update project payment status
    const updated = await updateProject(id, { paymentStatus: newStatus }, req.reqId);

    const timestamp = new Date().toISOString();
    const actorEmail = req.user?.email || req.user?.id || "Admin";
    const actorRole = req.user?.role || "admin";

    // Immutable audit entry
    await logAuditEvent({
      projectId: id,
      eventType: "Manual Payment Reconciliation",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: JSON.stringify({
        source: "MANUAL_RECONCILIATION",
        projectId: id,
        actorIdentity: actorEmail,
        actorRole,
        previousPaymentStatus: previousStatus,
        newPaymentStatus: newStatus,
        reason: reason.trim(),
        timestamp
      })
    });

    return res.json({
      success: true,
      project: updated,
      message: `Payment status successfully reconciled from "${previousStatus}" to "${newStatus}".`
    });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed manual payment reconciliation", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Generate & Download Official CodeFuser Payment Receipt PDF
app.get("/api/projects/:id/payment-receipt", requestTimeout(20000, "Generate Payment Receipt"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    checkAbort(req);

    // Retrieve project by ID
    let project = (req.isPreview || isProjectIdPreview(id)) ? getPreviewProject(id) : (req.project || await getProjectById(id));
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    // Retrieve extra quote / package details
    const extra = (req.isPreview || isProjectIdPreview(id)) ? getPreviewExtra(id) : await getExtraData(id);

    // 1. Retrieve or generate & persist persistent receipt number
    let receiptNumber = project.payment?.receiptNumber || project.payment?.receipt_number;
    if (!receiptNumber) {
      receiptNumber = "CF-REC-" + (id || "CF").substring(0, 8).toUpperCase();
      try {
        const updatedPaymentObj = {
          ...(project.payment || {}),
          receiptNumber
        };
        project = await updateProject(id, { payment: updatedPaymentObj }, req.reqId);
      } catch (err) {
        logger.warn(`Notice: Could not persist receiptNumber to project ${id}:`, err);
      }
    }

    // 2. Determine Package Base List Price & Quoted Data
    let packageName = extra?.quote?.packageName || project.selectedPackage || "Fusion Package";
    if (packageName === "foundation") packageName = "Ignite Package (Foundation)";
    else if (packageName === "growth") packageName = "Fusion Package (Growth)";
    else if (packageName === "dominance") packageName = "Scale Package (Dominance)";

    let baseListPrice = 19999;
    if (project.selectedPackage === "foundation" || project.selectedPackage?.toLowerCase().includes("ignite")) {
      baseListPrice = 9999;
    } else if (project.selectedPackage === "growth" || project.selectedPackage?.toLowerCase().includes("fusion")) {
      baseListPrice = 19999;
    } else if (project.selectedPackage === "dominance" || project.selectedPackage?.toLowerCase().includes("scale")) {
      baseListPrice = 39999;
    }

    const quotePrice = extra?.quote?.price !== undefined ? Number(extra.quote.price) : undefined;
    const quoteDiscount = extra?.quote?.discount !== undefined ? Number(extra.quote.discount) : 0;
    const couponCode = String(extra?.quote?.couponCode || "").trim();

    const listPrice = (quotePrice !== undefined && quoteDiscount > 0)
      ? quotePrice + quoteDiscount
      : (quotePrice !== undefined ? quotePrice : baseListPrice);

    // 3. Determine Payment Method, Provider & Identifiers
    const provider = String(project.paymentProvider || project.payment?.provider || "").toLowerCase();
    const paymentId = String(project.paymentId || project.payment?.paymentId || "").trim();
    const orderId = String(project.orderId || project.payment?.orderId || "").trim();
    const purchasedPlan = String(project.purchasedPlan || project.payment?.purchasedPlan || "").trim();
    const purchasedPlanLower = purchasedPlan.toLowerCase();

    const isSimulated = provider.includes("simulat") || 
      paymentId.startsWith("sim_pay_") || 
      orderId.startsWith("sim_order_") || 
      purchasedPlan.includes("[SIMULATED]");

    const isWaiver = provider === "coupon_waiver" ||
      paymentId.startsWith("waiver_pay_") ||
      orderId.startsWith("waiver_order_") ||
      couponCode.toUpperCase() === "FULLWAIVER";

    const isManual = provider === "manual";
    const isRazorpay = provider.includes("razorpay") || paymentId.startsWith("pay_") || orderId.startsWith("order_");

    let paymentMethod = "Pending Payment";
    let transactionLabel = "Transaction ID:";
    let orderLabel = "Order Reference:";
    let documentTitle = "PAYMENT RECEIPT";
    let documentSubtitle = "OFFICIAL PAYMENT CONFIRMATION";
    let statusBadgeText = "PAID IN FULL";

    if (isWaiver) {
      paymentMethod = "100% Coupon Waiver";
      transactionLabel = "Waiver Reference:";
      orderLabel = "Waiver Order Ref:";
      documentTitle = "PROJECT SETTLEMENT STATEMENT";
      documentSubtitle = "PROMOTIONAL WAIVER CONFIRMATION";
      statusBadgeText = "FULLY WAIVED (100% PROMO)";
    } else if (isSimulated) {
      paymentMethod = "Payment Sandbox / Simulation";
      transactionLabel = "Simulation Reference:";
      orderLabel = "Simulation Order Ref:";
      documentTitle = "PAYMENT SIMULATION STATEMENT";
      documentSubtitle = "SANDBOX TEST CONFIRMATION";
      statusBadgeText = "TEST / SIMULATION";
    } else if (isManual) {
      paymentMethod = "Manual Reconciliation";
      transactionLabel = "Reconciliation ID:";
      orderLabel = "Order Reference:";
      statusBadgeText = "MANUALLY SETTLED";
    } else if (isRazorpay) {
      paymentMethod = "Razorpay Online Gateway";
    } else if (project.paymentStatus === "paid" || project.paymentStatus === "partially_paid") {
      paymentMethod = "Verified Direct Payment";
    }

    // 4. Calculate Settlement Amounts accurately matching Money Metrics
    const status = project.paymentStatus || "unpaid";

    let paymentType = "Full Project Contract";
    if (isWaiver) {
      paymentType = "100% Promotional Waiver";
    } else if (purchasedPlanLower.includes("upfront")) {
      paymentType = "100% Upfront Settlement";
    } else if (purchasedPlanLower.includes("milestone")) {
      paymentType = "50% Milestone Settlement";
    } else if (status === "partially_paid") {
      paymentType = "Milestone Phase 1 (50%)";
    } else if (status === "paid") {
      paymentType = "Full Contract Settlement";
    }

    let discount = 0;
    let discountLabel = "Promotional Discount / Waiver";
    let projectTotal = listPrice;
    let previousPaid = 0;
    let currentPayment = 0;
    let totalPaid = 0;
    let balanceRemaining = 0;
    let confirmationMessage = "";

    if (isWaiver) {
      discount = listPrice;
      discountLabel = couponCode ? `100% Coupon Waiver (${couponCode})` : "100% Promotional Waiver";
      projectTotal = 0;
      previousPaid = 0;
      currentPayment = 0;
      totalPaid = 0;
      balanceRemaining = 0;
      confirmationMessage = "This official statement confirms that this project was registered and completed under a 100% promotional waiver. Total cash collected is Rs. 0. The project is fully activated.";
    } else if (isSimulated) {
      discount = quoteDiscount > 0 ? quoteDiscount : 0;
      discountLabel = "Simulation Discount";
      projectTotal = Math.max(0, listPrice - discount);
      previousPaid = 0;
      currentPayment = 0;
      totalPaid = 0;
      balanceRemaining = 0;
      confirmationMessage = "This test statement confirms that this transaction was executed in sandbox simulation mode. No real payment was collected.";
    } else if (isManual) {
      discount = quoteDiscount > 0 ? quoteDiscount : 0;
      projectTotal = Math.max(0, listPrice - discount);
      currentPayment = projectTotal;
      totalPaid = projectTotal;
      previousPaid = 0;
      balanceRemaining = 0;
      confirmationMessage = `This official receipt confirms that the project total of Rs. ${projectTotal.toLocaleString("en-IN")} was manually settled and reconciled. Remaining balance is Rs. 0.`;
    } else {
      // Real payment flow (Razorpay / cash)
      if (quoteDiscount > 0) {
        discount = quoteDiscount;
        discountLabel = couponCode ? `Coupon Discount (${couponCode})` : "Promotional Discount";
      } else if (purchasedPlanLower.includes("upfront") && (!couponCode || quoteDiscount === 0)) {
        discount = Math.round(listPrice * 0.1);
        discountLabel = "10% Upfront Payment Discount";
      }

      projectTotal = Math.max(0, listPrice - discount);

      if (status === "paid") {
        if (purchasedPlanLower.includes("milestone") && (purchasedPlanLower.includes("fully paid") || purchasedPlanLower.includes("phase 2") || purchasedPlanLower.includes("final"))) {
          // Final 50% milestone payment completed
          previousPaid = Math.round(projectTotal * 0.5);
          currentPayment = projectTotal - previousPaid;
          totalPaid = projectTotal;
          balanceRemaining = 0;
          statusBadgeText = "PAID IN FULL";
          confirmationMessage = `This official receipt confirms that the final milestone payment of Rs. ${currentPayment.toLocaleString("en-IN")} was successfully received. Your project contract total of Rs. ${projectTotal.toLocaleString("en-IN")} is now FULLY SETTLED and your remaining balance is Rs. 0.`;
        } else {
          // 100% full payment
          previousPaid = 0;
          currentPayment = projectTotal;
          totalPaid = projectTotal;
          balanceRemaining = 0;
          statusBadgeText = "PAID IN FULL";
          confirmationMessage = `This official receipt confirms that the payment of Rs. ${currentPayment.toLocaleString("en-IN")} was successfully received. Your project contract total of Rs. ${projectTotal.toLocaleString("en-IN")} is now FULLY SETTLED and your remaining balance is Rs. 0.`;
        }
      } else if (status === "partially_paid") {
        previousPaid = 0;
        currentPayment = Math.round(projectTotal * 0.5);
        totalPaid = currentPayment;
        balanceRemaining = projectTotal - totalPaid;
        statusBadgeText = "PARTIALLY PAID";
        confirmationMessage = `This official receipt confirms that a partial payment of Rs. ${currentPayment.toLocaleString("en-IN")} was successfully received. Total amount paid to date is Rs. ${totalPaid.toLocaleString("en-IN")}. Remaining balance due is Rs. ${balanceRemaining.toLocaleString("en-IN")}.`;
      } else {
        previousPaid = 0;
        currentPayment = 0;
        totalPaid = 0;
        balanceRemaining = projectTotal;
        statusBadgeText = "PAYMENT PENDING";
        confirmationMessage = `This official statement confirms that payment is currently pending for this project.`;
      }
    }

    // 5. Date Formatting
    const rawPurchaseDate = project.purchaseDate || project.payment?.purchaseDate || project.timestamp || new Date().toISOString();
    let formattedDate = "N/A";
    try {
      formattedDate = new Date(rawPurchaseDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch (e) {
      formattedDate = new Date().toLocaleDateString("en-IN");
    }

    // 6. GST / Tax details (do not fabricate GST if missing)
    const gstin = project.onboarding?.gstin || project.gstin || undefined;

    const websiteBuildPrice = extra?.quote?.websitePrice !== undefined ? Number(extra.quote.websitePrice) : undefined;
    const websiteBuildDiscount = extra?.quote?.websiteDiscount !== undefined ? Number(extra.quote.websiteDiscount) : undefined;
    const hostingPrice = extra?.quote?.hostingPrice !== undefined ? Number(extra.quote.hostingPrice) : undefined;
    const hostingDiscount = extra?.quote?.hostingDiscount !== undefined ? Number(extra.quote.hostingDiscount) : undefined;

    // 7. Compile Receipt Data
    const receiptData = {
      receiptNumber,
      receiptDate: formattedDate,
      clientName: project.clientName || "Valued Client",
      businessName: project.businessName || "Business Account",
      clientEmail: project.clientEmail || project.email || undefined,
      projectId: id,
      projectName: `${project.businessName} Digital Platform`,
      packageName,
      ownershipChoice: project.ownershipChoice === "subscription" ? "Subscription Plan" : "Buyout (Full Code Base & License)",
      paymentType,
      paymentStatus: status,
      paymentDate: formattedDate,
      transactionId: paymentId || (status === "unpaid" ? "PENDING" : isWaiver ? "WAIVER_CONFIRMED" : "VERIFIED_RECORD"),
      transactionLabel,
      orderId: orderId || "N/A",
      orderLabel,
      paymentMethod,
      currency: "INR",
      listPrice,
      discount,
      discountLabel,
      websiteBuildPrice,
      websiteBuildDiscount,
      hostingPrice,
      hostingDiscount,
      projectTotal,
      previousPaid,
      currentPayment,
      totalPaid,
      balanceRemaining,
      gstin,
      isWaiver,
      isSimulated,
      documentTitle,
      documentSubtitle,
      statusBadgeText,
      confirmationMessage
    };

    // Log download event in Audit Trail
    await logAuditEvent({
      projectId: id,
      eventType: "Payment Statement Downloaded",
      requestId: req.reqId,
      actor: req.isAdmin ? "Admin" : "Client",
      status: "Success",
      notes: `Generated official PDF receipt #${receiptNumber} for ${project.businessName}`
    });

    const pdfBuffer = await generatePaymentReceiptPDF(receiptData);

    if (res.headersSent || req.timedOut) return;

    const safeFilename = `CodeFuser-Receipt-${receiptNumber.replace(/[^a-zA-Z0-9_-]/g, "")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (error: any) {
    if (res.headersSent) return;
    logger.error("Failed to generate payment receipt PDF:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to generate receipt PDF." });
  }
});

// ==========================================
// HOSTING & DOMAIN BILLING API ENDPOINTS
// ==========================================

// GET /api/projects/:id/hosting - Get current project hosting subscription, domain & invoices
app.get("/api/projects/:id/hosting", requireAuth, validateProjectIdParam, async (req: any, res) => {
  try {
    const { id } = req.params;
    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const sub = await getHostingSubscription(id);
    const domain = await getDomainRecord(id);
    const invoices = getHostingInvoices(id);

    return res.json({
      success: true,
      subscription: sub,
      domain,
      invoices,
      config: DEFAULT_HOSTING_CONFIG
    });
  } catch (err: any) {
    logger.error("Error fetching hosting data:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to load hosting information." });
  }
});

// POST /api/projects/:id/hosting/create-invoice-order - Create Razorpay order for manual hosting renewal payment
app.post("/api/projects/:id/hosting/create-invoice-order", requireAuth, validateProjectIdParam, async (req: any, res) => {
  try {
    const { id } = req.params;
    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const invoice = await getOrCreatePendingHostingInvoice(id);
    const amountInPaisa = Math.round(invoice.finalAmount * 100);

    let razorpayOrder: any = null;
    let isRealRazorpay = false;

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const razorpay = getRazorpayInstance();
        razorpayOrder = await razorpay.orders.create({
          amount: amountInPaisa,
          currency: "INR",
          receipt: invoice.receiptNumber,
          notes: {
            projectId: id,
            invoiceId: invoice.id,
            receiptNumber: invoice.receiptNumber,
            clientName: project.clientName || "",
            businessName: project.businessName || "",
            type: "hosting_renewal"
          }
        });
        isRealRazorpay = true;
      } catch (rzpErr: any) {
        console.warn("[Hosting Payment Order] Razorpay order creation error, fallback to simulated order:", rzpErr?.message || rzpErr);
      }
    }

    if (!razorpayOrder) {
      razorpayOrder = {
        id: `order_host_sim_${id.slice(-6)}_${Date.now()}`,
        entity: "order",
        amount: amountInPaisa,
        amount_paid: 0,
        amount_due: amountInPaisa,
        currency: "INR",
        receipt: invoice.receiptNumber,
        status: "created"
      };
    }

    await logAuditEvent({
      projectId: id,
      eventType: "Manual Hosting Renewal Order Created",
      requestId: req.reqId,
      actor: req.user?.fullName || "Client",
      status: "Success",
      notes: `Created Razorpay hosting order (${razorpayOrder.id}) for invoice ${invoice.receiptNumber} (Amount: ₹${invoice.finalAmount}).`
    });

    return res.json({
      success: true,
      orderId: razorpayOrder.id,
      invoiceId: invoice.id,
      receiptNumber: invoice.receiptNumber,
      amount: invoice.finalAmount,
      amountInPaisa,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_codefuser_key",
      isRealRazorpay
    });
  } catch (err: any) {
    logger.error("Failed to create manual hosting payment order:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to create hosting renewal payment order." });
  }
});

// POST /api/projects/:id/hosting/verify-payment - Verify manual hosting renewal payment
app.post("/api/projects/:id/hosting/verify-payment", requireAuth, validateProjectIdParam, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { invoiceId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const payId = razorpay_payment_id || `pay_sim_${Date.now()}`;
    const orderId = razorpay_order_id || `order_sim_${Date.now()}`;

    // Verify signature if credentials present
    if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature && razorpay_order_id && razorpay_payment_id) {
      const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!isValid) {
        return res.status(400).json({ success: false, error: "Invalid payment signature verification." });
      }
    }

    const { subscription, invoice } = await recordManualHostingPayment(id, invoiceId, payId, orderId);

    return res.json({
      success: true,
      message: "Hosting renewal payment verified successfully! Your hosting remains active.",
      subscription,
      invoice
    });
  } catch (err: any) {
    logger.error("Failed to verify manual hosting payment:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to verify hosting payment." });
  }
});

// DISCONNECTED/DISABLED AUTOPAY ROUTES (Kept safely returning standard explanatory responses)
app.post("/api/projects/:id/hosting/setup-autopay", requireAuth, validateProjectIdParam, async (_req: any, res) => {
  return res.status(400).json({
    success: false,
    error: "Automatic hosting AutoPay is disabled on CodeFuser. Please use manual hosting invoice payments."
  });
});

app.post("/api/projects/:id/hosting/verify-autopay", requireAuth, validateProjectIdParam, async (_req: any, res) => {
  return res.status(400).json({
    success: false,
    error: "Automatic hosting AutoPay is disabled on CodeFuser. Please use manual hosting invoice payments."
  });
});

app.post("/api/projects/:id/hosting/cancel-autopay", requireAuth, validateProjectIdParam, async (_req: any, res) => {
  return res.status(400).json({
    success: false,
    error: "Automatic hosting AutoPay is disabled on CodeFuser. No active mandate to cancel."
  });
});

// GET /api/hosting/test-matrix - Execute and return verification results for mandatory test matrix cases
app.get("/api/hosting/test-matrix", requireAuth, requireRole(["super_admin", "admin"]), async (_req, res) => {
  try {
    const report = await runHostingLifecycleTestMatrix();
    return res.json(report);
  } catch (err: any) {
    logger.error("Failed to run hosting test matrix:", err);
    return res.status(500).json({ success: false, error: err.message || "Test matrix execution failed." });
  }
});

// GET /api/hosting/test-notification-matrix - Execute and return verification results for notification hardening scenarios A-I
app.get("/api/hosting/test-notification-matrix", requireAuth, requireRole(["super_admin", "admin"]), async (_req, res) => {
  try {
    const report = await runNotificationHardeningTestMatrix();
    return res.json(report);
  } catch (err: any) {
    logger.error("Failed to run notification test matrix:", err);
    return res.status(500).json({ success: false, error: err.message || "Notification test matrix execution failed." });
  }
});

// GET /api/hosting/whatsapp-status - Returns live diagnostics for the WhatsApp Notification Provider
app.get("/api/hosting/whatsapp-status", requireAuth, requireRole(["super_admin", "admin"]), (_req, res) => {
  try {
    const statusReport = getWhatsAppSystemStatus();
    return res.json(statusReport);
  } catch (err: any) {
    logger.error("Failed to retrieve WhatsApp system status:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to retrieve WhatsApp status." });
  }
});

// GET /api/hosting/sms-status - Returns status of SMS provider architecture
app.get("/api/hosting/sms-status", requireAuth, requireRole(["super_admin", "admin"]), (_req, res) => {
  return res.json({
    providerDetected: "None",
    providerConfigured: false,
    status: "READY_FOR_PROVIDER_CONFIGURATION",
    message: "SMS notification provider architecture ready. Configure SMS API credentials (e.g. Twilio / Fast2SMS) when needed."
  });
});

// GET /api/hosting/test-whatsapp - Executes a dry-run test of WhatsApp dispatch logic for validation
app.get("/api/hosting/test-whatsapp", requireAuth, requireRole(["super_admin", "admin"]), async (_req, res) => {
  try {
    const { sendHostingWhatsAppNotification } = await import("./server/whatsapp_notifications.js");
    const { getProjects } = await import("./server/db.js");
    const projects = await getProjects();
    const testProjectId = projects[0]?.id || "p1";

    const result = await sendHostingWhatsAppNotification("AUTOPAY_ACTIVATED", testProjectId, { forced: true });
    return res.json({ success: true, projectTested: testProjectId, dispatchResult: result });
  } catch (err: any) {
    logger.error("Failed to test WhatsApp notification dispatch:", err);
    return res.status(500).json({ success: false, error: err.message || "WhatsApp dispatch test failed." });
  }
});

// POST /api/hosting/admin-scan - Manually trigger server-side hosting lifecycle scan
app.post("/api/hosting/admin-scan", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    const stats = await runHostingLifecycleScan(req.reqId || `manual_${Date.now()}`);
    return res.json({ success: true, stats });
  } catch (err: any) {
    logger.error("Failed to run manual hosting scan:", err);
    return res.status(500).json({ success: false, error: err.message || "Hosting scan failed." });
  }
});

// GET /api/projects/:id/hosting/receipt/:invoiceId - Download Hosting PDF Receipt
app.get("/api/projects/:id/hosting/receipt/:invoiceId", requireAuth, validateProjectIdParam, async (req: any, res) => {
  try {
    const { id, invoiceId } = req.params;
    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const sub = await getHostingSubscription(id);
    const invoices = getHostingInvoices(id);
    let invoice = invoices.find((i) => i.id === invoiceId || i.receiptNumber === invoiceId);

    if (!invoice) {
      // Fallback default invoice
      invoice = invoices[0] || {
        id: invoiceId,
        subscriptionId: sub.id,
        projectId: id,
        receiptNumber: `HST-${Date.now().toString().slice(-6)}`,
        billingPeriodStart: sub.freeTrialStart,
        billingPeriodEnd: sub.freeTrialEnd,
        amount: sub.monthlyAmount,
        discount: sub.monthlyAmount,
        finalAmount: 0,
        status: "PAID",
        transactionId: "PROMO_FREE_HOSTING",
        paymentDate: sub.createdAt,
        nextBillingDate: sub.nextBillingDate,
        createdAt: sub.createdAt
      };
    }

    const pdfBuffer = await generateHostingReceiptPDF({
      invoice,
      subscription: sub,
      clientName: project.clientName || "Valued Client",
      businessName: project.businessName || "Business Account",
      clientEmail: project.email || "billing@codefuser.com",
      projectName: `${project.businessName} Digital Platform`
    });

    await logAuditEvent({
      projectId: id,
      eventType: "Hosting Receipt Downloaded",
      requestId: req.reqId,
      actor: req.isAdmin ? "Admin" : "Client",
      status: "Success",
      notes: `Generated hosting PDF invoice #${invoice.receiptNumber}`
    });

    const safeFilename = `CodeFuser-Hosting-Invoice-${invoice.receiptNumber}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (err: any) {
    logger.error("Failed to generate hosting receipt PDF:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to generate hosting invoice PDF." });
  }
});

// GET /api/admin/hosting - Mission Control All Subscriptions Overview
app.get("/api/admin/hosting", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    const projects = await getProjects();
    const list = await Promise.all(
      projects.map(async (p: any) => {
        const sub = await getHostingSubscription(p.id);
        const domain = await getDomainRecord(p.id);
        const invoices = getHostingInvoices(p.id);
        return {
          project: {
            id: p.id,
            businessName: p.businessName,
            clientName: p.clientName,
            email: p.email || (p as any).clientEmail,
            paymentStatus: p.paymentStatus
          },
          subscription: sub,
          domain,
          invoicesCount: invoices.length,
          lastInvoice: invoices[0] || null
        };
      })
    );

    return res.json({
      success: true,
      hostingList: list,
      totalActiveSubscriptions: list.filter((l) => l.subscription.status === "AUTOPAY_ACTIVE" || l.subscription.status === "FREE_TRIAL_ACTIVE").length
    });
  } catch (err: any) {
    logger.error("Failed to load admin hosting overview:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to load admin hosting overview." });
  }
});

// POST /api/admin/hosting/action - Mission Control Admin Subscription Actions
app.post("/api/admin/hosting/action", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    const { projectId, action, days } = req.body;
    if (!projectId || !action) {
      return res.status(400).json({ success: false, error: "Missing required fields: projectId and action." });
    }

    const sub = await getHostingSubscription(projectId);
    let updates: Partial<HostingSubscriptionRecord> = {};

    if (action === "extend_free_period") {
      const extDays = days || 30;
      const currentEnd = new Date(sub.freeTrialEnd);
      currentEnd.setDate(currentEnd.getDate() + extDays);
      updates = {
        freeTrialEnd: currentEnd.toISOString(),
        nextBillingDate: currentEnd.toISOString(),
        status: "FREE_TRIAL_ACTIVE"
      };
    } else if (action === "suspend_hosting") {
      updates = {
        status: "HOSTING_SUSPENDED",
        suspendedAt: new Date().toISOString()
      };
    } else if (action === "reactivate_hosting") {
      updates = {
        status: "AUTOPAY_ACTIVE",
        suspendedAt: null,
        failedPaymentCount: 0,
        gracePeriodEndsAt: null
      };
    } else if (action === "pause_subscription") {
      updates = {
        status: "SUBSCRIPTION_PAUSED",
        autopayStatus: "inactive"
      };
    } else if (action === "cancel_subscription") {
      updates = {
        status: "SUBSCRIPTION_CANCELLED",
        autopayStatus: "cancelled",
        mandateStatus: "revoked",
        cancelledAt: new Date().toISOString()
      };
    } else {
      return res.status(400).json({ success: false, error: `Invalid action: ${action}` });
    }

    const updated = await updateHostingSubscription(projectId, updates);

    // Dispatch corresponding email notifications asynchronously
    if (action === "suspend_hosting") {
      sendHostingLifecycleNotification("HOSTING_SUSPENDED", projectId);
    } else if (action === "reactivate_hosting") {
      sendHostingLifecycleNotification("HOSTING_REACTIVATED", projectId);
    } else if (action === "cancel_subscription") {
      sendHostingLifecycleNotification("AUTOPAY_CANCELLED", projectId);
    }

    await logAuditEvent({
      projectId,
      eventType: `Admin Hosting Action: ${action}`,
      requestId: req.reqId,
      actor: req.user?.fullName || "Admin",
      status: "Success",
      notes: `Executed admin action ${action} on project hosting subscription`
    });

    return res.json({
      success: true,
      message: `Successfully executed admin action '${action}'`,
      subscription: updated
    });
  } catch (err: any) {
    logger.error("Failed to execute admin hosting action:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to execute administrative action." });
  }
});

// --- Coupons & Offers API Routes ---

// GET /api/admin/coupons
app.get("/api/admin/coupons", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    const coupons = getAllCoupons();
    return res.json({ success: true, coupons });
  } catch (err: any) {
    logger.error("Failed to load admin coupons:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to load coupons." });
  }
});

// POST /api/admin/coupons
app.post("/api/admin/coupons", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    const {
      name,
      code,
      discountType,
      discountValue,
      eligiblePlans,
      hostingRule,
      freeHostingPromoRule,
      redemptionLimit,
      maxUsesPerCustomer,
      customerEligibility,
      startDate,
      endDate,
      status,
      afterLimitBehavior
    } = req.body;

    if (!name || !code || !discountType) {
      return res.status(400).json({ success: false, error: "Missing required fields: name, code, discountType." });
    }

    const existing = getCouponByCode(code);
    if (existing) {
      return res.status(400).json({ success: false, error: "A coupon with this code already exists." });
    }

    const coupon = createCoupon({
      name,
      code,
      discountType,
      discountValue: Number(discountValue) || 0,
      eligiblePlans: Array.isArray(eligiblePlans) ? eligiblePlans : ["ignite", "fusion"],
      hostingRule: hostingRule || "charge_normally",
      freeHostingPromoRule: freeHostingPromoRule || "apply",
      redemptionLimit: Number(redemptionLimit) || 10,
      maxUsesPerCustomer: Number(maxUsesPerCustomer) || 1,
      customerEligibility: customerEligibility || "new_only",
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status || "ACTIVE",
      afterLimitBehavior: afterLimitBehavior || "stop"
    });

    if (!coupon) {
      return res.status(500).json({ success: false, error: "We couldn't save this offer." });
    }

    return res.json({ success: true, coupon });
  } catch (err: any) {
    logger.error("Failed to create coupon:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to create coupon." });
  }
});

// PUT /api/admin/coupons/:id
app.put("/api/admin/coupons/:id", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    const { id } = req.params;
    const updated = updateCoupon(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Coupon not found." });
    }
    return res.json({ success: true, coupon: updated });
  } catch (err: any) {
    logger.error("Failed to update coupon:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to update coupon." });
  }
});

// POST /api/admin/coupons/:id/toggle
app.post("/api/admin/coupons/:id/toggle", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    const { id } = req.params;
    const toggled = toggleCouponStatus(id);
    if (!toggled) {
      return res.status(404).json({ success: false, error: "Coupon not found." });
    }
    return res.json({ success: true, coupon: toggled });
  } catch (err: any) {
    logger.error("Failed to toggle coupon status:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to toggle status." });
  }
});

// POST /api/admin/coupons/:id/archive
app.post("/api/admin/coupons/:id/archive", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    const { id } = req.params;
    const archived = archiveCoupon(id);
    if (!archived) {
      return res.status(404).json({ success: false, error: "Coupon not found." });
    }
    return res.json({ success: true, coupon: archived });
  } catch (err: any) {
    logger.error("Failed to archive coupon:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to archive coupon." });
  }
});

// DELETE /api/admin/coupons/:id
app.delete("/api/admin/coupons/:id", requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    const { id } = req.params;
    const result = deleteCoupon(id);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    return res.json({ success: true });
  } catch (err: any) {
    logger.error("Failed to delete coupon:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to delete coupon." });
  }
});

// POST /api/coupons/validate
app.post("/api/coupons/validate", async (req: any, res) => {
  try {
    const { code, planId, customerEmail, baseWebsitePrice } = req.body;
    if (!code || !planId) {
      return res.status(400).json({ valid: false, error: "Missing coupon code or plan ID." });
    }
    const basePrice = Number(baseWebsitePrice) || 19999;
    const result = validateAndCalculateCoupon(code, planId, customerEmail || "", basePrice);
    if (!result.valid) {
      return res.json({ valid: false, error: result.error });
    }

    return res.json({
      valid: true,
      code: result.coupon?.code,
      name: result.coupon?.name,
      discountType: result.coupon?.discountType,
      discountValue: result.coupon?.discountValue,
      discountAmount: result.discountAmount,
      finalWebsitePrice: result.finalWebsitePrice,
      hostingRule: result.coupon?.hostingRule,
      hostingWaived: result.hostingWaived,
      hostingDiscountAmount: result.hostingDiscountAmount,
      finalHostingPrice: result.finalHostingPrice,
      finalTotal: result.finalTotal,
      freeHostingPromoRule: result.coupon?.freeHostingPromoRule,
      description: result.coupon?.discountType === "free_build" ? "100% OFF website build" : result.coupon?.discountType === "percentage" ? `${result.coupon.discountValue}% OFF website build` : `₹${result.coupon?.discountValue} OFF website build`
    });
  } catch (err: any) {
    logger.error("Failed to validate coupon:", err);
    return res.status(500).json({ valid: false, error: "Failed to validate coupon." });
  }
});

// API: Razorpay Webhook Endpoint (Primary source-of-truth asynchronous processor)
app.post("/api/webhooks/razorpay", webhookRateLimiter, async (req: any, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({ success: false, error: "Missing x-razorpay-signature header." });
    }

    const rawBody = req.rawBody ? req.rawBody.toString("utf-8") : "";
    const result = await processRazorpayWebhookEvent(rawBody, String(signature), req.reqId);

    return res.status(result.statusCode).json(result);
  } catch (err: any) {
    console.error("Razorpay webhook endpoint processing error:", err);
    return res.status(500).json({ success: false, error: err.message || "Webhook processing failed." });
  }
});

// API: Run Razorpay Webhook Audit Test Matrix
app.get("/api/hosting/test-webhook-matrix", async (req: any, res) => {
  try {
    const matrixResult = await runRazorpayWebhookAuditTestMatrix();
    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...matrixResult
    });
  } catch (err: any) {
    console.error("Razorpay Webhook Audit Test Matrix Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to execute webhook test matrix."
    });
  }
});

// API: Upload Assets to the Asset Center (Base64)
app.post("/api/projects/:id/upload", requestTimeout(25000, "Asset Upload"), validateProjectIdParam, requireAuth, verifyProjectOwnership, uploadRateLimiter, validateBody(uploadAssetSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, type, size, content } = req.body;

    checkAbort(req);

    // Decode Content Buffer to validate size and bytes
    const buffer = Buffer.from(content, "base64");

    // Secure Upload Engine: Size checks
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ success: false, error: "File exceeds maximum allowed size of 5MB." });
    }

    // Secure Upload Engine: MIME type validation
    if (!MIME_WHITELIST.includes(type)) {
      return res.status(400).json({ success: false, error: "Invalid content type. Allowed formats: PNG, JPEG, JPG, GIF, WEBP, SVG, PDF, TXT, DOC, DOCX." });
    }

    // Secure Upload Engine: Filename sanitization
    const sanitizedName = path.basename(name).replace(/[^a-zA-Z0-9.\-_]/g, "");
    if (!sanitizedName) {
      return res.status(400).json({ success: false, error: "Invalid file name." });
    }

    // Secure Upload Engine: Extension validation (Extension Spoofing Protection)
    const ext = path.extname(sanitizedName).toLowerCase();
    const allowedExtensionsMap: { [key: string]: string[] } = {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/jpg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "image/svg+xml": [".svg"],
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    };

    const allowedExts = allowedExtensionsMap[type];
    if (!allowedExts || !allowedExts.includes(ext)) {
      return res.status(400).json({ success: false, error: "Mismatched file extension for content type." });
    }

    // Secure Upload Engine: Magic byte validation
    const magicValid = validateMagicBytes(buffer, type);
    if (!magicValid) {
      return res.status(400).json({ success: false, error: "File content signature verification (magic bytes) failed." });
    }

    checkAbort(req);

    if (req.isPreview || isProjectIdPreview(id)) {
      const assetId = "prev_asset_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const assetRecord = {
        id: assetId,
        name: sanitizedName,
        type,
        size: buffer.length,
        url: `/api/projects/${id}/assets/${assetId}/preview-download`,
        timestamp: new Date().toISOString()
      };
      savePreviewAsset(id, assetRecord, buffer);
      const extra = getPreviewExtra(id);
      return res.json({
        success: true,
        data: extra,
        message: "Asset uploaded successfully (Customer Preview Isolation Mode)."
      });
    }

    const supabase = getSupabase();
    const bucketName = "codefuser-assets";
    const safeName = Date.now() + "_" + sanitizedName;
    const storagePath = `${id}/${safeName}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: type,
        upsert: true
      });

    if (uploadErr) {
      throw new Error(`Supabase Storage upload error: ${uploadErr.message}`);
    }

    const fileUrl = `storage://codefuser-assets/${storagePath}`;
    const extra = await addAssetFile(id, {
      name: sanitizedName,
      type,
      size: buffer.length,
      url: fileUrl
    });

    // Log "Deliverables Uploaded" to Audit Trail
    await logAuditEvent({
      projectId: id,
      eventType: "Deliverables Uploaded",
      requestId: req.reqId,
      actor: req.isAdmin ? "Admin" : "Client",
      status: "Success",
      notes: `Uploaded asset: ${sanitizedName} (${type}, ${buffer.length} bytes)`
    });

    // Dispatch Internal Admin Alert
    const uploadProject = await getProjectById(id);
    triggerAdminNotification(
      "Asset Uploaded",
      `A new asset file has been successfully uploaded for project ${uploadProject?.businessName || id}.`,
      {
        "Project ID": id,
        "Business Name": uploadProject?.businessName || "Unknown",
        "Uploaded By": req.isAdmin ? "Admin" : "Client",
        "File Name": sanitizedName,
        "File Type": type,
        "File Size": `${(buffer.length / 1024).toFixed(1)} KB`
      },
      req.reqId
    );

    if (!req.isAdmin) {
      addFounderNotification({
        type: "asset_uploaded",
        projectId: id,
        projectName: uploadProject?.businessName || uploadProject?.clientName || "Client",
        title: "Files uploaded",
        message: `${uploadProject?.businessName || uploadProject?.clientName || "Client"} uploaded ${sanitizedName}.`,
        actionLabel: "View files",
        severity: "action_needed"
      });
    }

    if (res.headersSent || req.timedOut) return;

    return res.json({ 
      success: true, 
      data: extra, 
      message: "Asset uploaded successfully and pinned to target project workspace." 
    });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to upload asset", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to process asset upload." });
  }
});

// API: Verify Admin Password
app.post("/api/admin/verify", adminRateLimiter, validateBody(adminVerifySchema), (req, res) => {
  try {
    const { password } = req.body;
    const actualPassword = process.env.ADMIN_PASSWORD;
    
    if (!actualPassword) {
      return res.status(500).json({ 
        success: false, 
        error: "System Configuration Error: The administrative access key is not configured in the host environment." 
      });
    }

    if (password && safeCompare(password, actualPassword)) {
      return res.json({ success: true, message: "Authentication successful." });
    } else {
      return res.status(401).json({ success: false, error: "Access Key is incorrect. Please contact system administrators." });
    }
  } catch (error: any) {
    console.error("Admin verification failed:", error);
    return res.status(500).json({ success: false, error: "Internal server error occurred." });
  }
});

// API: AI Recommendation Engine
app.post("/api/recommendation", requestTimeout(45000, "AI Recommendation"), validateBody(recommendationSchema), async (req: any, res) => {
  try {
    const formData = req.body;
    
    checkAbort(req);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to deterministic recommendation generator.");
      const fallbackRecommendations = getDeterministicRecommendation(formData);
      
      if (res.headersSent || req.timedOut) return;

      return res.json({ 
        recommendations: fallbackRecommendations,
        recommendation_source: "fallback"
      });
    }

    // Initialize the official Google Gen AI Client
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `You are CodeFuser's expert IT and Business Growth Advisor.
Analyze the user's business diagnostics audit and generate personalized website package recommendations.
CodeFuser offers three precise and distinct tiered packages:
1. Ignite (id: "foundation", Price: "₹9,999", level: 1): Premium visual one-page identity hub. Best for micro-businesses, SaaS validate-tests, simple services, and direct local landing pages.
2. Fusion (id: "growth", Price: "₹19,999", level: 2): Full-scale multi-section business growth core. Best for local businesses desiring advanced lead forms, review showcases, interactive FAQs, and automated scheduler booking grids.
3. Catalyst (id: "dominance", Price: "₹39,999", level: 3): Immersive automated custom application. Ideal for complex digital agencies, CRM lead-pipelines, dynamic showcases, client accounts, or customized logic flows.

Analyze the user inputs:
- Company/Clinic Name: "${formData.businessName || 'Your Business'}"
- Rep/Owner Name: "${formData.ownerName || 'Representative'}"
- Intended Core Audience Profile: "${formData.targetAudience || 'General Audience'}"
- Primary Marketing/Sales Pain Point: "${formData.businessPainPoint || 'Low inquiries / Outdated look'}"
- Unique Market Edge: "${formData.uniqueAdvantage || 'Exceptional personal care'}"
- Choose Visual Tone Class: "${formData.brandTone || 'modern'}"
- Primary Tone Description: "${formData.brandColors || 'Amber & Carbon Grey'}"
- Requested scheduler: ${formData.needsBooking ? 'YES' : 'NO'}
- Requested reviews: ${formData.needsReviews ? 'YES' : 'NO'}
- Requested portfolio/gallery: ${formData.needsPortfolioGrid ? 'YES' : 'NO'}
- Requested custom products/pricing: ${formData.needsProducts ? 'YES' : 'NO'}

Generate exactly 3 recommendation structures:
- One and only one entry must have visual tag: "⭐ Best Match For Your Business" - select whichever of the three tiers (foundation, growth, or dominance) fits their requirements most logically and strategically.
- One and only one entry must have tag: "💰 Best Value" - map this to either "foundation" (Ignite) or "growth" (Fusion) as the most cost-effective path to resolve their pain point.
- One and only one entry must have tag: "📈 Built For Growth" - map this to either "growth" (Fusion) or "dominance" (Catalyst) as the path that equips them with future-proof capabilities like booking widgets, integrations, or databases.

Provide exactly 3 to 4 customized, strategic, friendly, human-written bullet points for each recommendation explaining HOW that specific package directly answers their listed audience profile, addresses their specific primary pain point, and incorporates their chosen design vibes.
Ensure absolutely ZERO developer-jargon, confidence scores, technical metrics, AI logs, or prompts are returned. Keep response completely polished and client-ready.`;

    let response: any = null;
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.5-flash"];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        checkAbort(req);
        console.log(`Attempting recommendation generation with model: ${modelName}`);
        response = await withRetry(async () => {
          return await ai.models.generateContent({
            model: modelName,
            contents: "Generate the customized package blueprints based on the parameters.",
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  recommendations: {
                    type: Type.ARRAY,
                    description: "Must contain exactly 3 recommendation cards mapping to 'foundation', 'growth', and 'dominance' plan IDs.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        planId: { 
                          type: Type.STRING, 
                          description: "Must be exactly 'foundation', 'growth', or 'dominance'" 
                        },
                        planName: { 
                          type: Type.STRING, 
                          description: "Must be 'Ignite', 'Fusion', or 'Catalyst'" 
                        },
                        tag: { 
                          type: Type.STRING, 
                          description: "Must be exactly '⭐ Best Match For Your Business', '💰 Best Value', or '📈 Built For Growth'" 
                        },
                        tagline: { 
                          type: Type.STRING, 
                          description: "A business-focused tagline explaining why this plan maps to their state" 
                        },
                        price: { 
                          type: Type.STRING, 
                          description: "List the correct price: ₹9,999 for foundation, ₹19,999 for growth, and ₹39,999 for dominance" 
                        },
                        bullets: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "3 to 4 concrete bullet points specifically matching their company goals, audience, and bottleneck solution"
                        }
                      },
                      required: ["planId", "planName", "tag", "tagline", "price", "bullets"]
                    }
                  }
                },
                required: ["recommendations"]
              }
            }
          });
        }, {
          reqId: req.reqId || "N/A",
          operationName: `Gemini generateContent (${modelName})`,
          isIdempotent: true
        });

        checkAbort(req);

        if (response && response.text) {
          const recommendationData = JSON.parse(response.text);
          if (recommendationData.recommendations && recommendationData.recommendations.length > 0) {
            console.log(`Successfully generated recommendations using model: ${modelName}`);
            
            if (res.headersSent || req.timedOut) return;

            return res.json({
              ...recommendationData,
              recommendation_source: "ai"
            });
          }
        }
      } catch (err: any) {
        if (req.timedOut || req.clientDisconnected) {
          throw err; // Stop trying models if we actually timed out or disconnected
        }
        console.warn(`Model ${modelName} call failed or was overloaded:`, err.message || err);
        lastError = err;
        // Proceed to next model in loop
      }
    }

    if (lastError) {
      throw lastError;
    } else {
      throw new Error("All reservation models returned empty responses.");
    }

  } catch (error) {
    if (res.headersSent || req.timedOut || req.clientDisconnected) return;
    console.error("Gemini AI Recommendation Pipeline failed:", error);
    const fallbackRecommendations = getDeterministicRecommendation(req.body);
    return res.json({ 
      recommendations: fallbackRecommendations,
      recommendation_source: "fallback"
    });
  }
});

// API: Start Project Package Upgrade Options (Strategic Pricing Consultant Engine)
app.post("/api/start-project/package-upgrade-options", requestTimeout(45000, "AI Upgrade Options"), validateBody(packageUpgradeSchema), async (req: any, res) => {
  try {
    const { packageId, businessName, ownerName, industry, goal, aiPrompt } = req.body;
    
    checkAbort(req);

    const cleanBusinessName = String(businessName || "").trim().toLowerCase();
    const cleanPrompt = String(aiPrompt || "").trim().toLowerCase();
    const cleanIndustry = String(industry || "").trim().toLowerCase();
    const cleanGoal = String(goal || "").trim().toLowerCase();
    const recCacheKey = `recommendations:${String(packageId)}:${cleanBusinessName}:${cleanIndustry}:${cleanGoal}:${cleanPrompt}`;

    const cachedRec = await cache.get(recCacheKey);
    if (cachedRec) {
      logger.info(`[PERF] Recommendations cache hit! Key: ${recCacheKey}`);
      if (res.headersSent || req.timedOut) return;
      return res.json(JSON.parse(cachedRec));
    }

    const PLUS_PREDEFINED_PRICES: Record<string, string[]> = {
      foundation: ["₹10,450", "₹11,250", "₹11,999", "₹12,250", "₹13,500"],
      growth: ["₹20,250", "₹20,999", "₹21,500", "₹22,250", "₹22,900"],
      dominance: ["₹41,500", "₹43,250", "₹44,999", "₹46,800", "₹48,250"]
    };

    // Base package defaults
    let baseName = "✦ Fusion";
    let basePrice = "₹19,999";
    const pkgKey = packageId === "foundation" ? "foundation" : packageId === "dominance" ? "dominance" : "growth";
    const allowedPrices = PLUS_PREDEFINED_PRICES[pkgKey];
    const upgrade1Price = allowedPrices[Math.floor(Math.random() * allowedPrices.length)];

    if (packageId === "foundation") {
      baseName = "⚡ Ignite";
      basePrice = "₹9,999";
    } else if (packageId === "dominance") {
      baseName = "⬢ Catalyst";
      basePrice = "₹39,999";
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to deterministic upgrade recommendations.");
      
      if (res.headersSent || req.timedOut) return;

      const fallbackResult = {
        summary: getFallbackSummary(packageId, businessName, industry, goal, aiPrompt),
        options: getFallbackUpgrades(packageId, businessName, ownerName, industry, goal)
      };
      await cache.set(recCacheKey, JSON.stringify(fallbackResult), 300);
      return res.json(fallbackResult);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `You are a friendly, local business growth consultant at CodeFuser speaking directly to a local business owner.
Your client is the owner of "${businessName}" (Industry: "${industry || 'General'}", Goal: "${goal || 'Growth'}").

User Prompt Notes: "${aiPrompt || 'None'}"
Currently Selected Base Package: ${baseName} (${basePrice})

BUSINESS CONSULTANT RULES & LANGUAGE DIRECTIVES:
1. Speak strictly like a local business consultant talking to a local business owner (restaurant, salon, gym, clinic, photo studio, shop owner).
2. TECHNICAL JARGON IS STRICTLY FORBIDDEN! NEVER output developer terms like: Lightbox, Image Optimization, Proofing, Lazy Loading, Responsive, Schema, Metadata, SEO Optimization, API, Dashboard Widgets, Analytics Module, Customer Portal, Razorpay Integration.
   - Replace with plain everyday business terms: Photo Gallery, Wedding Albums, Full Screen Photo Viewer, Fast Loading Photos, WhatsApp Chat, Contact Form, Client Login, Online Booking, Online Payments, Google Business Listing.

CARD 1 (LEFT - Base Package: "${baseName}" at "${basePrice}"):
- id: "current"
- name: "${baseName}"
- price: "${basePrice}"
- headline: "Simple website setup."
- benefits: Array of EXACTLY 4 features from the 6 recommended business features (specifically features 1, 2, 5, and 6 of the 6 recommended features, formatted with '✓ ' prefix). IMPORTANT: Keep each feature EXTREMELY SHORT (2 to 3 words max!). Use super easy English!
- rationale: "3 to 4 simple words explaining why this package is good. e.g. 'Easy to start.' Do NOT prefix with 'Package Focus:'."

CARD 2 (RIGHT - Recommendation Pack):
- id: "upgrade_1"
- price: MUST BE EXACTLY "${upgrade1Price}".
- name: "${baseName} + [Micro Solution Pack Name]" (e.g. "${baseName} + Online Ordering Pack", "${baseName} + Smart Booking Pack", "${baseName} + Patient Booking Pack", "${baseName} + Membership Growth Pack")
- headline: 2 to 3 simple words max (e.g. "Easy online booking.").
- benefits: Array of ALWAYS EXACTLY TWO features (specifically the 3rd and 4th features from the 6 recommended business features):
  - Item 0 MUST be the 3rd feature from recommendations (marked with ⭐, e.g. "⭐ Photo Gallery")
  - Item 1 MUST be the 4th feature from recommendations (marked with ✓, e.g. "✓ Online Payments")
  - STRICT RULE: Card 2 MUST contain ALWAYS EXACTLY 2 features! The other 4 features belong in Card 1. IMPORTANT: Keep each feature title EXTREMELY SHORT (2 to 3 words max!).
- rationale: "3 to 4 simple words explaining why this upgrade is useful. e.g. 'Book and pay online.' Do NOT prefix with 'Why We Recommend This:'."`;

    checkAbort(req);

    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate the strategic package cards and AI consultation report as requested.",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.OBJECT,
                properties: {
                  aboutYourBusiness: { type: Type.STRING },
                  biggestOpportunity: { type: Type.STRING },
                  ourRecommendation: {
                    type: Type.OBJECT,
                    properties: {
                      recommendedPackage: { type: Type.STRING },
                      recommendedFeatures: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      advice: { type: Type.STRING }
                    },
                    required: ["recommendedPackage", "recommendedFeatures", "advice"]
                  },
                  yourPackageEvaluation: {
                    type: Type.OBJECT,
                    properties: {
                      status: { type: Type.STRING },
                      evaluationText: { type: Type.STRING }
                    },
                    required: ["status", "evaluationText"]
                  },
                  optionalRecommendations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  businessCategory: { type: Type.STRING },
                  specificBusinessType: { type: Type.STRING },
                  primaryBusinessGoal: { type: Type.STRING },
                  customerVision: { type: Type.STRING },
                  recommendedStartingPackage: { type: Type.STRING },
                  recommendationReason: { type: Type.STRING }
                },
                required: [
                  "aboutYourBusiness",
                  "biggestOpportunity",
                  "ourRecommendation",
                  "yourPackageEvaluation",
                  "businessCategory",
                  "specificBusinessType",
                  "primaryBusinessGoal",
                  "customerVision",
                  "recommendedStartingPackage",
                  "recommendationReason"
                ]
              },
              options: {
                type: Type.ARRAY,
                description: "Must contain card options: baseline card and upgrade solution pack card",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    packTitle: { type: Type.STRING },
                    price: { type: Type.STRING },
                    headline: { type: Type.STRING },
                    problemSolved: { type: Type.STRING },
                    benefits: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    expectedResults: { type: Type.STRING },
                    priceJustification: { type: Type.STRING },
                    rationale: { type: Type.STRING }
                  },
                  required: ["id", "name", "price", "headline", "benefits", "rationale"]
                }
              }
            },
            required: ["options", "summary"]
          }
        }
      });
    }, {
      reqId: req.reqId || "N/A",
      operationName: "Gemini generateContent (gemini-2.5-flash)",
      isIdempotent: true
    });

    checkAbort(req);

    if (response && response.text) {
      const data = JSON.parse(response.text);
      if (data.options && data.options.length === 2 && data.summary) {
        
        if (res.headersSent || req.timedOut) return;

        // Ensure options features are strictly split: Card 1 gets 4 features, Card 2 gets ALWAYS 2 features (3rd and 4th)
        data.options = splitFeaturesForCards(data.options, data.summary?.ourRecommendation?.recommendedFeatures);

        // CRITICAL ARCHITECTURE RULE: Application calculates scores deterministically, NOT the AI
        data.scores = calculateDeterministicScores({
          industry,
          city: "Chennai",
          selectedPackage: baseName,
          promptNotes: aiPrompt
        });

        await cache.set(recCacheKey, JSON.stringify(data), 300);
        return res.json(data);
      }
    }
    
    throw new Error("Invalid response format from content generation");

  } catch (err: any) {
    if (res.headersSent || req.timedOut || req.clientDisconnected) return;
    console.error("Failed to generate package upgrade recommendations:", err);
    // Fallback response:
    const { packageId, businessName, ownerName, industry, goal, aiPrompt } = req.body;
    
    const cleanBusinessName = String(businessName || "").trim().toLowerCase();
    const cleanPrompt = String(aiPrompt || "").trim().toLowerCase();
    const cleanIndustry = String(industry || "").trim().toLowerCase();
    const cleanGoal = String(goal || "").trim().toLowerCase();
    const recCacheKey = `recommendations:${String(packageId)}:${cleanBusinessName}:${cleanIndustry}:${cleanGoal}:${cleanPrompt}`;

    const fallbackResult = {
      summary: getFallbackSummary(packageId, businessName, industry, goal, aiPrompt),
      options: getFallbackUpgrades(packageId, businessName, ownerName, industry, goal),
      scores: calculateDeterministicScores({
        industry,
        city: "Chennai",
        selectedPackage: packageId === "foundation" ? "Ignite" : packageId === "dominance" ? "Catalyst" : "Fusion",
        promptNotes: aiPrompt
      })
    };
    await cache.set(recCacheKey, JSON.stringify(fallbackResult), 300);
    return res.json(fallbackResult);
  }
});

function getFallbackSummary(
  packageId: string,
  businessName: string,
  industry: string,
  goal: string,
  aiPrompt: string
) {
  const bName = businessName || "Your Business";
  const normalized = (industry || "").toLowerCase() + " " + (businessName || "").toLowerCase() + " " + (aiPrompt || "").toLowerCase();
  const promptLower = (aiPrompt || "").toLowerCase();

  // Plan escalation check (>2 complex features requested)
  const complexKeywords = ["crm", "chatbot", "payment", "portal", "dashboard", "multi-language", "analytics", "api"];
  const complexCount = complexKeywords.filter(kw => promptLower.includes(kw)).length;

  let currentPkgName = "Fusion";
  if (packageId === "foundation") currentPkgName = "Ignite";
  if (packageId === "dominance") currentPkgName = "Catalyst";

  let recPkgName = currentPkgName;
  let status = "perfect";
  let evalText = `${currentPkgName} is a great fit for your business goals.`;

  if (complexCount > 2 && packageId === "foundation") {
    recPkgName = "Fusion";
    status = "upgrade_recommended";
    evalText = "Because your project requires multiple complex integrations, Fusion is the recommended starting foundation.";
  }

  // Custom requirement check
  const customKeywords = ["virtual tour", "ai assistant", "custom workflow", "special integration", "3d", "vr"];
  const isCustomDetected = customKeywords.some(kw => promptLower.includes(kw));

  let specificType = "Local Business";
  let businessCat = "General Business";
  let opportunity = `Helping local customers discover ${bName} and convert into paying clients effortlessly.`;
  let recFeatures = [
    "Services Showcase",
    "Customer Reviews",
    "Contact Form",
    "Google Location Map",
    "WhatsApp Direct Inquiry",
    "Pricing Packages"
  ];
  let advice = `These features make it effortless for local customers to discover ${bName}, explore your services, and contact you directly.`;
  let optionalRecommendations = [
    `Set up a Google Business Profile to show up in local searches for ${bName}.`,
    "Actively ask satisfied customers for digital reviews to build local trust.",
    "Share special offers and customer testimonials on WhatsApp & social media."
  ];

  if (normalized.includes("dental") || normalized.includes("clinic") || normalized.includes("doctor") || normalized.includes("medical") || normalized.includes("hospital") || normalized.includes("health")) {
    specificType = "Dental / Medical Clinic";
    businessCat = "Health & Wellness";
    opportunity = "Building immediate patient trust and making appointment bookings effortless.";
    recFeatures = [
      "Doctor Profiles",
      "Online Booking",
      "Treatments We Offer",
      "Patient Reviews",
      "Clinic Location",
      "Emergency Call"
    ];
    advice = "These features help patients learn about your treatments and book appointments online.";
    optionalRecommendations = [
      "Allow patients to book appointments online.",
      "Show patient reviews to build trust.",
      "Make it easy for patients to find your clinic location."
    ];
  } else if (normalized.includes("food") || normalized.includes("restaurant") || normalized.includes("cafe") || normalized.includes("bakery") || normalized.includes("dining")) {
    specificType = "Restaurant / Cafe";
    businessCat = "Food & Beverage";
    opportunity = "Displaying your digital menu and table reservations so local diners can reach you instantly.";
    recFeatures = [
      "Digital Menu",
      "Table Reservation",
      "Online Orders",
      "Customer Reviews",
      "Daily Specials",
      "Location & Hours"
    ];
    advice = "These features help local diners explore your digital menu and reserve a table quickly.";
    optionalRecommendations = [
      "Let customers see your menu before visiting.",
      "Allow table reservations online.",
      "Make weekend offers easy to share on WhatsApp."
    ];
  } else if (normalized.includes("gym") || normalized.includes("fitness") || normalized.includes("yoga") || normalized.includes("crossfit") || normalized.includes("workout")) {
    specificType = "Gym / Fitness Studio";
    businessCat = "Sports & Fitness";
    opportunity = "Helping members view class schedules, check trainer expertise, and join instantly.";
    recFeatures = [
      "Membership Plans",
      "Trainer Profiles",
      "Class Schedule",
      "Transformation Photos",
      "Free Trial Pass",
      "Member Reviews"
    ];
    advice = "These features help fitness enthusiasts check class schedules, see trainer profiles, and claim trial passes.";
    optionalRecommendations = [
      "Allow members to check class schedules easily.",
      "Offer a free trial pass to attract new members.",
      "Show trainer profiles and member transformation stories."
    ];
  } else if (normalized.includes("photo") || normalized.includes("studio") || normalized.includes("photography") || normalized.includes("designer")) {
    specificType = "Photo Studio";
    businessCat = "Photography & Creative";
    opportunity = "Showcasing your photo portfolio and letting clients book sessions effortlessly.";
    recFeatures = [
      "Portfolio Gallery",
      "Download Your Photos",
      "Price Packages",
      "Booking Form",
      "Customer Reviews",
      "Instagram Videos"
    ];
    advice = "These features help showcase your photography work and make it easy for customers to book a photoshoot.";
    optionalRecommendations = [
      "Make your best work easy to showcase.",
      "Allow customers to enquire in one click.",
      "Display your photography packages clearly."
    ];
  } else if (normalized.includes("salon") || normalized.includes("spa") || normalized.includes("beauty") || normalized.includes("parlour") || normalized.includes("hair")) {
    specificType = "Salon / Spa";
    businessCat = "Beauty & Personal Care";
    opportunity = "Showcasing your style gallery and letting clients book appointments easily.";
    recFeatures = [
      "Price List & Services",
      "WhatsApp Booking",
      "Stylist Profiles",
      "Before & After Photos",
      "Client Reviews",
      "Special Packages"
    ];
    advice = "These features help clients explore your beauty treatments, see past results, and book appointments instantly.";
    optionalRecommendations = [
      "Allow clients to book appointments via WhatsApp easily.",
      "Show before-and-after style photos to build confidence.",
      "Display clear treatment pricing packages."
    ];
  } else if (normalized.includes("real estate") || normalized.includes("property") || normalized.includes("builder") || normalized.includes("realty")) {
    specificType = "Real Estate Agency";
    businessCat = "Real Estate";
    opportunity = "Helping property seekers explore featured listings and schedule site visits.";
    recFeatures = [
      "Property Listings",
      "Video Tours",
      "Agent Profiles",
      "Schedule Site Visit",
      "EMI Calculator",
      "Client Reviews"
    ];
    advice = "These features help home buyers explore listings, take video tours, and schedule site visits effortlessly.";
    optionalRecommendations = [
      "Allow buyers to request site visits in one click.",
      "Show featured property photos and video tours.",
      "Provide an easy EMI calculator for buyers."
    ];
  } else if (normalized.includes("coaching") || normalized.includes("education") || normalized.includes("school") || normalized.includes("academy") || normalized.includes("tuition") || normalized.includes("course")) {
    specificType = "Coaching / Academy";
    businessCat = "Education & Learning";
    opportunity = "Building academic credibility and driving free demo class enrollments.";
    recFeatures = [
      "Course Catalog",
      "Teacher Profiles",
      "Free Demo Class",
      "Student Results",
      "Fee Structure",
      "Contact Form"
    ];
    advice = "These features help prospective students explore your courses, build trust, and sign up for demo classes easily.";
    optionalRecommendations = [
      "Allow students and parents to sign up for free demo classes.",
      "Display student exam results and testimonials.",
      "Provide clear course details and fee structures."
    ];
  }

  if (isCustomDetected) {
    advice += " Custom Requirement Detected: Our team will review this to suggest the best tailored solution.";
  }

  return {
    aboutYourBusiness: `${bName} is a ${specificType.toLowerCase()} looking to expand local reach and make client inquiries effortless.`,
    biggestOpportunity: opportunity,
    ourRecommendation: {
      recommendedPackage: recPkgName,
      recommendedFeatures: recFeatures,
      advice
    },
    yourPackageEvaluation: {
      status,
      evaluationText: evalText
    },
    optionalRecommendations,
    businessCategory: businessCat,
    specificBusinessType: specificType,
    primaryBusinessGoal: goal || "Helping your business build trust and gain new customers.",
    customerVision: aiPrompt || "Create a clean, welcoming online presence for your business.",
    recommendedStartingPackage: recPkgName,
    recommendationReason: `${recPkgName} fits your current business stage perfectly.`
  };
}

function getFallbackUpgrades(
  packageId: string,
  businessName: string = "Your Business",
  ownerName: string = "",
  industry: string = "",
  goal: string = ""
) {
  const bName = businessName || "Your Business";
  const ind = (industry || "").toLowerCase();

  const PLUS_PREDEFINED_PRICES: Record<string, string[]> = {
    foundation: ["₹10,450", "₹11,250", "₹11,999", "₹12,250", "₹13,500"],
    growth: ["₹20,250", "₹20,999", "₹21,500", "₹22,250", "₹22,900"],
    dominance: ["₹41,500", "₹43,250", "₹44,999", "₹46,800", "₹48,250"]
  };

  let baseName = "✦ Fusion";
  let basePrice = "₹19,999";
  const pkgKey = packageId === "foundation" ? "foundation" : packageId === "dominance" ? "dominance" : "growth";
  const allowedPrices = PLUS_PREDEFINED_PRICES[pkgKey];
  const upgradePrice = allowedPrices[Math.floor(Math.random() * allowedPrices.length)];

  if (packageId === "foundation") {
    baseName = "⚡ Ignite";
    basePrice = "₹9,999";
  } else if (packageId === "dominance") {
    baseName = "⬢ Catalyst";
    basePrice = "₹39,999";
  }

  // Base card configuration
  const baseCard = {
    id: "current",
    name: baseName,
    price: basePrice,
    headline: `Simple website setup.`,
    benefits: [
      "✓ Photo Gallery",
      "✓ WhatsApp Chat",
      "✓ Client Reviews",
      "✓ Google Listing"
    ],
    rationale: `Easy to start.`
  };

  // Determine Micro Solution Pack based on industry category (EXACTLY 6 SPECIAL BUSINESS FEATURES EACH)
  let packTitle = "Client Growth Pack";
  let headline = `Easy online booking.`;
  let benefits = [
    "⭐ Online Booking",
    "✓ WhatsApp Chat",
    "✓ Client Reviews",
    "✓ Price List",
    "✓ Special Offers",
    "✓ Client Portal"
  ];
  let rationale = `Book and pay online.`;

  if (ind.includes("photo") || ind.includes("studio") || ind.includes("photography") || ind.includes("designer")) {
    packTitle = "Premium Booking Pack";
    headline = `Photoshoot booking and gallery.`;
    benefits = [
      "⭐ Wedding Gallery",
      "✓ Event Gallery",
      "✓ Online Booking",
      "✓ Package Pricing",
      "✓ Client Reviews",
      "✓ Photo Downloads"
    ];
    rationale = `Easy photoshoot booking.`;
  } else if (ind.includes("food") || ind.includes("restaurant") || ind.includes("cafe") || ind.includes("bakery") || ind.includes("dining")) {
    packTitle = "Online Ordering Pack";
    headline = `Menu ordering and tables.`;
    benefits = [
      "⭐ Online Ordering",
      "✓ Table Booking",
      "✓ Digital Menu",
      "✓ WhatsApp Orders",
      "✓ Client Reviews",
      "✓ Loyalty Rewards"
    ];
    rationale = `Order menu and tables.`;
  } else if (ind.includes("medical") || ind.includes("clinic") || ind.includes("doctor") || ind.includes("dental") || ind.includes("hospital") || ind.includes("health")) {
    packTitle = "Patient Booking Pack";
    headline = `Doctor appointment booking.`;
    benefits = [
      "⭐ Doctor Booking",
      "✓ Doctor Profiles",
      "✓ Patient Reviews",
      "✓ Treatment List",
      "✓ WhatsApp Reminders",
      "✓ Health Packages"
    ];
    rationale = `Book doctor appointments easily.`;
  } else if (ind.includes("gym") || ind.includes("fitness") || ind.includes("yoga") || ind.includes("crossfit") || ind.includes("workout")) {
    packTitle = "Membership Growth Pack";
    headline = `Trial pass and classes.`;
    benefits = [
      "⭐ Free Trial Pass",
      "✓ Gym Plans",
      "✓ Trainer Profiles",
      "✓ Class Timetable",
      "✓ Progress Tracker",
      "✓ Workout Plans"
    ];
    rationale = `Get new gym members.`;
  } else if (ind.includes("salon") || ind.includes("spa") || ind.includes("beauty") || ind.includes("parlour") || ind.includes("hair")) {
    packTitle = "Smart Booking Pack";
    headline = `Salon booking and prices.`;
    benefits = [
      "⭐ Online Booking",
      "✓ Style Gallery",
      "✓ WhatsApp Booking",
      "✓ Price List",
      "✓ Gift Cards",
      "✓ Member Perks"
    ];
    rationale = `Book salon treatments fast.`;
  } else if (ind.includes("estate") || ind.includes("real") || ind.includes("property") || ind.includes("realty") || ind.includes("builder")) {
    packTitle = "Site Visit Pack";
    headline = `Property lists and visits.`;
    benefits = [
      "⭐ Property List",
      "✓ Property Search",
      "✓ Visit Booking",
      "✓ Loan Calculator",
      "✓ WhatsApp Chat",
      "✓ Virtual Tours"
    ];
    rationale = `View properties and visits.`;
  } else if (ind.includes("coaching") || ind.includes("education") || ind.includes("school") || ind.includes("academy") || ind.includes("tuition") || ind.includes("course")) {
    packTitle = "Student Enrollment Pack";
    headline = `Demo classes and courses.`;
    benefits = [
      "⭐ Course List",
      "✓ Demo Class Booking",
      "✓ Student Reviews",
      "✓ Class Timings",
      "✓ Download Brochure",
      "✓ Online Admission"
    ];
    rationale = `Book demo classes online.`;
  }

  const upgradeCard = {
    id: "upgrade_1",
    name: `${baseName} + ${packTitle}`,
    price: upgradePrice,
    headline,
    benefits,
    rationale
  };

  return splitFeaturesForCards([baseCard, upgradeCard], benefits);
}

function splitFeaturesForCards(cards: any[], recommendedFeatures?: string[]): any[] {
  if (!cards || !Array.isArray(cards) || cards.length < 2) return cards;

  const baseCardIndex = cards.findIndex((c: any) => c.id === 'current');
  const upgradeCardIndex = cards.findIndex((c: any) => c.id !== 'current');

  if (baseCardIndex === -1 || upgradeCardIndex === -1) return cards;

  const baseCard = cards[baseCardIndex];
  const upgradeCard = cards[upgradeCardIndex];

  let sixFeatures: string[] = [];

  if (recommendedFeatures && Array.isArray(recommendedFeatures) && recommendedFeatures.length >= 6) {
    sixFeatures = recommendedFeatures.slice(0, 6);
  } else if (upgradeCard.benefits && Array.isArray(upgradeCard.benefits) && upgradeCard.benefits.length >= 6) {
    sixFeatures = upgradeCard.benefits.slice(0, 6);
  } else {
    const combined = [...(upgradeCard.benefits || []), ...(baseCard.benefits || [])];
    const cleaned = combined
      .map(f => String(f).replace(/^[⭐✓✔]\s*/, '').trim())
      .filter(f => !["Mobile Friendly Design", "Contact Form", "Google Maps Location", "Business Info & Hours"].some(b => f.toLowerCase().includes(b.toLowerCase())));
    const unique = Array.from(new Set(cleaned));
    if (unique.length >= 6) {
      sixFeatures = unique.slice(0, 6);
    }
  }

  if (sixFeatures.length < 6) {
    return cards;
  }

  const cleanedSix = sixFeatures.map(f => String(f).replace(/^[⭐✓✔]\s*/, '').trim());

  // 1st, 2nd, 5th, 6th features -> Base Card (indices 0, 1, 4, 5)
  const baseBenefits = [
    `✓ ${cleanedSix[0]}`,
    `✓ ${cleanedSix[1]}`,
    `✓ ${cleanedSix[4]}`,
    `✓ ${cleanedSix[5]}`
  ];

  // 3rd and 4th features -> Upgrade Card (indices 2, 3)
  const upgradeBenefits = [
    `⭐ ${cleanedSix[2]}`,
    `✓ ${cleanedSix[3]}`
  ];

  const newCards = [...cards];
  newCards[baseCardIndex] = {
    ...baseCard,
    benefits: baseBenefits
  };
  newCards[upgradeCardIndex] = {
    ...upgradeCard,
    benefits: upgradeBenefits
  };

  return newCards;
}

function getDynamicIndustryBenefits(industry: string, level: 'base' | 'upgrade_1'): string[] {
  const ind = (industry || "").toLowerCase();
  
  if (ind.includes("food") || ind.includes("restaurant") || ind.includes("cafe")) {
    return [
      "✓ Digital Menu",
      "✓ Google Reviews",
      "✓ Customer Reviews",
      "✓ Services Section"
    ];
  }

  if (ind.includes("medical") || ind.includes("clinic") || ind.includes("dental") || ind.includes("doctor") || ind.includes("wellness")) {
    return [
      "✓ Doctor Profiles",
      "✓ Services Section",
      "✓ Customer Reviews",
      "✓ Google Reviews"
    ];
  }

  if (ind.includes("photo") || ind.includes("studio") || ind.includes("media") || ind.includes("design")) {
    return [
      "✓ Portfolio Gallery",
      "✓ Customer Gallery",
      "✓ Customer Reviews",
      "✓ Google Reviews"
    ];
  }

  if (ind.includes("gym") || ind.includes("fitness") || ind.includes("sports")) {
    return [
      "✓ Services Section",
      "✓ Customer Reviews",
      "✓ Trainer Profiles",
      "✓ Google Reviews"
    ];
  }

  if (ind.includes("salon") || ind.includes("spa") || ind.includes("beauty")) {
    return [
      "✓ Price Packages",
      "✓ Services Section",
      "✓ Customer Reviews",
      "✓ Google Reviews"
    ];
  }

  // DEFAULT / GENERAL SERVICES
  return [
    "✓ Services Section",
    "✓ Customer Reviews",
    "✓ Contact Form",
    "✓ Portfolio Gallery"
  ];
}


// Resolute dynamic fallback rule so the user is never blocked or shown an error
function getDeterministicRecommendation(formData: any) {
  const businessName = formData.businessName || 'Your Business';
  const painPoint = formData.businessPainPoint || 'lack of online inquiries';
  const targetAudience = formData.targetAudience || 'local prospective clients';
  
  const needsBooking = !!formData.needsBooking;
  const needsFeatures = !!(formData.needsReviews || formData.needsProducts || formData.needsPortfolioGrid);

  let bestMatchId = 'growth';
  let bestMatchName = '✦ Fusion';
  let bestMatchPrice = '₹19,999';
  let bestMatchTagline = `Engineered to capture and schedule ${targetAudience} effortlessly.`;
  
  if (needsBooking) {
    bestMatchId = 'growth';
    bestMatchName = '✦ Fusion';
    bestMatchPrice = '₹19,999';
    bestMatchTagline = 'Automates live booking channels to immediately bypass your scheduling roadblocks.';
  } else if (!needsBooking && !needsFeatures) {
    bestMatchId = 'foundation';
    bestMatchName = '⚡ Ignite';
    bestMatchPrice = '₹9,999';
    bestMatchTagline = 'High-velocity showcase to validate your visual identity with minimal latency.';
  } else {
    bestMatchId = 'dominance';
    bestMatchName = '⬢ Catalyst';
    bestMatchPrice = '₹39,999';
    bestMatchTagline = 'Maximal digital expansion featuring automated capture workflows and review synchronization.';
  }

  return [
    {
      planId: bestMatchId,
      planName: bestMatchName,
      tag: "⭐ Best Match For Your Business",
      tagline: bestMatchTagline,
      price: bestMatchPrice,
      bullets: [
        `Specially optimized to override: "${painPoint}" by implementing modern high-efficiency layout patterns.`,
        `Positions your unique advantage to build strong visual authority among ${targetAudience}.`,
        "Pre-configures required integrations (calendars/forms) directly into a gorgeous, smooth client funnel."
      ]
    },
    {
      planId: "foundation",
      planName: "⚡ Ignite",
      tag: "💰 Best Value",
      tagline: "Unlocks high-impact conversion metrics with lightweight overhead.",
      price: "₹9,999",
      bullets: [
        "Provides an elegant single-page presentation optimized specifically for mobile responsiveness.",
        "Perfect entry point for capturing new digital leads without secondary maintenance overhead.",
        "Equipped with instant contact hooks including WhatsApp click-to-connect."
      ]
    },
    {
      planId: "dominance",
      planName: "⬢ Catalyst",
      tag: "📈 Built For Growth",
      tagline: "Total digital empowerment utilizing advanced visual layouts and automated captures.",
      price: "₹39,999",
      bullets: [
        "Integrates continuous automation channels like AI assistants, review feeds, and CRM triggers.",
        "Designed explicitly to support infinite expansion as you scale your brand presence.",
        "Includes absolute layout flexibility and prioritized diagnostic support cycles."
      ]
    }
  ];
}

// ==========================================
// FOUNDER ARCHITECTURE ENGINE ENDPOINTS
// ==========================================

// 1. Deterministic Scoring API (AI provides signals, App calculates scores)
app.post("/api/scoring/calculate", (req: any, res: any) => {
  try {
    const { industry, city, selectedPackage, hasDomain, hasLogo, contentReady, promptNotes, textContent } = req.body;
    
    // Safety check
    const safetyResult = enforceContentSafety(textContent || promptNotes || "");
    
    // Uniqueness check
    const uniquenessResult = checkUniqueness(textContent || promptNotes || "");

    // Calculate deterministic scores
    const scores = calculateDeterministicScores({
      industry,
      city: city || "Chennai",
      selectedPackage: selectedPackage || "Ignite",
      hasDomain,
      hasLogo,
      contentReady,
      promptNotes
    });

    return res.json({
      success: true,
      scores,
      safety: safetyResult,
      uniqueness: uniquenessResult,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    logger.error("Scoring calculation error", err);
    return res.status(500).json({ success: false, error: "Failed to calculate deterministic scores." });
  }
});

// 2. Google Search Console Market Intelligence API ("Where is CodeFuser invisible today?")
app.get("/api/gsc/opportunities", (req: any, res: any) => {
  try {
    const { industry, city } = req.query;
    const opps = getGSCOpportunities(String(industry || ""), String(city || "Chennai"));
    const marketInsight = getGSCMarketInsight(String(industry || ""), String(city || "Chennai"));

    return res.json({
      success: true,
      city: city || "Chennai",
      region: "Tamil Nadu, India",
      marketInsight,
      opportunities: opps
    });
  } catch (err: any) {
    logger.error("GSC Opportunities API error", err);
    return res.status(500).json({ success: false, error: "Failed to fetch GSC market opportunities." });
  }
});

// 3. Founder Training System API (Records founder approvals/rejections to train preference weights)
app.post("/api/founder/actions", requireAuth, requireRole(["super_admin", "admin"]), (req: any, res: any) => {
  try {
    const { type, industry, city, packageType, notes } = req.body;
    if (!type || !["approved", "rejected", "regenerated", "published"].includes(type)) {
      return res.status(400).json({ success: false, error: "Invalid action type." });
    }

    const record = recordFounderAction({
      type,
      industry: industry || "General Business",
      city: city || "Chennai",
      packageType: packageType || "Ignite",
      notes
    });

    const updatedProfile = getFounderProfile();

    return res.json({
      success: true,
      recordedAction: record,
      founderProfile: updatedProfile
    });
  } catch (err: any) {
    logger.error("Founder action record error", err);
    return res.status(500).json({ success: false, error: "Failed to record founder action." });
  }
});

// 4. Founder Preference Profile API
app.get("/api/founder/profile", requireAuth, requireRole(["super_admin", "admin"]), (req: any, res: any) => {
  try {
    const profile = getFounderProfile();
    return res.json({ success: true, profile });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to get founder profile." });
  }
});

// 5. Content Uniqueness Verification API
app.post("/api/content/uniqueness-check", (req: any, res: any) => {
  try {
    const { text, id, register } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: "Text content is required." });
    }

    const result = checkUniqueness(text);

    if (register && id && result.isUnique) {
      registerContent(id, text);
    }

    return res.json({
      success: true,
      uniqueness: result
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Uniqueness check failed." });
  }
});

// Global Error Handling Middleware (must be registered after all route handlers)
app.use((err: any, req: any, res: any, next: any) => {
  const reqId = req.reqId || "N/A";
  const statusCode = err.status || err.statusCode || 500;
  
  logger.error(`Unhandled error during request processing: ${err.message || err}`, err, {
    reqId,
    method: req.method,
    url: req.url,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "An internal server error occurred." 
      : err.message || "Internal Server Error",
    reqId,
  });
});

// Process-level exception and rejection handlers
process.on("uncaughtException", (error) => {
  logger.error("SYSTEM CRITICAL: Uncaught Exception detected", error);
  // Graceful shutdown delay to allow logs to flush
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on("unhandledRejection", (reason: any) => {
  logger.error("SYSTEM CRITICAL: Unhandled Promise Rejection detected", reason instanceof Error ? reason : new Error(String(reason)));
});

// Server bootstrap with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    logRuntimeEnv();
    initializeAutomationScheduler();
  });
}

if (!process.env.VERCEL && !process.env.TESTING) {
  startServer();
}

export default app;
