import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import compression from "compression";
import { addProject, getProjects, updateProject, getProjectById, logAuditEvent, getUserProfile, createUserProfile, updateUserProfileRole, getAllUserProfiles, ProjectRecord, normalizeOwnershipChoice } from "./server/db.js";
import { getSupabase, logRuntimeEnv } from "./server/supabase.js";
import { getExtraData, updateQuote, addAssetFile } from "./server/extra_store.js";
import { verifyPaymentSignature, verifyWebhookSignature, getRazorpayInstance } from "./server/razorpay.js";
import { sendEmailAsync, getProjectCreatedTemplate, getPaymentSuccessTemplate, getPortalActivatedTemplate, getDeliverablesReadyTemplate } from "./server/email.js";
import { withRetry } from "./server/retry.js";
import {
  triggerStatusChangeAutomation,
  triggerAdminNotification,
  initializeAutomationScheduler,
  runPeriodicAutomationScan
} from "./server/automation.js";
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

    if (!allowedRoles.includes(user.role)) {
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

// API: Validate Step 1 uniqueness
app.post("/api/projects/validate-step1", projectsRateLimiter, async (req: any, res) => {
  try {
    const { email, whatsapp, userId } = req.body;
    
    // Check validation cache to prevent repeated database lookup overhead
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedWhatsapp = String(whatsapp || "").trim().replace(/\s+/g, "");
    const cacheKey = `validate:step1:${normalizedEmail}:${normalizedWhatsapp}:${String(userId || "")}`;
    
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
        .select("id, business_name, client_name, email, whatsapp, selected_package, status")
        .eq("user_id", userId);

      if (userMatch && userMatch.length > 0) {
        const result = {
          duplicate: false,
          hasMatch: true,
          noticeType: "registered_client",
          message: "Welcome back! You have active project(s) in your CodeFuser account.",
          existingCount: userMatch.length,
          draftProject: userMatch[userMatch.length - 1] ? {
            id: userMatch[userMatch.length - 1].id,
            businessName: userMatch[userMatch.length - 1].business_name,
            clientName: userMatch[userMatch.length - 1].client_name,
            email: userMatch[userMatch.length - 1].email,
            whatsapp: userMatch[userMatch.length - 1].whatsapp,
            selectedPackage: userMatch[userMatch.length - 1].selected_package,
            createdAt: userMatch[userMatch.length - 1].created_at || new Date().toISOString()
          } : null
        };
        await cache.set(cacheKey, JSON.stringify(result), 30);
        return res.json(result);
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

    let existingProject: any = null;

    // 1. Check by explicit projectId
    if (projectId) {
      existingProject = await getProjectById(projectId);
    }

    // 2. If no project found by id, search by targetUserId or email/whatsapp
    if (!existingProject && targetUserId) {
      const { data: userProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });
      if (userProjects && userProjects.length > 0) {
        existingProject = userProjects[0];
      }
    }

    if (!existingProject && cleanEmail) {
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

    const queryUserId = authUser?.id || req.query.userId || "";
    const queryEmail = String(req.query.email || authUser?.email || "").trim().toLowerCase();
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

    checkAbort(req);

    console.log("Compiling and initializing project in CodeFuser Core architecture style...");
    const savedProject = await addProject(payload, req.reqId);

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
  try {
    const { userId, email } = req.query;
    checkAbort(req);
    
    if (req.isAdmin) {
      // Admins can query all projects, or filter by a specific user/email directly in the database
      const filter = (userId || email) ? { userId: userId ? String(userId) : undefined, email: email ? String(email) : undefined } : undefined;
      const projects = await getProjects(req.reqId, filter);
      
      if (res.headersSent || req.timedOut) return;
      return res.json({ projects });
    }
    
    // Regular authenticated user: can ONLY retrieve projects linked to their authenticated session.
    // Query matching rows directly from Postgres/Supabase for security and high performance.
    const projects = await getProjects(req.reqId, {
      userId: req.user.id,
      email: req.user.email
    });
    
    if (res.headersSent || req.timedOut) return;
    return res.json({ projects });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Failed to load project database items:", error);
    return res.status(500).json({ error: error.message || String(error) });
  }
});

// API: Customer Registration (SignUp Proxy)
app.post("/api/auth/signup", requestTimeout(10000, "Auth Signup"), validateBody(authSchema), async (req: any, res) => {
  try {
    const { email, password, fullName, businessName } = req.body;
    checkAbort(req);
    const supabase = getSupabase();
    
    // Create authentication record in Supabase
    let { data, error } = await supabase.auth.signUp({ email, password });
    
    if (res.headersSent || req.timedOut) return;

    // Handle case where user was already created in Supabase Auth on previous attempt
    if (error && (error.message?.includes("already registered") || error.message?.includes("already exists") || (error as any).status === 400)) {
      const loginRes = await supabase.auth.signInWithPassword({ email, password });
      if (!loginRes.error && loginRes.data?.user) {
        data = loginRes.data;
        error = null;
      }
    }

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    if (data.user) {
      console.log(`Creating/updating database profile for user: ${data.user.id}`);
      try {
        await createUserProfile({
          id: data.user.id,
          email: data.user.email || email,
          role: "client", // New signups default to client
          fullName: fullName || "",
          businessName: businessName || ""
        }, req.reqId);
      } catch (profileErr: any) {
        console.warn(`[Auth Signup] User profile creation fallback notice for ${data.user.id}:`, profileErr?.message || profileErr);
      }
    }

    return res.json({ success: true, user: data.user, session: data.session });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Auth Signup error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to sign up." });
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

// API: Update a single project state
app.put("/api/projects/:id", requestTimeout(10000, "Update Project"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, validateBody(updateProjectSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

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
    const { packageName, price, discount, features, summary } = req.body;

    checkAbort(req);

    const extra = await updateQuote(id, {
      packageName,
      price: Number(price),
      discount: Number(discount || 0),
      features: features || [],
      summary: summary || ""
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

// API: Expose Razorpay Public Key ID
app.get("/api/config/razorpay", (req, res) => {
  return res.json({
    keyId: process.env.RAZORPAY_KEY_ID || "",
    verificationModeActive: false
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

    // Retrieve extra details (locked price)
    const extra = await getExtraData(id);
    let amountInRupees = 19999; // Default fallback
    let planName = "Fusion Package";

    if (extra && extra.quote) {
      planName = extra.quote.packageName || "Standard Package";
      const totalPrice = extra.quote.price;
      const quoteDiscount = Number(extra.quote.discount || 0);

      if (term === "upfront") {
        if (quoteDiscount > 0) {
          // If discount was already applied when locking quote (e.g., price is 7199, discount is 800)
          amountInRupees = Math.round(totalPrice);
        } else {
          // If price stored is the base price (e.g., 7999), apply 10% upfront discount
          amountInRupees = Math.round(totalPrice * 0.9);
        }
      } else {
        // Milestone term (50% of base price)
        const basePrice = quoteDiscount > 0 ? (totalPrice + quoteDiscount) : totalPrice;
        amountInRupees = Math.round(basePrice * 0.5);
      }
    } else {
      // Fallback manual price calculation if quote is missing
      const packageId = project.selectedPackage || "growth";
      let basePrice = 19999;
      if (packageId === "foundation") basePrice = 7999;
      if (packageId === "dominance") basePrice = 39999;
      
      if (term === "upfront") {
        amountInRupees = Math.round(basePrice * 0.9); // 10% discount
      } else {
        amountInRupees = Math.round(basePrice * 0.5); // 50% milestone
      }
    }

    // Override for Ignite plan live verification testing: ensure Ignite order amount sent to Razorpay is exactly ₹1 (100 paise)
    const isIgnitePlan = 
      project.selectedPackage === "foundation" ||
      (project.selectedPackage && project.selectedPackage.toLowerCase().includes("ignite")) ||
      (planName && planName.toLowerCase().includes("ignite")) ||
      (extra?.quote?.packageName && extra.quote.packageName.toLowerCase().includes("ignite"));

    if (isIgnitePlan) {
      amountInRupees = 1;
    }

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

// API: Verify Razorpay Payment Signature (Client-side fast checkout verification)
app.post("/api/projects/:id/verify-payment", requestTimeout(15000, "Verify Razorpay Payment"), validateProjectIdParam, requireAuth, verifyProjectOwnership, paymentVerificationRateLimiter, validateBody(verifyPaymentSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, term } = req.body;

    checkAbort(req);

    // Validate Signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      logger.warn(`Payment signature verification failed for project ${id}`);
      return res.status(400).json({ success: false, error: "Invalid payment signature." });
    }

    // Retrieve project by ID from request context
    const project = req.project;

    const extra = await getExtraData(id);
    const planName = extra?.quote?.packageName || "Standard Package";
    
    // Check if project was already updated
    if ((project.paymentStatus === "paid" || project.paymentStatus === "partially_paid") && project.paymentId === razorpay_payment_id) {
      return res.json({
        success: true,
        message: "Payment already verified.",
        project
      });
    }

    const portalAccessSource = project.portalAccessSource || "automatic";
    const shouldGrantAccess = portalAccessSource === "manual" ? project.portalAccess : true;

    // Update project state in Supabase & Extra store supporting dual-milestone states
    const isFinalMilestone = term === "final";
    const nextPaymentStatus = (term === "upfront" || isFinalMilestone) ? "paid" : "partially_paid";
    const planDetailString = isFinalMilestone ? `${planName} (fully paid milestone)` : `${planName} (${term || "milestone"})`;

    const updates = {
      paymentStatus: nextPaymentStatus,
      portalAccess: shouldGrantAccess,
      paymentProvider: "razorpay",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      purchasedPlan: planDetailString,
      purchaseDate: new Date().toISOString(),
      portalAccessSource
    };

    checkAbort(req);

    const updatedProject = await updateProject(id, updates, req.reqId);

    // Track event in Audit Trail
    await logAuditEvent({
      projectId: id,
      eventType: "Payment Verified",
      requestId: req.reqId,
      actor: "Client",
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
        notes: "Portal access automatically granted upon successful payment."
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
    sendEmailAsync(updatedProject.email, `Payment Confirmed - ${updatedProject.businessName}`, emailHtml);

    // Dispatch Internal Admin Alert
    triggerAdminNotification(
      "Payment Verified",
      `Successful checkout transaction has been completed and verified for project ${updatedProject.businessName}.`,
      {
        "Project ID": id,
        "Client Name": updatedProject.clientName,
        "Business Name": updatedProject.businessName,
        "Plan Purchased": updates.purchasedPlan,
        "Payment Ref": razorpay_payment_id,
        "Order Ref": razorpay_order_id,
        "Amount Verified": formattedAmount
      },
      req.reqId
    );

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

// API: Razorpay Webhook Endpoint (Primary source-of-truth asynchronous processor)
app.post("/api/webhooks/razorpay", webhookRateLimiter, async (req: any, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({ success: false, error: "Missing x-razorpay-signature header." });
    }

    const rawBody = req.rawBody ? req.rawBody.toString("utf-8") : "";
    
    // Verify Webhook Signature
    const isValid = verifyWebhookSignature(rawBody, String(signature));
    if (!isValid) {
      console.warn("Razorpay Webhook signature verification failed.");
      return res.status(400).json({ success: false, error: "Invalid webhook signature." });
    }

    const event = JSON.parse(rawBody);
    console.log(`Razorpay webhook event received: ${event.event}`);

    // Support payment.captured and order.paid
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payload = event.payload;
      const orderData = payload.order?.entity;
      const paymentData = payload.payment?.entity;

      const notes = orderData?.notes || paymentData?.notes || {};
      const projectId = notes.projectId || notes.project_id;

      if (!projectId) {
        console.warn("No projectId found in webhook notes.");
        return res.json({ success: true, message: "Ignored: No project ID linked in notes." });
      }

      const project = await getProjectById(projectId);
      if (!project) {
        console.warn(`Project not found for webhook ID: ${projectId}`);
        return res.status(404).json({ success: false, error: "Project not found." });
      }

      const paymentId = paymentData?.id || orderData?.payment_id || "";
      const orderId = orderData?.id || paymentData?.order_id || "";
      const term = notes.term || "milestone";
      const planName = notes.planName || "Standard Package";

      // Idempotency: Check if already paid with this payment ID or order ID
      if ((project.paymentStatus === "paid" || project.paymentStatus === "partially_paid") && (project.paymentId === paymentId || project.orderId === orderId)) {
        console.log(`Idempotency: Webhook already processed for payment ${paymentId} / order ${orderId}.`);
        return res.json({ success: true, message: "Webhook already processed (Idempotency)." });
      }

      const portalAccessSource = project.portalAccessSource || "automatic";
      const shouldGrantAccess = portalAccessSource === "manual" ? project.portalAccess : true;

      // Update project status supporting dual-milestone states
      const isFinalMilestone = term === "final";
      const nextPaymentStatus = (term === "upfront" || isFinalMilestone) ? "paid" : "partially_paid";
      const planDetailString = isFinalMilestone ? `${planName} (fully paid milestone)` : `${planName} (${term || "milestone"})`;

      const updates = {
        paymentStatus: nextPaymentStatus,
        portalAccess: shouldGrantAccess,
        paymentProvider: "razorpay",
        paymentId: paymentId || project.paymentId,
        orderId: orderId || project.orderId,
        purchasedPlan: planDetailString,
        purchaseDate: new Date().toISOString(),
        portalAccessSource
      };

      const webhookId = req.reqId || "webhook-" + Date.now();
      await updateProject(projectId, updates, webhookId);
      console.log(`Successfully verified and updated project payment status from Webhook for ID: ${projectId}`);

      // Track event in Audit Trail
      await logAuditEvent({
        projectId: projectId,
        eventType: "Webhook Received",
        requestId: webhookId,
        actor: "System",
        status: "Success",
        notes: `Razorpay webhook received event: ${event.event}`
      });

      await logAuditEvent({
        projectId: projectId,
        eventType: "Payment Verified",
        requestId: webhookId,
        actor: "System",
        status: "Success",
        notes: `Webhook verified payment of plan: ${updates.purchasedPlan}. Ref: ${paymentId}`
      });

      if (shouldGrantAccess) {
        await logAuditEvent({
          projectId: projectId,
          eventType: "Portal Activated",
          requestId: webhookId,
          actor: "System",
          status: "Success",
          notes: "Portal access automatically granted upon webhook payment verification."
        });
      }

      // Send Receipt Email Notification
      const extra = await getExtraData(projectId);
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
        project.clientName,
        project.businessName,
        updates.purchasedPlan,
        orderId,
        formattedAmount,
        portalUrl
      );
      sendEmailAsync(project.email, `Payment Confirmed - ${project.businessName}`, emailHtml);

      // Dispatch Internal Admin Alert
      triggerAdminNotification(
        "Payment Verified via Webhook",
        `Webhook verified successful payment transaction for project ${project.businessName}.`,
        {
          "Project ID": projectId,
          "Client Name": project.clientName,
          "Business Name": project.businessName,
          "Plan Purchased": updates.purchasedPlan,
          "Payment Ref": paymentId,
          "Order Ref": orderId,
          "Amount Verified": formattedAmount,
          "Webhook Event": event.event
        },
        webhookId
      );
    }

    return res.json({ success: true, message: "Webhook event processed." });
  } catch (err: any) {
    console.error("Razorpay webhook processing error:", err);
    return res.status(500).json({ success: false, error: err.message || "Webhook processing failed." });
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
1. Ignite (id: "foundation", Price: "₹7,999", level: 1): Premium visual one-page identity hub. Best for micro-businesses, SaaS validate-tests, simple services, and direct local landing pages.
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
                          description: "List the correct price: ₹7,999 for foundation, ₹19,999 for growth, and ₹39,999 for dominance" 
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
      foundation: ["₹8,450", "₹9,250", "₹9,999", "₹10,250", "₹11,500"],
      growth: ["₹20,250", "₹20,999", "₹21,500", "₹22,250", "₹22,900"],
      dominance: ["₹41,500", "₹43,250", "₹44,999", "₹46,800", "₹48,250"]
    };

    // Choose base and upgrade 1 prices and names realistically
    let baseName = "✦ Fusion";
    let basePrice = "₹19,999";
    let baseFeatures = [
      "Makes your business feel more premium and professional",
      "Designed to give your customers a better experience",
      "Personalized recommendations for your business",
      "Extra attention to your business"
    ];

    const growthPrices = PLUS_PREDEFINED_PRICES.growth;
    let upgrade1Name = "✦ Fusion+";
    let upgrade1Price = growthPrices[Math.floor(Math.random() * growthPrices.length)];
    let upgrade1FeaturesAdded = [
      "✓ Appointment Booking System",
      "✓ Local SEO Setup"
    ];

    if (packageId === "foundation") {
      baseName = "⚡ Ignite";
      basePrice = "₹7,999";
      baseFeatures = [
        "Premium launch experience",
        "Better overall customer experience",
        "Extra attention to your business needs",
        "Designed to make your brand stand out"
      ];
      const foundationPrices = PLUS_PREDEFINED_PRICES.foundation;
      upgrade1Name = "⚡ Ignite+";
      upgrade1Price = foundationPrices[Math.floor(Math.random() * foundationPrices.length)];
      upgrade1FeaturesAdded = [
        "✓ Google Reviews Showcase",
        "✓ Instant WhatsApp Chat"
      ];
    } else if (packageId === "dominance") {
      baseName = "⬢ Catalyst";
      basePrice = "₹39,999";
      baseFeatures = [
        "Our most premium experience",
        "Extra care throughout your project",
        "Personalized business recommendations",
        "Designed for businesses that want the very best experience"
      ];
      const dominancePrices = PLUS_PREDEFINED_PRICES.dominance;
      upgrade1Name = "⬢ Catalyst+";
      upgrade1Price = dominancePrices[Math.floor(Math.random() * dominancePrices.length)];
      upgrade1FeaturesAdded = [
        "✓ Client Portal & Accounts",
        "✓ Custom Analytics Dashboard"
      ];
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

    const systemPrompt = `You are an experienced, honest website & business consultant at CodeFuser.
Your task is to provide a simple, friendly website consultation for a local business owner ("${businessName}", Industry: "${industry || 'General'}", Goal: "${goal || 'Growth'}").

User Notes/Prompt: "${aiPrompt || 'None'}"
Currently Selected Package: ${baseName} (${basePrice})

CRITICAL CONSULTANT RULE - LESS IS MORE (QUALITY > QUANTITY):
1. The AI is allowed to recommend ONLY 2 to 4 features if that is genuinely all the business needs to achieve its goals.
2. NEVER fill or pad recommendations simply to reach 5-7 items. Quality > Quantity.
3. "If the client is a small local business owner with limited technical knowledge, always prefer fewer recommendations that are easy to understand over many recommendations that feel impressive."
4. NEVER recommend features solely because they belong to an industry template (e.g. don't recommend digital photo proofing or complex calculators if the owner didn't express a need for them).
5. Recommend features ONLY because they help THIS specific business achieve ITS goals ("${goal || 'Growth'}").

PRIORITY HIERARCHY FOR RECOMMENDATIONS:
1. Client's Specific Business Goals & Prompt Notes (Highest Priority)
2. Client Requirements & Custom Requests
3. Business Type & Context
4. Industry Best Practices
5. Package Mapping & Recommendations

1. FEATURE NAMING PHILOSOPHY ("STUPIDLY SIMPLE" - UNDERSTANDABLE IN 2 SECONDS):
   - A 45-year-old local shop or clinic owner MUST understand every feature name instantly.
   - BANNED FANCY/CORPORATE NAMES:
     * "Treatment Services Showcase" -> USE "Treatments We Offer"
     * "Client Proofing Portal" -> USE "Download Your Photos"
     * "Mortgage & EMI Calculator" -> USE "EMI Calculator"
     * "Digital Consultation Intake Form" -> USE "Online Consultation Form"
     * "Faculty & Mentor Profiles" -> USE "Teacher Profiles"
     * "Virtual Video Tours" -> USE "Video Tours"
     * "Lead Intake Funnel" -> USE "Free Trial Pass"
   - APPROVED STUPIDLY SIMPLE NAMES:
     * Dental/Clinic: "Doctor Profiles", "Online Booking", "Treatments We Offer", "Patient Reviews", "Clinic Location"
     * Restaurant: "Digital Menu", "Table Reservation", "Online Orders", "Customer Reviews", "Location & Hours"
     * Gym: "Membership Plans", "Trainer Profiles", "Class Schedule", "Free Trial Pass", "Member Reviews"
     * Photo Studio: "Portfolio Gallery", "Price Packages", "Booking Form", "Customer Reviews"
     * Salon/Spa: "Price List & Services", "WhatsApp Booking", "Before & After Photos", "Client Reviews"
     * Real Estate: "Property Listings", "Video Tours", "Agent Profiles", "Schedule Site Visit"
     * Education: "Course Catalog", "Teacher Profiles", "Free Demo Class", "Student Results"

2. OUR RECOMMENDATION ADVICE (FRIENDLY BUSINESS STATEMENT):
   - "advice" MUST be a short 1-2 line statement written in simple, direct English explaining how these features help their business.
     Examples:
     * Photo Studio: "These features help showcase your photography work and make it easy for customers to book a photoshoot."
     * Restaurant: "These features help local diners explore your digital menu and reserve a table quickly."
     * Dental Clinic: "These features help patients learn about your treatments and book appointments online."
     * Gym: "These features help fitness enthusiasts check class schedules, see trainer profiles, and claim trial passes."

3. OPTIONAL FUTURE GROWTH IDEAS ("optionalRecommendations"):
   - Generate 2 to 3 friendly, practical local business growth steps.
   - DO NOT write startup/corporate consultant jargon (like "reduce patient no-shows by 40%" or "digital intake funnels").
     Examples:
     * Dental Clinic:
       - "Allow patients to book appointments online."
       - "Show patient reviews to build trust."
       - "Make it easy for patients to find your clinic location."
     * Restaurant:
       - "Let customers see your menu before visiting."
       - "Allow table reservations online."
       - "Make weekend offers easy to share on WhatsApp."
     * Gym:
       - "Allow members to check class schedules easily."
       - "Offer a free trial pass to attract new members."
       - "Show trainer profiles and member transformation stories."
     * Photo Studio:
       - "Make your best work easy to showcase."
       - "Allow customers to enquire in one click."
       - "Display your photography packages clearly."

4. PACKAGE+ COPYWRITING (RECOMMENDED ADD-ON):
   - Explanation/rationale must be 1 short sentence (maximum 15 words) specific to the feature.

5. ABSOLUTELY NO TECHNICAL JARGON (no "SSL", "Responsive", "SEO", "Hosting", "Fast Loading").

6. CRITICAL OPTIONS CARDS RULES (EXACTLY 2 CARDS IN "options" ARRAY):
   - DO NOT generate a pricing page comparison (e.g. NEVER put Ignite in Card 1 and Fusion in Card 2!).
   - Step 6 is an AI Consultation for the client's package.
   - Card 1 (id: "current"):
     * name: "${baseName}" (e.g. "Ignite", "Fusion", or "Catalyst").
     * price: "${basePrice}" (e.g. "₹7,999", "₹19,999", or "₹39,999").
     * headline: 1 short sentence describing what is included in this package for their business.
     * benefits: Array of 3-4 simple features included in this base package (e.g. ["✓ Portfolio Gallery", "✓ Price Packages", "✓ Contact Form", "✓ Google Map"]).
     * rationale: 1 short sentence explaining why this package fits their business goals.
   - Card 2 (id: "upgrade_1"):
     * name: "${baseName} + [Single Add-on Feature Name]" (e.g. "Ignite + Online Booking", "Fusion + WhatsApp Booking", "Catalyst + Client Portal").
     * price: AI Recommended Plus price (MUST be one of these predefined prices: For Ignite: ₹8,450, ₹9,250, ₹9,999, ₹10,250, or ₹11,500. For Fusion: ₹20,250, ₹20,999, ₹21,500, ₹22,250, or ₹22,900. For Catalyst: ₹41,500, ₹43,250, ₹44,999, ₹46,800, or ₹48,250).
     * headline: 1 short sentence describing the benefit of adding this single optional feature.
     * benefits: Array containing ONLY the single optional add-on feature (e.g. ["✓ Online Booking"]).
     * rationale: 1 short sentence explaining why adding this single feature gives extra value to their business.

FINAL 4-SECTION CONSULTATION STRUCTURE:

SECTION 1: ABOUT YOUR BUSINESS ("aboutYourBusiness"): 1-2 short friendly lines.
SECTION 2: BIGGEST OPPORTUNITY ("biggestOpportunity"): 1-2 short lines on business growth.
SECTION 3: OUR RECOMMENDATION ("ourRecommendation"):
  - "recommendedFeatures": 2 to 5 stupidly simple, high-value feature names (ONLY what genuinely adds value, no padding).
  - "advice": 1-2 short lines tailored specifically to their business type and goals.
  - "recommendedPackage": "Ignite", "Fusion", or "Catalyst".
SECTION 4: YOUR PACKAGE ("yourPackageEvaluation"):
  - "status": "perfect", "upgrade_recommended", "downgrade_recommended", or "different_recommended".
  - "evaluationText": 1-2 short lines evaluating choice "${baseName}".`;

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
                description: "Must contain card options: baseline card and upgrade/alternate card",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    price: { type: Type.STRING },
                    headline: { type: Type.STRING },
                    benefits: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
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

  let featureName = "Online Booking";
  let recAddons = ["✓ Online Booking"];
  let addOnPriceDelta = 1249;
  let recReason = "Customers can book your services anytime.";

  if (ind.includes("food") || ind.includes("restaurant") || ind.includes("cafe")) {
    featureName = "Table Reservation";
    recAddons = ["✓ Table Reservation"];
    addOnPriceDelta = 1249;
    recReason = "Lets customers reserve a table online.";
  } else if (ind.includes("law") || ind.includes("legal") || ind.includes("advocate") || ind.includes("attorney")) {
    featureName = "Contact Form";
    recAddons = ["✓ Contact Form"];
    addOnPriceDelta = 899;
    recReason = "Makes it easier for customers to contact you.";
  } else if (ind.includes("medical") || ind.includes("clinic") || ind.includes("doctor") || ind.includes("dental")) {
    featureName = "Online Booking";
    recAddons = ["✓ Online Booking"];
    addOnPriceDelta = 1499;
    recReason = "Patients can book appointments online anytime.";
  } else if (ind.includes("gym") || ind.includes("fitness")) {
    featureName = "Trial Pass Form";
    recAddons = ["✓ Trial Pass Form"];
    addOnPriceDelta = 749;
    recReason = "Lets interested members request trial passes easily.";
  } else if (ind.includes("salon") || ind.includes("spa") || ind.includes("beauty")) {
    featureName = "WhatsApp Booking";
    recAddons = ["✓ WhatsApp Booking"];
    addOnPriceDelta = 599;
    recReason = "Clients can request salon bookings directly via WhatsApp.";
  } else if (ind.includes("photo") || ind.includes("studio") || ind.includes("design")) {
    featureName = "Online Booking";
    recAddons = ["✓ Online Booking"];
    addOnPriceDelta = 1249;
    recReason = "Customers can book photo sessions anytime.";
  } else if (ind.includes("estate") || ind.includes("real") || ind.includes("property")) {
    featureName = "Inquiry Form";
    recAddons = ["✓ Inquiry Form"];
    addOnPriceDelta = 1149;
    recReason = "Makes it easier for buyers to ask about properties.";
  }

  const fPrices = ["₹8,450", "₹9,250", "₹9,999", "₹10,250", "₹11,500"];
  const gPrices = ["₹20,250", "₹20,999", "₹21,500", "₹22,250", "₹22,900"];
  const dPrices = ["₹41,500", "₹43,250", "₹44,999", "₹46,800", "₹48,250"];

  if (packageId === "foundation") {
    const upgradeVal = fPrices[Math.floor(Math.random() * fPrices.length)];
    return [
      {
        id: "current",
        name: "⚡ Ignite",
        price: "₹7,999",
        headline: "Show your work online and help local customers find you easily.",
        benefits: getDynamicIndustryBenefits(industry, 'base'),
        rationale: "Ignite already gives you great value with key business features included."
      },
      {
        id: "upgrade_1",
        name: `⚡ Ignite + ${featureName}`,
        price: upgradeVal,
        headline: "A simple addition to help your business grow.",
        benefits: recAddons,
        rationale: recReason
      }
    ];
  }

  if (packageId === "dominance") {
    const upgradeVal = dPrices[Math.floor(Math.random() * dPrices.length)];
    return [
      {
        id: "current",
        name: "⬢ Catalyst",
        price: "₹39,999",
        headline: "Complete custom business setup with full support.",
        benefits: getDynamicIndustryBenefits(industry, 'base'),
        rationale: "Catalyst includes custom strategy, logic, and full project support."
      },
      {
        id: "upgrade_1",
        name: "⬢ Catalyst + Customer Portal",
        price: upgradeVal,
        headline: "An optional client management portal.",
        benefits: [
          "✓ Customer Portal"
        ],
        rationale: "Lets customers log in and manage account details anytime."
      }
    ];
  }

  // Default / Fusion
  const upgradeVal = gPrices[Math.floor(Math.random() * gPrices.length)];
  return [
    {
      id: "current",
      name: "✦ Fusion",
      price: "₹19,999",
      headline: "Everything included to show your work and get new customers.",
      benefits: getDynamicIndustryBenefits(industry, 'base'),
      rationale: "Fusion provides great business value with custom pages and customer contact tools."
    },
    {
      id: "upgrade_1",
      name: `✦ Fusion + ${featureName}`,
      price: upgradeVal,
      headline: "A simple addition to help your business grow.",
      benefits: recAddons,
      rationale: recReason
    }
  ];
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
    bestMatchPrice = '₹7,999';
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
      price: "₹7,999",
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
