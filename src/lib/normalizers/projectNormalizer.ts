import { ProjectQuote, normalizeProjectQuote } from "./quoteNormalizer";

export interface NormalizedProject {
  id: string;
  name: string;
  businessName: string;
  clientName: string;
  email: string;
  whatsapp: string;
  status: string;
  phase: string;
  industry: string;
  customIndustry: string;
  packageId: string;
  selectedPackage: string;
  purchasedPlan: string;
  hasDomain: string;
  paymentStatus: string;
  portalAccess: boolean;
  portalAccessSource: string;
  ownershipChoice: string;
  estimatedDelivery: string;
  lastUpdate: string;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
  quote: ProjectQuote | null;
  deliverables: any[];
  files: any[];
  messages: any[];
  checklists: any[];
  aiPrompt: string;
  [key: string]: any;
}

export function normalizeProject(raw: any): NormalizedProject {
  const p = raw && typeof raw === "object" ? raw : {};
  return {
    id: String(p.id || ""),
    name: String(p.name || p.businessName || p.business_name || "Untitled Project"),
    businessName: String(p.businessName || p.business_name || p.name || ""),
    clientName: String(p.clientName || p.client_name || p.ownerName || p.owner_name || ""),
    email: String(p.email || "").trim().toLowerCase(),
    whatsapp: String(p.whatsapp || p.phone || ""),
    status: String(p.status || "In Progress"),
    phase: String(p.phase || "Onboarding"),
    industry: String(p.industry || p.category || ""),
    customIndustry: String(p.customIndustry || p.custom_industry || ""),
    packageId: String(p.packageId || p.package_id || p.selectedPackage || p.purchasedPlan || "foundation").toLowerCase(),
    selectedPackage: String(p.selectedPackage || p.package_id || p.packageId || p.purchasedPlan || "foundation").toLowerCase(),
    purchasedPlan: String(p.purchasedPlan || p.selectedPackage || p.packageId || "foundation").toLowerCase(),
    hasDomain: String(p.hasDomain || p.has_domain || "no"),
    hasLogo: String(p.hasLogo || p.has_logo || ""),
    galleryReady: String(p.galleryReady || p.gallery_ready || ""),
    contentReady: String(p.contentReady || p.content_ready || ""),
    businessDetails: String(p.businessDetails || p.business_details || ""),
    address: String(p.address || ""),
    paymentStatus: String(p.paymentStatus || p.payment_status || "unpaid"),
    portalAccess: Boolean(p.portalAccess ?? p.portal_access ?? false),
    portalAccessSource: String(p.portalAccessSource || p.portal_access_source || "automatic"),
    ownershipChoice: String(p.ownershipChoice || p.ownership_choice || "full"),
    estimatedDelivery: String(p.estimatedDelivery || p.estimated_delivery || "7 Days"),
    lastUpdate: String(p.lastUpdate || p.last_update || "Just now"),
    nextAction: String(p.nextAction || p.next_action || "Complete Onboarding"),
    createdAt: String(p.createdAt || p.created_at || new Date().toISOString()),
    updatedAt: String(p.updatedAt || p.updated_at || new Date().toISOString()),
    quote: normalizeProjectQuote(p.quote),
    deliverables: Array.isArray(p.deliverables) ? p.deliverables : [],
    files: Array.isArray(p.files) ? p.files : [],
    messages: Array.isArray(p.messages) ? p.messages : [],
    checklists: Array.isArray(p.checklists) ? p.checklists : [],
    aiPrompt: String(p.aiPrompt || p.ai_prompt || ""),
    launchStatus: p.launchStatus || p.launch_status || undefined,
    websiteStatus: p.websiteStatus || p.website_status || undefined,
    websiteUrl: p.websiteUrl || p.website_url || undefined,
    stagingUrl: p.stagingUrl || p.staging_url || undefined,
    healthStatus: p.healthStatus || p.health_status || undefined,
    lastHealthCheck: p.lastHealthCheck || p.last_health_check || undefined,
    dnsStatus: p.dnsStatus || p.dns_status || undefined,
    sslStatus: p.sslStatus || p.ssl_status || undefined,
    changeRequests: p.changeRequests || p.quote?.changeRequests || [],
  };
}
