export const PLUS_PACKAGE_PREDEFINED_PRICES: Record<string, string[]> = {
  foundation: ["₹8,450", "₹9,250", "₹9,999", "₹10,250", "₹11,500"],
  growth: ["₹20,250", "₹20,999", "₹21,500", "₹22,250", "₹22,900"],
  dominance: ["₹41,500", "₹43,250", "₹44,999", "₹46,800", "₹48,250"]
};

export function getPlusPredefinedPrices(packageId: string): string[] {
  const id = (packageId || "").toLowerCase();
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
  const id = (packageId || "").toLowerCase();
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
  const id = (packageId || "").toLowerCase();
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
