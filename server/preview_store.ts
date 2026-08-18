import crypto from "crypto";
import { ProjectRecord, ChangeRequestRecord } from "./db.js";
import { ExtraProjectData, OfficialQuoteRecord, AssetFileRecord } from "./extra_store.js";

export interface PreviewSession {
  sessionId: string;
  previewToken: string;
  adminUserId?: string;
  adminEmail?: string;
  createdAt: string;
  expiresAt: number; // Unix timestamp in ms
  user: {
    id: string;
    email: string;
    fullName: string;
    businessName: string;
    role: "client";
  };
  projectId: string;
}

interface PreviewAssetItem {
  record: AssetFileRecord;
  buffer?: Buffer;
}

// In-memory isolated storage for preview mode
const sessionsByToken = new Map<string, PreviewSession>();
const projectsById = new Map<string, ProjectRecord>();
const extrasById = new Map<string, ExtraProjectData>();
const assetsByProjectId = new Map<string, PreviewAssetItem[]>();
const auditEventsByProjectId = new Map<string, any[]>();
const hostingByProjectId = new Map<string, any>();

const SESSION_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

/**
 * Creates an isolated Preview Session authorized by Admin.
 */
export function createPreviewSession(adminInfo?: { id?: string; email?: string }): PreviewSession {
  const sessionId = "prev_sess_" + crypto.randomBytes(12).toString("hex");
  const previewToken = "cf_prev_" + crypto.randomBytes(32).toString("hex");
  const userId = "prev_user_" + crypto.randomBytes(8).toString("hex");
  const projectId = "prev_proj_" + crypto.randomBytes(10).toString("hex");
  const now = Date.now();

  const previewUser = {
    id: userId,
    email: `preview.client.${Date.now()}@codefuser.test`,
    fullName: "Preview Business Owner",
    businessName: "Preview Company",
    role: "client" as const
  };

  const session: PreviewSession = {
    sessionId,
    previewToken,
    adminUserId: adminInfo?.id || "admin-session",
    adminEmail: adminInfo?.email || "admin@codefuser.com",
    createdAt: new Date().toISOString(),
    expiresAt: now + SESSION_TTL_MS,
    user: previewUser,
    projectId
  };

  sessionsByToken.set(previewToken, session);

  // Initialize isolated preview project structure
  const initialProject: ProjectRecord = {
    id: projectId,
    clientName: previewUser.fullName,
    businessName: previewUser.businessName,
    email: previewUser.email,
    whatsapp: "+91 9876543210",
    selectedPackage: "growth",
    ownershipChoice: "buyout",
    industry: "Technology & Software",
    customIndustry: "",
    goal: "Generate Qualified Inbound Leads",
    customGoal: "",
    hasDomain: "yes",
    hasLogo: "yes",
    contentReady: "yes",
    galleryReady: "yes",
    businessDetails: "Enterprise software testing in isolated preview mode.",
    address: "Cyber City, Tech Park, India",
    timestamp: new Date().toISOString(),
    status: "draft",
    userId: userId,
    paymentStatus: "unpaid",
    portalAccess: false,
    paymentProvider: "",
    paymentId: "",
    orderId: "",
    purchasedPlan: "",
    purchaseDate: "",
    portalAccessSource: "automatic",
    quote: null,
    assets: [],
    aiPrompt: "A high-conversion website for enterprise preview testing.",
    launchStatus: "NOT_READY" as const,
    websiteStatus: "OFFLINE",
    websiteUrl: "",
    stagingUrl: "",
    healthStatus: "maintenance",
    lastHealthCheck: null,
    dnsStatus: "unconfigured",
    sslStatus: "unconfigured",
    changeRequests: [],
    onboarding: {
      industry: "Technology & Software",
      customIndustry: "",
      goal: "Generate Qualified Inbound Leads",
      customGoal: "",
      hasDomain: "yes",
      hasLogo: "yes",
      contentReady: "yes"
    },
    payment: {}
  };

  projectsById.set(projectId, initialProject);

  extrasById.set(projectId, {
    projectId,
    quote: null,
    assets: [],
    paymentStatus: "unpaid",
    portalAccess: false
  });

  return session;
}

/**
 * Validates a preview token and returns the active session if valid.
 */
export function getPreviewSessionByToken(token: string): PreviewSession | null {
  if (!token || typeof token !== "string") return null;
  const cleanToken = token.trim();
  const session = sessionsByToken.get(cleanToken);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    cleanupPreviewSession(cleanToken);
    return null;
  }

  return session;
}

/**
 * Checks if a given project ID is in the isolated preview store.
 */
export function isProjectIdPreview(projectId: string): boolean {
  if (!projectId || typeof projectId !== "string") return false;
  return projectId.startsWith("prev_proj_") || projectId.startsWith("prev_") || projectsById.has(projectId);
}

/**
 * Retrieves a preview project by ID.
 */
export function getPreviewProject(projectId: string): ProjectRecord | null {
  if (!projectId) return null;
  return projectsById.get(projectId) || null;
}

/**
 * Retrieves preview projects for a given user or email.
 */
export function getPreviewProjectsForUser(userId?: string, email?: string): ProjectRecord[] {
  const results: ProjectRecord[] = [];
  for (const project of projectsById.values()) {
    if (userId && project.userId === userId) {
      results.push(project);
    } else if (email && project.email?.toLowerCase() === email.toLowerCase()) {
      results.push(project);
    }
  }
  return results;
}

/**
 * Saves or updates an isolated preview project.
 */
export function savePreviewProject(project: Partial<ProjectRecord> & { id: string }): ProjectRecord {
  const existing = projectsById.get(project.id) || {
    id: project.id,
    clientName: "Preview Client",
    businessName: "Preview Business",
    email: "preview@codefuser.test",
    whatsapp: "+91 9876543210",
    selectedPackage: "growth",
    ownershipChoice: "buyout" as const,
    industry: "",
    customIndustry: "",
    goal: "",
    customGoal: "",
    hasDomain: "help",
    hasLogo: "help",
    contentReady: "no_help",
    timestamp: new Date().toISOString(),
    status: "draft" as const,
    userId: "prev_user_default",
    paymentStatus: "unpaid",
    portalAccess: false,
    quote: null,
    assets: [],
    launchStatus: "NOT_READY" as const,
    websiteStatus: "OFFLINE" as const,
    healthStatus: "maintenance" as const,
    changeRequests: []
  };

  const updated: ProjectRecord = {
    ...existing,
    ...project,
    onboarding: {
      ...(existing.onboarding || {}),
      ...(project.onboarding || {})
    },
    payment: {
      ...(existing.payment || {}),
      ...(project.payment || {})
    }
  };

  projectsById.set(project.id, updated);
  return updated;
}

/**
 * Retrieves preview extra data (quotes, assets).
 */
export function getPreviewExtra(projectId: string): ExtraProjectData {
  const existing = extrasById.get(projectId);
  if (existing) return existing;

  const initial: ExtraProjectData = {
    projectId,
    quote: null,
    assets: []
  };
  extrasById.set(projectId, initial);
  return initial;
}

/**
 * Saves preview extra data.
 */
export function savePreviewExtra(projectId: string, updates: Partial<ExtraProjectData>): ExtraProjectData {
  const existing = getPreviewExtra(projectId);
  const updated: ExtraProjectData = {
    ...existing,
    ...updates,
    projectId
  };
  extrasById.set(projectId, updated);

  // Sync back to project record if present
  const proj = projectsById.get(projectId);
  if (proj) {
    if (updates.quote !== undefined) proj.quote = updates.quote as any;
    if (updates.assets !== undefined) proj.assets = updates.assets;
    if (updates.paymentStatus !== undefined) proj.paymentStatus = updates.paymentStatus;
    if (updates.portalAccess !== undefined) proj.portalAccess = updates.portalAccess;
    projectsById.set(projectId, proj);
  }

  return updated;
}

/**
 * Stores a preview asset.
 */
export function savePreviewAsset(projectId: string, asset: AssetFileRecord, fileBuffer?: Buffer): AssetFileRecord {
  const list = assetsByProjectId.get(projectId) || [];
  list.push({ record: asset, buffer: fileBuffer });
  assetsByProjectId.set(projectId, list);

  // Also update extra
  const extra = getPreviewExtra(projectId);
  const updatedAssets = [...(extra.assets || []).filter(a => a.id !== asset.id), asset];
  savePreviewExtra(projectId, { assets: updatedAssets });

  return asset;
}

/**
 * Gets a preview asset item.
 */
export function getPreviewAsset(projectId: string, assetId: string): PreviewAssetItem | null {
  const list = assetsByProjectId.get(projectId) || [];
  const found = list.find(a => a.record.id === assetId);
  return found || null;
}

/**
 * Adds a preview change request.
 */
export function addPreviewChangeRequest(projectId: string, crData: Partial<ChangeRequestRecord>): ChangeRequestRecord {
  const cr: ChangeRequestRecord = {
    id: crData.id || "cr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    projectId,
    requestText: crData.requestText || "",
    category: crData.category || "Design / Visuals",
    chips: crData.chips || [],
    photoName: crData.photoName,
    photoUrl: crData.photoUrl,
    priority: crData.priority || "normal",
    status: crData.status || "SUBMITTED",
    createdAt: crData.createdAt || new Date().toISOString(),
    updatedAt: crData.updatedAt || new Date().toISOString(),
    adminNotes: crData.adminNotes,
    estimatedTurnaround: crData.estimatedTurnaround
  };
  const proj = projectsById.get(projectId);
  if (proj) {
    const list = proj.changeRequests || [];
    proj.changeRequests = [cr, ...list];
    projectsById.set(projectId, proj);
  }
  return cr;
}

/**
 * Cleans up a preview session and all its associated test records.
 */
export function cleanupPreviewSession(previewToken: string): boolean {
  const session = sessionsByToken.get(previewToken);
  if (!session) return false;

  const projectId = session.projectId;
  sessionsByToken.delete(previewToken);
  
  if (projectId) {
    projectsById.delete(projectId);
    extrasById.delete(projectId);
    assetsByProjectId.delete(projectId);
    auditEventsByProjectId.delete(projectId);
    hostingByProjectId.delete(projectId);
  }

  console.log(`[Preview Store] Cleaned up preview session ${session.sessionId} and project ${projectId}`);
  return true;
}

/**
 * Periodically cleans up expired preview sessions every 15 minutes.
 */
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessionsByToken.entries()) {
    if (now > session.expiresAt) {
      cleanupPreviewSession(token);
    }
  }
}, 15 * 60 * 1000);
