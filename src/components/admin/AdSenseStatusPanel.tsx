import React, { useState } from 'react';
import { DollarSign, Shield, CheckCircle2, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { getAdSenseStatus, ADSENSE_CONFIG, getFormattedAdsTxtPublisherId } from '../../config/adsenseConfig';

interface AdSenseStatusPanelProps {
  className?: string;
}

export const AdSenseStatusPanel: React.FC<AdSenseStatusPanelProps> = ({ className = '' }) => {
  const [copied, setCopied] = useState(false);
  const statusInfo = getAdSenseStatus();
  
  const adsTxtSnippet = statusInfo.isReadyForProduction
    ? `google.com, ${getFormattedAdsTxtPublisherId()}, DIRECT, f08c47fec0942fa0`
    : `# Google AdSense ads.txt - Pending Configuration\n# Once your real Publisher ID is provided, it will appear here as:\n# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`;

  const copyAdsTxt = () => {
    navigator.clipboard.writeText(adsTxtSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="adsense-status-panel" className={`rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${
              statusInfo.status === 'ENABLED'
                ? 'bg-emerald-400'
                : statusInfo.status === 'CONFIGURED'
                ? 'bg-amber-400'
                : 'bg-zinc-500'
            }`} />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              Monetization & Partner Infrastructure
            </span>
          </div>
          <h3 className="text-lg font-display font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign size={18} className="text-amber-400" />
            <span>Google AdSense Monetization Engine</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Centralized management for Google AdSense, auto ads, and <code className="text-amber-300 font-mono text-[11px]">ads.txt</code> verification.
          </p>
        </div>

        <a
          href="/ads.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-all self-start sm:self-center"
        >
          <span>View /ads.txt</span>
          <ExternalLink size={12} className="text-amber-400" />
        </a>
      </div>

      {/* 4 Status KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* AdSense Status */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/90 rounded-xl space-y-1">
          <span className="text-zinc-400 text-[10px] font-mono font-semibold uppercase tracking-wider block">
            AdSense Status
          </span>
          <div className="flex items-center gap-1.5 pt-1">
            <span className={`text-sm sm:text-base font-mono font-black ${
              statusInfo.status === 'ENABLED'
                ? 'text-emerald-400'
                : statusInfo.status === 'CONFIGURED'
                ? 'text-amber-400'
                : 'text-zinc-400'
            }`}>
              {statusInfo.status}
            </span>
          </div>
        </div>

        {/* Publisher ID */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/90 rounded-xl space-y-1">
          <span className="text-zinc-400 text-[10px] font-mono font-semibold uppercase tracking-wider block">
            Publisher ID
          </span>
          <div className="flex items-center gap-1.5 pt-1 truncate">
            <span className="text-xs sm:text-sm font-mono font-bold text-white truncate" title={statusInfo.maskedId}>
              {statusInfo.maskedId}
            </span>
          </div>
        </div>

        {/* Ads Toggle */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/90 rounded-xl space-y-1">
          <span className="text-zinc-400 text-[10px] font-mono font-semibold uppercase tracking-wider block">
            Ads Serving
          </span>
          <div className="flex items-center gap-1.5 pt-1">
            <span className={`text-sm sm:text-base font-mono font-black ${
              statusInfo.adsEnabled ? 'text-emerald-400' : 'text-zinc-400'
            }`}>
              {statusInfo.adsEnabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
        </div>

        {/* Journal Monetization */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/90 rounded-xl space-y-1">
          <span className="text-zinc-400 text-[10px] font-mono font-semibold uppercase tracking-wider block">
            Journal Monetization
          </span>
          <div className="flex items-center gap-1.5 pt-1">
            <span className={`text-sm sm:text-base font-mono font-black ${
              statusInfo.journalMonetization ? 'text-emerald-400' : 'text-zinc-400'
            }`}>
              {statusInfo.journalMonetization ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
        </div>
      </div>

      {/* Safety & Compliance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Protected Routing Guard */}
        <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-zinc-300 font-bold">
            <Shield size={14} className="text-emerald-400" />
            <span>Strict Private Route Isolation</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
            AdSense scripts and ad slots are strictly blocked on client dashboards, payment flows, mission control, and start-project forms.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {ADSENSE_CONFIG.excludedRoutePrefixes.map((prefix) => (
              <span key={prefix} className="px-2 py-0.5 rounded bg-zinc-950 border border-white/10 text-[10px] text-zinc-400">
                {prefix}
              </span>
            ))}
          </div>
        </div>

        {/* ads.txt Format & Sync */}
        <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-300 font-bold">
              <CheckCircle2 size={14} className="text-amber-400" />
              <span>Production ads.txt Record</span>
            </div>
            <button
              onClick={copyAdsTxt}
              className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-2.5 bg-black/60 border border-white/5 rounded-lg text-[10px] text-zinc-300 overflow-x-auto whitespace-pre font-mono">
            {adsTxtSnippet}
          </pre>
        </div>
      </div>

      {/* Production Guide Footnote */}
      <div className="text-[11px] font-mono text-zinc-500 bg-zinc-900/30 p-3 rounded-xl border border-white/5 flex items-start gap-2.5">
        <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-zinc-300 font-semibold">Production Setup Protocol:</p>
          <p className="text-zinc-400 font-sans leading-relaxed">
            When you receive your real publisher ID from Google AdSense, configure <code className="text-amber-300 font-mono text-[11px]">VITE_ADSENSE_PUBLISHER_ID=pub-XXXXXXXXXXXXXXXX</code> and <code className="text-amber-300 font-mono text-[11px]">VITE_ADSENSE_ENABLED=true</code> in your production environment. The automated pipeline will update <code className="text-amber-300 font-mono text-[11px]">ads.txt</code> and initialize Auto Ads across public Journal articles.
          </p>
        </div>
      </div>
    </div>
  );
};
