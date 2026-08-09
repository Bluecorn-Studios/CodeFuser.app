export interface ProjectRecord {
  id: string;
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
  websiteUrl?: string;
  stagingUrl?: string;
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
