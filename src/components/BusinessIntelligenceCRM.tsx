import React, { useState, useEffect } from "react";
import { ProjectRecord } from "./dashboard/dashboardTypes";
import { getProjectCashCollected } from "../utils/moneyMetrics";
import { formatINR } from "../utils/formatters";
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Award, 
  Clock, 
  Activity, 
  FileText, 
  CheckCircle, 
  Sparkles, 
  ThumbsUp, 
  RefreshCw, 
  Shield, 
  Compass, 
  Layers,
  ChevronRight,
  Info
} from "lucide-react";

interface OpportunityItem {
  id: string;
  industry: string;
  city: string;
  searchKeyword: string;
  suggestedPackage: string;
  marketInsight: string;
  score?: number;
}

interface BusinessIntelligenceCRMProps {
  projects: ProjectRecord[];
  onSelectProject?: (projectId: string) => void;
}

export const BusinessIntelligenceCRM: React.FC<BusinessIntelligenceCRMProps> = ({ 
  projects,
  onSelectProject
}) => {
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"pipeline" | "opportunities">("pipeline");

  // Simulated SEO opportunities
  const [gscOpps, setGscOpps] = useState<OpportunityItem[]>([
    {
      id: "opp_chennai_restaurants",
      industry: "Restaurant",
      city: "Chennai",
      searchKeyword: "best restaurant websites chennai digital menu",
      suggestedPackage: "Fusion (₹19,999)",
      marketInsight: "High demand for contactless QR menus and online ordering in South Chennai."
    },
    {
      id: "opp_madurai_clinics",
      industry: "Healthcare & Clinic",
      city: "Madurai",
      searchKeyword: "dental clinic appointment booking website madurai",
      suggestedPackage: "Ignite (₹9,999)",
      marketInsight: "Growing need for WhatsApp-integrated patient booking portals."
    },
    {
      id: "opp_bangalore_architects",
      industry: "Architecture",
      city: "Bangalore",
      searchKeyword: "luxury interior architect portfolio website bangalore",
      suggestedPackage: "Catalyst (₹39,999)",
      marketInsight: "Premium high-resolution portfolio showcases for commercial design firms."
    }
  ]);

  useEffect(() => {
    if (gscOpps.length > 0 && !selectedOppId) {
      setSelectedOppId(gscOpps[0].id);
    }
  }, [gscOpps, selectedOppId]);

  const handleFounderAction = (action: "created" | "regenerated") => {
    if (action === "created") {
      setActionFeedback("Opportunity marked for landing page creation.");
    } else {
      setActionFeedback("Opportunity discarded. Generating alternative niches...");
    }
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // 1. CALCULATE AUTHORITATIVE CRM METRICS
  const totalLeads = projects.length;
  const paidProjects = projects.filter(p => p.paymentStatus === "paid" || p.paymentStatus === "partially_paid");
  const totalConverted = paidProjects.length;
  const conversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;
  const earnedRevenue = projects.reduce((acc, p) => acc + getProjectCashCollected(p), 0);

  // Active unearned pipeline valuation
  const activePipelineValue = projects.reduce((acc, p) => {
    if (p.paymentStatus === "paid") return acc;
    if (p.quote && typeof p.quote.price === "number") {
      return acc + Math.max(0, p.quote.price - (p.quote.discount || 0));
    }
    let basePkgPrice = 19999;
    if (p.selectedPackage === "foundation") basePkgPrice = 9999;
    if (p.selectedPackage === "dominance") basePkgPrice = 39999;
    return acc + basePkgPrice;
  }, 0);

  const averageCustomerValue = totalConverted > 0 ? earnedRevenue / totalConverted : 0;
  const leadsWithQuotes = projects.filter(p => !!p.quote);
  const totalQuoted = leadsWithQuotes.length;

  // Package distribution
  const pkgCounts = projects.reduce((acc, p) => {
    const pkg = p.selectedPackage || "growth";
    acc[pkg] = (acc[pkg] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const packagePopularity = [
    { id: "foundation", name: "Ignite", price: "₹9,999", count: pkgCounts["foundation"] || 0 },
    { id: "growth", name: "Fusion", price: "₹19,999", count: pkgCounts["growth"] || 0 },
    { id: "dominance", name: "Catalyst", price: "₹39,999", count: pkgCounts["dominance"] || 0 }
  ];

  // 4 Pipeline Stages
  const pipelineStages = [
    {
      name: "1. Inbound Diagnostic",
      description: "Diagnostic blueprints submitted",
      icon: <Activity size={14} className="text-neutral-400" />,
      projectsList: projects.filter(p => p.paymentStatus !== "paid" && !p.quote)
    },
    {
      name: "2. Quoted Leads",
      description: "Proposals formulated & pricing locked",
      icon: <FileText size={14} className="text-white" />,
      projectsList: projects.filter(p => p.paymentStatus !== "paid" && p.quote && p.quote.status !== "expired")
    },
    {
      name: "3. Customers Won",
      description: "Financial milestone settled",
      icon: <DollarSign size={14} className="text-emerald-400" />,
      projectsList: projects.filter(p => p.paymentStatus === "paid" && p.status !== "Ready" && p.status !== "Completed" && p.status !== "Live")
    },
    {
      name: "4. Delivered & Live",
      description: "Production deployed & handed over",
      icon: <CheckCircle size={14} className="text-white" />,
      projectsList: projects.filter(p => p.paymentStatus === "paid" && (p.status === "Ready" || p.status === "Completed" || p.status === "Live" || p.status === "Launched"))
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="crm-dashboard">
      
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold font-founder text-white tracking-wide">Marketing &amp; CRM</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Pipeline valuation, conversion rates, and plan demand.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveView("pipeline")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === "pipeline" 
                ? "bg-white text-black font-bold" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Layers size={13} />
            Pipeline &amp; Conversion
          </button>
          <button
            onClick={() => setActiveView("opportunities")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === "opportunities" 
                ? "bg-white text-black font-bold" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Compass size={13} />
            Opportunity Discovery
            <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-neutral-900 border border-white/10 text-neutral-400">
              Demo
            </span>
          </button>
        </div>
      </div>

      {activeView === "pipeline" ? (
        <div className="space-y-8">
          
          {/* 4 KPI TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Pipeline Valuation */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Pipeline</span>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {formatINR(activePipelineValue)}
                </h3>
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-1">
                  Potential Value
                </p>
              </div>
            </div>

            {/* KPI 2: Customers Won */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Customers Won</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Award size={16} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {totalConverted} <span className="text-sm font-normal text-neutral-400">/ {totalLeads}</span>
                </h3>
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-1">
                  Converted accounts
                </p>
              </div>
            </div>

            {/* KPI 3: Lead-to-Sale Conversion */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Conversion</span>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <Percent size={16} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {conversionRate.toFixed(1)}%
                </h3>
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-1">
                  Across all leads
                </p>
              </div>
            </div>

            {/* KPI 4: Average Contract Size (ACV) */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Average Contract</span>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {formatINR(averageCustomerValue)}
                </h3>
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-1">
                  Real revenue per client
                </p>
              </div>
            </div>

          </div>

          {/* LEAD PIPELINE MATRIX */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-founder font-bold text-white tracking-wide">
                Lead Pipeline Matrix
              </h3>
              <span className="text-[10px] font-mono text-neutral-500">
                Authoritative stage distribution
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pipelineStages.map((stage, idx) => {
                const stagePotentialVal = stage.projectsList.reduce((acc, p) => {
                  if (p.quote && typeof p.quote.price === "number") {
                    return acc + Math.max(0, p.quote.price - (p.quote.discount || 0));
                  }
                  let fallback = 19999;
                  if (p.selectedPackage === "foundation") fallback = 9999;
                  if (p.selectedPackage === "dominance") fallback = 39999;
                  return acc + fallback;
                }, 0);

                return (
                  <div 
                    key={idx} 
                    className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[180px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                          {stage.icon} {stage.name}
                        </span>
                        <span className="text-[10px] font-mono bg-neutral-900 border border-white/10 text-white px-2 py-0.5 rounded-full font-bold">
                          {stage.projectsList.length}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-sans mb-3">
                        {stage.description}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-3 mt-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                        <span>Potential Value:</span>
                        <span className="text-xs font-bold text-white">{formatINR(stagePotentialVal)}</span>
                      </div>

                      {/* Mini list of projects */}
                      <div className="mt-2.5 space-y-1 max-h-[100px] overflow-y-auto pr-1">
                        {stage.projectsList.length === 0 ? (
                          <span className="text-[10px] font-mono text-neutral-600 italic block py-1">No projects in this stage</span>
                        ) : (
                          stage.projectsList.map(p => (
                            <button
                              key={p.id}
                              onClick={() => onSelectProject && onSelectProject(p.id)}
                              className="w-full text-left p-1.5 rounded-lg bg-neutral-950 hover:bg-white hover:text-black border border-white/5 text-[11px] text-neutral-300 font-sans flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="truncate max-w-[130px] font-medium">{p.businessName || "Unnamed"}</span>
                              <ChevronRight size={11} className="shrink-0 opacity-50" />
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC FUNNEL & PACKAGE SPREAD */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Conversion Funnel */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xl font-founder font-bold text-white tracking-wide">
                  Sales Funnel
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">Pipeline Flow</span>
              </div>

              <div className="space-y-3">
                {/* Step 1: Inbound */}
                <div className="bg-neutral-950 border border-white/10 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-neutral-400 font-medium">1. Inbound Diagnostics</span>
                    <span className="text-white font-bold">{totalLeads} Leads</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                {/* Step 2: Quoted */}
                <div className="bg-neutral-950 border border-white/10 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-neutral-400 font-medium">2. Quoted Proposals</span>
                    <span className="text-white font-bold">{totalQuoted} Quotes</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-neutral-400 rounded-full" 
                      style={{ width: `${totalLeads > 0 ? (totalQuoted / totalLeads) * 100 : 0}%` }} 
                    />
                  </div>
                </div>

                {/* Step 3: Customers Won */}
                <div className="bg-neutral-950 border border-white/10 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-neutral-400 font-medium">3. Customers Won</span>
                    <span className="text-emerald-400 font-bold">{totalConverted} Accounts ({conversionRate.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full" 
                      style={{ width: `${conversionRate}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Package Interest Spread */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xl font-founder font-bold text-white tracking-wide">
                  Popular Plans
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">Tier Distribution</span>
              </div>

              <div className="space-y-3">
                {packagePopularity.map((pkg) => {
                  const pct = totalLeads > 0 ? (pkg.count / totalLeads) * 100 : 0;
                  return (
                    <div key={pkg.id} className="bg-neutral-950 border border-white/10 p-3.5 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-white font-medium">{pkg.name} ({pkg.price})</span>
                        <span className="text-neutral-300 font-bold">{pkg.count} selections ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* OPPORTUNITY & SEO DISCOVERY (CLEARLY LABELED DEMO / SIMULATED INTEL) */
        <div className="space-y-6">
          
          {/* Informational Disclaimer Banner */}
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-4 flex items-start gap-3 text-xs text-neutral-400">
            <Info size={16} className="text-white shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white font-mono uppercase block text-[10px]">Market Exploration Environment</span>
              <span>
                Simulated niche demand discovery. Review search opportunities and formulate targeted landing pages for local business verticals.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Opportunity List (5 Col) */}
            <div className="lg:col-span-5 space-y-2.5">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                Discovered Opportunities
              </span>

              {gscOpps.map((opp) => {
                const isSelected = selectedOppId === opp.id;
                return (
                  <button
                    key={opp.id}
                    onClick={() => setSelectedOppId(opp.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                      isSelected 
                        ? "bg-white/10 border-white/30 text-white" 
                        : "bg-[#0A0A0A] border-white/10 text-neutral-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{opp.industry} — {opp.city}</span>
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        High Intent
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 font-mono truncate">
                      &ldquo;{opp.searchKeyword}&rdquo;
                    </p>
                    <div className="text-[10px] font-mono text-neutral-500 mt-2 flex justify-between">
                      <span>Package: {opp.suggestedPackage}</span>
                      <span className="text-white font-medium">Inspect →</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Opportunity Review & Decision (7 Col) */}
            <div className="lg:col-span-7 bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              {selectedOppId && gscOpps.find(o => o.id === selectedOppId) ? (
                (() => {
                  const currentOpp = gscOpps.find(o => o.id === selectedOppId)!;
                  return (
                    <>
                      <div className="space-y-2 border-b border-white/10 pb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                            Opportunity Briefing
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Verified Market Need
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white font-display">
                          {currentOpp.industry} Websites — {currentOpp.city}
                        </h3>
                        <p className="text-xs text-neutral-400 font-mono">
                          Target Keyword: &ldquo;{currentOpp.searchKeyword}&rdquo;
                        </p>
                      </div>

                      {/* Why this opportunity */}
                      <div className="bg-neutral-950 border border-white/10 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                          Why This Opportunity?
                        </span>
                        <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                          {currentOpp.marketInsight}
                        </p>
                        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 pt-2 border-t border-white/5">
                          <span>Suggested Tier: <strong className="text-white">{currentOpp.suggestedPackage}</strong></span>
                          <span>Potential: <strong className="text-emerald-400">High</strong></span>
                        </div>
                      </div>

                      {/* Decision buttons */}
                      <div className="border-t border-white/10 pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-neutral-400 font-bold">
                            Should we create this landing page?
                          </span>
                          {actionFeedback && (
                            <span className="text-xs font-mono text-emerald-400 font-bold animate-fade-in">
                              {actionFeedback}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleFounderAction("created")}
                            className="py-3 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                          >
                            <ThumbsUp size={14} />
                            YES — Create Page
                          </button>
                          <button
                            onClick={() => handleFounderAction("regenerated")}
                            className="py-3 bg-neutral-950 hover:bg-neutral-900 border border-white/10 text-neutral-300 text-xs font-mono rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                          >
                            <RefreshCw size={14} />
                            NO — Next Opportunity
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()
              ) : (
                <div className="py-12 text-center text-xs font-mono text-neutral-500">
                  Select an opportunity on the left to review.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
