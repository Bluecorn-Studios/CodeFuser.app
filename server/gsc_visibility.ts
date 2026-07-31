/**
 * Google Search Console (GSC) & Organic Market Intelligence Engine
 * Identifies search opportunities, high impressions, low CTR gaps,
 * and regional market demand across Chennai, Tamil Nadu & India.
 * Answers the core brand directive: "Where is CodeFuser invisible today?"
 */

export interface GSCOpportunitySignal {
  id: string;
  industry: string;
  city: string;
  searchKeyword: string;
  monthlySearchVolume: number;
  impressions: number;
  ctrPercent: number;
  visibilityGap: "High" | "Medium" | "Critical";
  suggestedPackage: "Ignite" | "Fusion" | "Catalyst";
  marketInsight: string;
}

const GSC_DEMAND_DATABASE: GSCOpportunitySignal[] = [
  {
    id: "gsc-1",
    industry: "Restaurant & Cafe",
    city: "Chennai",
    searchKeyword: "website design for restaurant in chennai",
    monthlySearchVolume: 3200,
    impressions: 14500,
    ctrPercent: 1.8,
    visibilityGap: "Critical",
    suggestedPackage: "Ignite",
    marketInsight: "High search volume in Anna Nagar, T. Nagar & Adyar for online digital menus and table reservations."
  },
  {
    id: "gsc-2",
    industry: "Dental & Medical Clinic",
    city: "Chennai",
    searchKeyword: "clinic website developer chennai",
    monthlySearchVolume: 2800,
    impressions: 12200,
    ctrPercent: 2.2,
    visibilityGap: "Critical",
    suggestedPackage: "Ignite",
    marketInsight: "Patients actively search for online doctor profiles and instant appointment booking."
  },
  {
    id: "gsc-3",
    industry: "Beauty Salon & Spa",
    city: "Chennai",
    searchKeyword: "salon website design chennai",
    monthlySearchVolume: 2400,
    impressions: 9800,
    ctrPercent: 2.5,
    visibilityGap: "High",
    suggestedPackage: "Ignite",
    marketInsight: "Strong demand for price package menus and direct WhatsApp booking."
  },
  {
    id: "gsc-4",
    industry: "Photography Studio",
    city: "Chennai",
    searchKeyword: "photo studio website builder chennai",
    monthlySearchVolume: 1900,
    impressions: 8100,
    ctrPercent: 1.5,
    visibilityGap: "Critical",
    suggestedPackage: "Fusion",
    marketInsight: "High demand for client portfolio galleries and session package rate cards."
  },
  {
    id: "gsc-5",
    industry: "Fitness Gym & Yoga",
    city: "Chennai",
    searchKeyword: "gym website development chennai",
    monthlySearchVolume: 1600,
    impressions: 6700,
    ctrPercent: 2.1,
    visibilityGap: "High",
    suggestedPackage: "Ignite",
    marketInsight: "Searchers look for trial pass forms, trainer profiles, and class schedules."
  },
  {
    id: "gsc-6",
    industry: "Law Firm & Legal Advocates",
    city: "Chennai",
    searchKeyword: "advocate website developer chennai",
    monthlySearchVolume: 1200,
    impressions: 5400,
    ctrPercent: 2.8,
    visibilityGap: "High",
    suggestedPackage: "Fusion",
    marketInsight: "Strong intent for legal consultation request forms and practice area guides."
  }
];

export function getGSCOpportunities(industry?: string, city: string = "Chennai"): GSCOpportunitySignal[] {
  if (!industry) {
    return GSC_DEMAND_DATABASE;
  }

  const query = industry.toLowerCase();
  const matched = GSC_DEMAND_DATABASE.filter((item) =>
    item.industry.toLowerCase().includes(query) || query.includes(item.industry.toLowerCase())
  );

  return matched.length > 0 ? matched : GSC_DEMAND_DATABASE;
}

export function getGSCMarketInsight(industry: string, city: string = "Chennai"): string {
  const opps = getGSCOpportunities(industry, city);
  if (opps.length > 0) {
    return opps[0].marketInsight;
  }
  return `Strong search demand in ${city} for local businesses looking to show their services and increase customer trust.`;
}
