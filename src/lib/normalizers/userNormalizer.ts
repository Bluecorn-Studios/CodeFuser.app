export interface NormalizedUser {
  id: string;
  email: string;
  fullName: string;
  businessName: string;
  role: string;
}

export function normalizeUser(raw: any): NormalizedUser {
  const u = raw && typeof raw === "object" ? raw : {};
  return {
    id: String(u.id || ""),
    email: String(u.email || "").trim().toLowerCase(),
    fullName: String(u.fullName || u.full_name || u.user_metadata?.full_name || u.name || ""),
    businessName: String(u.businessName || u.business_name || u.user_metadata?.business_name || ""),
    role: String(u.role || u.user_metadata?.role || "customer"),
  };
}
