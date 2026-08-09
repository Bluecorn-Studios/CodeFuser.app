import React from "react";
import { Check, UploadCloud, FileText, Layers, Globe, ArrowRight, Clock, AlertCircle, Sparkles, Image as ImageIcon, Building2, Upload, ChevronRight } from "lucide-react";
import { ProjectRecord, ExtraStore } from "./dashboardTypes";
import { AssetStepKey } from "./OnboardingAssetModal";

interface MyProjectTabProps {
  project: ProjectRecord;
  currentStageIndex: number;
  customerTimelineStages: Array<{ label: string; details?: string; desc?: string }>;
  getCustomerStatusLabel: (index: number) => string;
  extraStore: ExtraStore;
  handleUpdateAssetField: (field: string, val: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadStatus: string | null;
  uploadProgress: number | null;
  uploadError: string | null;
  domainState: "provided" | "help" | "not_required" | "pending";
  logoState: "provided" | "help" | "not_required" | "pending";
  copyState: "provided" | "help" | "not_required" | "pending";
  domainInput: string;
  setDomainInput: (v: string) => void;
  logoInput: string;
  setLogoInput: (v: string) => void;
  copyInput: string;
  setCopyInput: (v: string) => void;
  isUpdatingField: string | null;
  btnClass: (active: boolean) => string;
  onOpenAssetModal?: (stepKey?: AssetStepKey) => void;
}

export const MyProjectTab: React.FC<MyProjectTabProps> = ({
  project,
  currentStageIndex,
  customerTimelineStages,
  getCustomerStatusLabel,
  extraStore,
  handleUpdateAssetField,
  handleFileUpload,
  uploadStatus,
  uploadProgress,
  uploadError,
  domainState,
  logoState,
  copyState,
  domainInput,
  setDomainInput,
  logoInput,
  setLogoInput,
  copyInput,
  setCopyInput,
  isUpdatingField,
  onOpenAssetModal,
}) => {
  return (
    <div className="space-y-8 py-2">
      {/* SECTION HEADER */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block">
          Website Creation
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Your Website Progress
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Follow your website progress step-by-step and share your business details with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Human Timeline */}
        <div className="space-y-6">
          <section className="p-5 sm:p-7 bg-neutral-950 border border-neutral-800/80 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe size={18} className="text-neutral-400" />
                <span>Website Creation Stages</span>
              </h2>
              <span className="text-xs font-semibold text-neutral-400 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                Stage {currentStageIndex + 1} of 6
              </span>
            </div>

            <div className="relative pl-6 space-y-6 font-sans">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-neutral-900" />

              {customerTimelineStages.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isActive = idx === currentStageIndex;

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-[24px] top-1 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-emerald-400 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                          : isActive
                          ? "bg-white border-white shadow-[0_0_12px_rgba(255,255,255,0.5)] scale-110"
                          : "bg-neutral-950 border-neutral-800"
                      }`}
                    />

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span
                          className={`text-sm font-bold ${
                            isActive ? "text-white" : isCompleted ? "text-neutral-300" : "text-neutral-500"
                          }`}
                        >
                          {stage.label}
                        </span>
                        {isCompleted && (
                          <span className="text-xs font-semibold text-emerald-400">✓ Completed</span>
                        )}
                        {isActive && (
                          <span className="text-xs font-semibold text-white animate-pulse">
                            ● Active Stage
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{stage.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Approved Plan & Scope */}
          {extraStore.quote?.proposal && (
            <section className="p-5 sm:p-7 bg-neutral-950 border border-neutral-800/80 rounded-3xl space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-neutral-400" />
                  Approved Website Plan
                </h3>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                  Confirmed
                </span>
              </div>

              <div className="p-4 bg-black/60 rounded-2xl border border-neutral-800 max-h-[220px] overflow-y-auto text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {extraStore.quote.proposal.content}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Easy Setup Wizard Launchpad */}
        <div className="space-y-6">
          <section id="information-request-center" className="p-5 sm:p-8 bg-neutral-950 border border-neutral-800/80 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-mono font-bold uppercase tracking-widest">
                <Sparkles size={13} />
                <span>Simple Setup Guide</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Share Your Business Details
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Send your website photos, logo, contact info, or shop details in 5 easy steps. You can also ask our team to write or design anything for you!
              </p>
            </div>

            {/* Steps Preview Grid */}
            <div className="p-4 sm:p-5 bg-black/60 border border-neutral-800/80 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                5 Simple Steps
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
                <div className="flex items-center gap-2.5 p-2.5 bg-neutral-900/60 rounded-xl border border-neutral-850">
                  <span className="h-5 w-5 rounded-lg bg-white/10 text-white font-mono font-extrabold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span className="font-medium text-neutral-200">Website Address (Domain)</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-neutral-900/60 rounded-xl border border-neutral-850">
                  <span className="h-5 w-5 rounded-lg bg-white/10 text-white font-mono font-extrabold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span className="font-medium text-neutral-200">Logo or Shop Sign</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-neutral-900/60 rounded-xl border border-neutral-850">
                  <span className="h-5 w-5 rounded-lg bg-white/10 text-white font-mono font-extrabold text-[10px] flex items-center justify-center shrink-0">3</span>
                  <span className="font-medium text-neutral-200">Services & Price List</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-neutral-900/60 rounded-xl border border-neutral-850">
                  <span className="h-5 w-5 rounded-lg bg-white/10 text-white font-mono font-extrabold text-[10px] flex items-center justify-center shrink-0">4</span>
                  <span className="font-medium text-neutral-200">Phone & Address</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-neutral-900/60 rounded-xl border border-neutral-850 sm:col-span-2">
                  <span className="h-5 w-5 rounded-lg bg-white/10 text-white font-mono font-extrabold text-[10px] flex items-center justify-center shrink-0">5</span>
                  <span className="font-medium text-neutral-200">Shop Photos & Requests</span>
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            {onOpenAssetModal && (
              <button
                type="button"
                onClick={() => onOpenAssetModal("1")}
                className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01]"
              >
                <Sparkles size={16} />
                <span>Open 5-Step Setup Guide</span>
                <ChevronRight size={16} />
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

