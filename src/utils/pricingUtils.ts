export const PLUS_PACKAGE_PREDEFINED_PRICES: Record<string, string[]> = {
  foundation: ["₹10,450", "₹11,250", "₹11,999", "₹12,250", "₹13,500"],
  growth: ["₹20,250", "₹20,999", "₹21,500", "₹22,250", "₹22,900"],
  dominance: ["₹41,500", "₹43,250", "₹44,999", "₹46,800", "₹48,250"]
};

export type AllowedPackageId = "foundation" | "growth" | "dominance";

export interface HostingPlanConfig {
  packageId: AllowedPackageId;
  planName: string;
  monthlyHostingPrice: number;
  freeHostingMonths: number;
  domainFreeYears: number;
  domainRenewalPrice: number;
  currency: string;
}

export const HOSTING_PLAN_CONFIGS: Record<AllowedPackageId, HostingPlanConfig> = {
  foundation: {
    packageId: "foundation",
    planName: "Ignite",
    monthlyHostingPrice: 499,
    freeHostingMonths: 1,
    domainFreeYears: 0,
    domainRenewalPrice: 999,
    currency: "INR",
  },
  growth: {
    packageId: "growth",
    planName: "Fusion",
    monthlyHostingPrice: 999,
    freeHostingMonths: 2,
    domainFreeYears: 1,
    domainRenewalPrice: 999,
    currency: "INR",
  },
  dominance: {
    packageId: "dominance",
    planName: "Catalyst",
    monthlyHostingPrice: 1999,
    freeHostingMonths: 3,
    domainFreeYears: 2,
    domainRenewalPrice: 999,
    currency: "INR",
  },
};

export function normalizePackageId(rawPackageId?: string): AllowedPackageId {
  if (!rawPackageId) return "growth";
  const lower = String(rawPackageId).toLowerCase().trim();
  if (
    lower.includes("foundation") ||
    lower.includes("ignite") ||
    lower.includes("starter") ||
    lower.includes("9,999") ||
    lower.includes("9999") ||
    lower.includes("499")
  ) {
    return "foundation";
  }
  if (
    lower.includes("dominance") ||
    lower.includes("catalyst") ||
    lower.includes("scale") ||
    lower.includes("39,999") ||
    lower.includes("39999") ||
    lower.includes("1999") ||
    lower.includes("41,500") ||
    lower.includes("43,250") ||
    lower.includes("44,999") ||
    lower.includes("46,800") ||
    lower.includes("48,250")
  ) {
    return "dominance";
  }
  return "growth";
}

export function getHostingPlanConfig(packageId?: string): HostingPlanConfig {
  const norm = normalizePackageId(packageId);
  return HOSTING_PLAN_CONFIGS[norm] || HOSTING_PLAN_CONFIGS.growth;
}

export function getHostingPriceForPackage(packageOrCard?: any): number {
  if (!packageOrCard) return 999;
  if (typeof packageOrCard === "string") {
    return getHostingPlanConfig(packageOrCard).monthlyHostingPrice;
  }
  const str = `${packageOrCard.id || ""} ${packageOrCard.packageId || ""} ${packageOrCard.name || ""} ${packageOrCard.price || ""}`;
  return getHostingPlanConfig(str).monthlyHostingPrice;
}

export function getPlusPredefinedPrices(packageId: string): string[] {
  const id = String(packageId || "").toLowerCase();
  if (id.includes("foundation") || id.includes("ignite")) {
    return PLUS_PACKAGE_PREDEFINED_PRICES.foundation;
  }
  if (id.includes("dominance") || id.includes("catalyst")) {
    return PLUS_PACKAGE_PREDEFINED_PRICES.dominance;
  }
  return PLUS_PACKAGE_PREDEFINED_PRICES.growth;
}

export function getInitialPlusPackagePrice(packageId: string, fallbackDefault?: string): string {
  const prices = getPlusPredefinedPrices(packageId);
  const id = String(packageId || "").toLowerCase();
  const normalizedKey = id.includes("foundation") || id.includes("ignite")
    ? "foundation"
    : id.includes("dominance") || id.includes("catalyst")
      ? "dominance"
      : "growth";

  const storageKey = `codefuser_selected_plus_price_${normalizedKey}`;
  try {
    if (typeof sessionStorage !== 'undefined') {
      const saved = sessionStorage.getItem(storageKey);
      if (saved && prices.includes(saved)) {
        return saved;
      }
      // Randomly pick one of the 5 predefined prices for a new session
      const randomIndex = Math.floor(Math.random() * prices.length);
      const chosenPrice = prices[randomIndex];
      sessionStorage.setItem(storageKey, chosenPrice);
      return chosenPrice;
    }
  } catch {
    // ignore storage errors
  }
  return fallbackDefault && prices.includes(fallbackDefault) ? fallbackDefault : prices[0];
}

export function savePlusPackagePrice(packageId: string, price: string): void {
  const id = String(packageId || "").toLowerCase();
  const normalizedKey = id.includes("foundation") || id.includes("ignite")
    ? "foundation"
    : id.includes("dominance") || id.includes("catalyst")
      ? "dominance"
      : "growth";

  const storageKey = `codefuser_selected_plus_price_${normalizedKey}`;
  try {
    sessionStorage.setItem(storageKey, price);
    window.dispatchEvent(new CustomEvent('codefuser_plus_price_change', { detail: { packageId: normalizedKey, price } }));
  } catch (e) {
    console.error("Failed to save Plus price to sessionStorage:", e);
  }
}
