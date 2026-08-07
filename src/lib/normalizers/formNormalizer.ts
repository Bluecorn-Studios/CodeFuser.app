export interface NormalizedProjectFormData {
  businessName: string;
  ownerName: string;
  email: string;
  whatsapp: string;
  countryCode: string;
  industry: string;
  customIndustry: string;
  aiPrompt: string;
  hasDomain: string;
  customDomain: string;
  hasLogo: string;
  selectedPlanId: string;
}

export function normalizeProjectFormData(raw: any): NormalizedProjectFormData {
  const f = raw && typeof raw === "object" ? raw : {};
  return {
    businessName: String(f.businessName || ""),
    ownerName: String(f.ownerName || ""),
    email: String(f.email || "").trim().toLowerCase(),
    whatsapp: String(f.whatsapp || ""),
    countryCode: String(f.countryCode || "+91"),
    industry: String(f.industry || ""),
    customIndustry: String(f.customIndustry || ""),
    aiPrompt: String(f.aiPrompt || ""),
    hasDomain: String(f.hasDomain || "no"),
    customDomain: String(f.customDomain || ""),
    hasLogo: String(f.hasLogo || "no"),
    selectedPlanId: String(f.selectedPlanId || f.packageId || "foundation"),
  };
}
