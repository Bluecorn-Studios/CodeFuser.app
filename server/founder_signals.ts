/**
 * Founder Training & Preference Feedback Loop
 * Tracks founder decisions:
 * - Approved pages
 * - Rejected pages
 * - Regenerated pages
 * - Published pages
 * Adjusts intelligence weights dynamically over time.
 */

export interface FounderAction {
  id: string;
  type: "approved" | "rejected" | "regenerated" | "published";
  industry: string;
  city: string;
  packageType: string;
  timestamp: string;
  notes?: string;
}

export interface FounderPreferenceProfile {
  favoredIndustries: Record<string, number>;
  rejectedIndustries: Record<string, number>;
  approvedCount: number;
  rejectedCount: number;
  publishedCount: number;
}

// In-memory founder feedback repository
const founderActionsLog: FounderAction[] = [
  { id: "init-1", type: "approved", industry: "restaurant", city: "Chennai", packageType: "Fusion", timestamp: new Date().toISOString() },
  { id: "init-2", type: "approved", industry: "clinic", city: "Chennai", packageType: "Ignite", timestamp: new Date().toISOString() },
  { id: "init-3", type: "approved", industry: "salon", city: "Chennai", packageType: "Ignite", timestamp: new Date().toISOString() },
  { id: "init-4", type: "approved", industry: "photo studio", city: "Chennai", packageType: "Fusion", timestamp: new Date().toISOString() },
  { id: "init-5", type: "rejected", industry: "generic directory", city: "Chennai", packageType: "Ignite", timestamp: new Date().toISOString() }
];

export function recordFounderAction(action: Omit<FounderAction, "id" | "timestamp">) {
  const newRecord: FounderAction = {
    ...action,
    id: `fa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString()
  };
  founderActionsLog.push(newRecord);
  return newRecord;
}

export function getFounderProfile(): FounderPreferenceProfile {
  const profile: FounderPreferenceProfile = {
    favoredIndustries: {},
    rejectedIndustries: {},
    approvedCount: 0,
    rejectedCount: 0,
    publishedCount: 0
  };

  founderActionsLog.forEach((act) => {
    const indKey = (act.industry || "general").toLowerCase();
    if (act.type === "approved" || act.type === "published") {
      profile.approvedCount++;
      if (act.type === "published") profile.publishedCount++;
      profile.favoredIndustries[indKey] = (profile.favoredIndustries[indKey] || 0) + 1;
    } else if (act.type === "rejected") {
      profile.rejectedCount++;
      profile.rejectedIndustries[indKey] = (profile.rejectedIndustries[indKey] || 0) + 1;
    }
  });

  return profile;
}

/**
 * Calculates a deterministic Founder Confidence Score (0-100)
 * based on whether the industry/city/package aligns with founder's historical approval patterns.
 */
export function calculateFounderConfidenceScore(industry: string, packageType: string): number {
  const profile = getFounderProfile();
  const indKey = (industry || "").toLowerCase();

  const approvalCount = profile.favoredIndustries[indKey] || 0;
  const rejectionCount = profile.rejectedIndustries[indKey] || 0;

  let baseScore = 75; // neutral baseline

  if (approvalCount > 0) {
    baseScore += Math.min(20, approvalCount * 5);
  }

  if (rejectionCount > 0) {
    baseScore -= Math.min(30, rejectionCount * 10);
  }

  // Bonus for core target industries (Restaurant, Clinic, Salon, Gym, Photo Studio, Law)
  const coreTarget = ["restaurant", "clinic", "dental", "salon", "spa", "gym", "photo", "studio", "law", "attorney"];
  if (coreTarget.some((target) => indKey.includes(target))) {
    baseScore += 5;
  }

  return Math.min(100, Math.max(30, Math.round(baseScore)));
}
