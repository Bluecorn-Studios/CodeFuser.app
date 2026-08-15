export interface ChangeRequestItem {
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
  customIndustry?: string;
  goal: string;
  customGoal?: string;
  stageIndex?: number;
  stageName?: string;
  stageDetails?: string;
  stageUpdateNote?: string;
  stageProgressPercent?: number;
  hasDomain?: string;
  hasLogo?: string;
  galleryReady?: string;
  contentReady?: string;
  businessDetails?: string;
  address?: string;
  targetDate?: string;
  additionalNotes?: string;
  isApprovedClient?: boolean;
  timestamp?: string;
  purchaseDate?: string;
  totalPrice?: number;
  paidAmount?: number;
  unpaidAmount?: number;
  paymentStatus?: string;
  portalAccess?: boolean;
  portalAccessSource?: "automatic" | "manual";
  status?: string;
  websiteUrl?: string;
  stagingUrl?: string;
  launchStatus?: "NOT_READY" | "DRAFT" | "IN_PROGRESS" | "READY_TO_LAUNCH" | "DEPLOYING" | "VERIFYING" | "LAUNCHED" | "PAUSED" | "ATTENTION" | "VERIFICATION_FAILED";
  websiteStatus?: "ONLINE" | "DEGRADED" | "OFFLINE" | "MAINTENANCE" | "PROVISIONING";
  healthStatus?: "healthy" | "degraded" | "unreachable" | "maintenance" | "HEALTHY" | "UNHEALTHY" | "UNKNOWN";
  lastHealthCheck?: string;
  dnsStatus?: "connected" | "propagating" | "failed" | "unconfigured";
  sslStatus?: "active" | "issuing" | "expired" | "unconfigured";
  changeRequests?: ChangeRequestItem[];
  quote?: any;
  assets?: any[];
  receiptNumber?: string;
  paymentProvider?: string;
  paymentId?: string;
  orderId?: string;
  purchasedPlan?: string;
  payment?: {
    provider?: string;
    paymentId?: string;
    orderId?: string;
    purchasedPlan?: string;
    purchaseDate?: string;
    receiptNumber?: string;
    [key: string]: any;
  };
}

export interface ExtraStore {
  projectId: string;
  quote?: {
    packageName?: string;
    finalPrice?: number;
    price?: number;
    paidAmount?: number;
    unpaidAmount?: number;
    expiryDate?: string;
    proposal?: {
      content: string;
      status: string;
      timestamp: string;
    };
    checklist?: Array<{
      id: string;
      task: string;
      completed: boolean;
    }>;
    deliverables?: Array<{
      id: string;
      name: string;
      category: string;
      size: number;
      url: string;
    }>;
  } | null;
  assets?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
}

export interface PlanInfo {
  timeline: string;
  revisions?: string;
  support?: string;
  features?: string[];
  name?: string;
  price?: number;
  originalPrice?: number;
}
