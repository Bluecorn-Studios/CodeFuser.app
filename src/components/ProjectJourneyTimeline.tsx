import React from "react";
import { ProjectRecord } from "./dashboard/dashboardTypes";
import { formatINR, formatDateSafe, formatDateTimeSafe, formatPaymentMethod, formatPaymentReference } from "../utils/formatters";
import { FileText, CheckCircle2, Clock, Shield, AlertCircle } from "lucide-react";

interface ProjectJourneyTimelineProps {
  project: ProjectRecord;
}

export const ProjectJourneyTimeline: React.FC<ProjectJourneyTimelineProps> = ({ project }) => {
  if (!project) return null;

  const isPaid = project.paymentStatus === "paid";
  const isPartiallyPaid = project.paymentStatus === "partially_paid";
  const hasQuote = !!project.quote;
  const hasAssets = !!(project.assets && project.assets.length > 0);
  const isLive = project.status === "Live" || project.status === "Launched" || project.launchStatus === "LAUNCHED" || project.status === "delivered" || project.status === "completed";
  const isDraft = project.status === "draft" || project.status === "Incomplete" || project.status === "Pending Details";

  return (
    <div className="bg-[#050505] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Client Journey & Milestone History</span>
          <h4 className="text-sm font-bold text-white mt-0.5">{project.businessName || "Unnamed Client"}</h4>
          <span className="text-xs text-neutral-400 mt-0.5 block font-mono">
            Contact: {project.clientName} ({project.email || project.whatsapp || "No contact info"})
          </span>
        </div>
        <div className="sm:text-right font-mono">
          <span className="text-[9px] text-neutral-500 uppercase block tracking-wider">Current Milestone</span>
          <span className={`text-xs font-bold uppercase mt-0.5 inline-block px-2.5 py-0.5 rounded border ${
            isLive 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : isPaid 
              ? "bg-white/10 border-white/20 text-white" 
              : "bg-neutral-900 border-white/10 text-neutral-400"
          }`}>
            {project.status || "In Progress"}
          </span>
        </div>
      </div>

      {/* 5-Step Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
        
        {/* Step 1: Inbound Lead & Diagnostic */}
        <div className="relative">
          <div className={`absolute left-[-20px] top-1.5 h-3.5 w-3.5 rounded-full border ${
            isDraft 
              ? "bg-neutral-900 border-neutral-700" 
              : "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
          }`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-white">1. Diagnostic Blueprint Submitted</span>
              <span className={`text-[9px] font-mono ${isDraft ? "text-neutral-500" : "text-emerald-400"}`}>
                {isDraft ? "Draft / In Progress" : "✓ Completed"}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Package choice: <strong className="text-white uppercase font-mono">{String(project.selectedPackage || "Standard")}</strong>.
            </p>
            <div className="mt-2 bg-neutral-950 border border-white/10 p-2.5 rounded-xl text-[11px] text-neutral-400 flex flex-wrap gap-x-4 gap-y-1.5">
              <span><strong>Industry:</strong> {project.industry || "Not specified"}</span>
              <span><strong>Goal:</strong> {project.goal || "Not specified"}</span>
              <span><strong>Has Logo:</strong> {project.hasLogo || "No"}</span>
              <span><strong>Has Domain:</strong> {project.hasDomain || "No"}</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono mt-1.5 block">
              Received: {formatDateTimeSafe(project.timestamp)}
            </span>
          </div>
        </div>

        {/* Step 2: Custom Quotation Agreement */}
        <div className="relative">
          <div className={`absolute left-[-20px] top-1.5 h-3.5 w-3.5 rounded-full border ${
            hasQuote 
              ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
              : "bg-neutral-900 border-neutral-700"
          }`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-white">2. Quotation Agreement Sent</span>
              <span className={`text-[9px] font-mono ${hasQuote ? "text-emerald-400" : "text-neutral-500"}`}>
                {hasQuote ? "✓ Completed" : "Pending Action"}
              </span>
            </div>

            {hasQuote && project.quote ? (
              <div className="mt-2 space-y-2 bg-neutral-950 border border-white/10 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">Locked Package</span>
                    <strong className="text-white">{project.quote.packageName || "Custom Spec"}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">Guaranteed Rate</span>
                    <strong className="text-emerald-400 font-mono">
                      {formatINR(typeof project.quote.price === "number" ? project.quote.price - (project.quote.discount || 0) : null, "Price not set")}
                    </strong>
                  </div>
                </div>
                {project.quote.summary && (
                  <p className="text-[11px] text-neutral-400 italic bg-black/40 p-2 rounded-lg border border-white/5">
                    &ldquo;{project.quote.summary}&rdquo;
                  </p>
                )}
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-neutral-500">
                  <span>Status: <strong className="text-neutral-300 uppercase">{project.quote.status || "Active"}</strong></span>
                  <span>Discount: <strong className="text-neutral-300">{formatINR(project.quote.discount || 0)}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 mt-1">
                No custom quote agreement created yet. Use the Quote Lock section to set guaranteed rates.
              </p>
            )}
          </div>
        </div>

        {/* Step 3: Financial Settlement */}
        <div className="relative">
          <div className={`absolute left-[-20px] top-1.5 h-3.5 w-3.5 rounded-full border ${
            isPaid || isPartiallyPaid 
              ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
              : "bg-neutral-900 border-neutral-700"
          }`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-white">3. Payment Settlement</span>
              <span className={`text-[9px] font-mono ${isPaid ? "text-emerald-400" : isPartiallyPaid ? "text-white" : "text-neutral-500"}`}>
                {isPaid ? "✓ 100% Settled" : isPartiallyPaid ? "✓ 50% Milestone Paid" : "Awaiting Payment"}
              </span>
            </div>

            {isPaid || isPartiallyPaid ? (
              <div className="mt-2 bg-neutral-950 border border-white/10 p-3 rounded-xl text-xs font-mono space-y-1.5 text-neutral-400">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="text-white font-bold">{formatPaymentMethod(project)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="text-neutral-300">{formatPaymentReference(project)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="text-neutral-300">{project.purchasedPlan || project.selectedPackage || "Standard"}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1 text-[11px]">
                  <span>Payment Date:</span>
                  <span className="text-neutral-300">{formatDateSafe(project.purchaseDate || project.timestamp)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 mt-1">
                Awaiting customer checkout or milestone invoice clearance.
              </p>
            )}
          </div>
        </div>

        {/* Step 4: Asset & Deliverables Exchange */}
        <div className="relative">
          <div className={`absolute left-[-20px] top-1.5 h-3.5 w-3.5 rounded-full border ${
            hasAssets 
              ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
              : "bg-neutral-900 border-neutral-700"
          }`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-white">4. Asset Uploads &amp; Brief</span>
              <span className={`text-[9px] font-mono ${hasAssets ? "text-emerald-400" : "text-neutral-500"}`}>
                {hasAssets ? `✓ ${project.assets?.length} Files Uploaded` : "Pending Assets"}
              </span>
            </div>

            {hasAssets && project.assets ? (
              <div className="mt-2 bg-neutral-950 border border-white/10 rounded-xl divide-y divide-white/5 overflow-hidden">
                {project.assets.map(asset => (
                  <div key={asset.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={12} className="text-neutral-400 shrink-0" />
                      <span className="text-white truncate font-medium">{asset.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                      {(asset.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 mt-1">
                No assets uploaded by client yet. Assets will appear here once uploaded in their portal.
              </p>
            )}
          </div>
        </div>

        {/* Step 5: QA, Launch & Live Handover */}
        <div className="relative">
          <div className={`absolute left-[-20px] top-1.5 h-3.5 w-3.5 rounded-full border ${
            isLive 
              ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
              : "bg-neutral-900 border-neutral-700"
          }`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-white">5. Deployment &amp; Live Handover</span>
              <span className={`text-[9px] font-mono ${isLive ? "text-emerald-400" : "text-neutral-500"}`}>
                {isLive ? "✓ Live & Handed Over" : "In Development"}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Production status: <strong className="text-white font-mono">{project.status || "In Progress"}</strong>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
