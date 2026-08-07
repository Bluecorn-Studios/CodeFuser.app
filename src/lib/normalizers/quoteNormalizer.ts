export interface ProjectQuote {
  id: string;
  packageName: string;
  priceAmount: number;
  currency: string;
  depositPercentage: number;
  deliverables: string[];
  status: string;
}

export function normalizeProjectQuote(raw: any): ProjectQuote | null {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: String(raw.id || ""),
    packageName: String(raw.packageName || raw.package_name || ""),
    priceAmount: typeof raw.priceAmount === "number" ? raw.priceAmount : Number(raw.priceAmount || 0),
    currency: String(raw.currency || "INR"),
    depositPercentage: typeof raw.depositPercentage === "number" ? raw.depositPercentage : Number(raw.depositPercentage || 50),
    deliverables: Array.isArray(raw.deliverables) ? raw.deliverables.map(String) : [],
    status: String(raw.status || "draft"),
  };
}
