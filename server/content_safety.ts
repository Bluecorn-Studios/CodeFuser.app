/**
 * Legal & Content Safety Engine
 * Enforces strict compliance:
 * - NO real business/company names
 * - NO comparison ranking claims ("Top X Dental Clinics", "Best Restaurant in Chennai")
 * - Sanitizes title/headlines to compliant generic industry visibility terms ("Website Solutions for Dental Clinics in Chennai")
 */

// Forbidden real business names and illegal ranking patterns
const BANNED_RANKING_PATTERNS = [
  /top\s+\d+\s+/i,
  /best\s+(clinic|restaurant|salon|gym|studio|lawyer|doctor)\s+in/i,
  /#1\s+(rated|ranked)/i,
  /vs\s+[A-Z][a-z]+/i,
  /compared\s+to/i
];

const BANNED_SPECIFIC_BRANDS = [
  "Apollo", "Fortis", "Manipal", "KFC", "McDonalds", "Starbucks", 
  "Dominos", "Naturals", "VLCC", "Gold's Gym", "Cult.fit"
];

export interface SafetyCheckResult {
  isSafe: boolean;
  sanitizedText: string;
  violations: string[];
}

export function enforceContentSafety(text: string): SafetyCheckResult {
  if (!text) {
    return { isSafe: true, sanitizedText: "", violations: [] };
  }

  let sanitized = text;
  const violations: string[] = [];

  // Check banned ranking claims
  BANNED_RANKING_PATTERNS.forEach((pattern) => {
    if (pattern.test(sanitized)) {
      violations.push(`Found comparative/ranking phrase matching pattern: ${pattern}`);
      sanitized = sanitized.replace(pattern, "Website & Growth Solutions for ");
    }
  });

  // Check real specific brand names
  BANNED_SPECIFIC_BRANDS.forEach((brand) => {
    const regex = new RegExp(`\\b${brand}\\b`, "gi");
    if (regex.test(sanitized)) {
      violations.push(`Mentioned specific real business name: ${brand}`);
      sanitized = sanitized.replace(regex, "Local Business");
    }
  });

  return {
    isSafe: violations.length === 0,
    sanitizedText: sanitized,
    violations
  };
}

/**
 * Format a compliant opportunity title
 */
export function formatCompliantTitle(industry: string, city: string = "Chennai"): string {
  const cleanInd = industry.replace(/top|best|#1|vs/gi, "").trim();
  return `Website & Growth Solutions for ${cleanInd || "Local Businesses"} in ${city}`;
}
