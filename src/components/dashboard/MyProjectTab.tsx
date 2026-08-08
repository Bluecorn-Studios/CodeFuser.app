import React from "react";
import { Check, UploadCloud, FileText, Layers, Sparkles, Globe, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { ProjectRecord, ExtraStore } from "./dashboardTypes";

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
  btnClass,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. SECTION HEADER */}
      <div className="bg-black border border-neutral-900 rounded-3xl p-6">
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold block mb-1">
          Project Center
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight uppercase">
          {project.businessName} Website Roadmap
        </h2>
        <p className="text-xs text-neutral-400 mt-1 font-sans">
          Track live project milestones, provide required information, and review your website setup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Milestone Progress */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <Layers size={14} className="text-amber-500" />
                Website Timeline
              </h3>
              <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase font-bold">
                Phase {currentStageIndex + 1} of 6
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
                          ? "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          : isActive
                          ? "bg-amber-500 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-110"
                          : "bg-[#030303] border-neutral-800"
                      }`}
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold tracking-wide ${
                            isActive ? "text-amber-400 font-black" : isCompleted ? "text-neutral-200" : "text-neutral-600"
                          }`}
                        >
                          {stage.label}
                        </span>
                        {isCompleted && (
                          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">Completed</span>
                        )}
                        {isActive && (
                          <span className="text-[9px] font-mono text-amber-400 font-bold uppercase animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed font-sans">{stage.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Approved Proposal / Blueprint */}
          {extraStore.quote?.proposal && (
            <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <FileText size={14} className="text-emerald-400" />
                  Website Blueprint & Scope
                </h3>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
                  Approved Scope
                </span>
              </div>

              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-900 max-h-[220px] overflow-y-auto text-xs text-neutral-300 font-sans leading-relaxed whitespace-pre-wrap">
                {extraStore.quote.proposal.content}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Asset Submission Center */}
        <div className="space-y-6">
          <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <UploadCloud size={15} className="text-amber-500" />
                Things We Need From You
              </h3>
              <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold">Client Intake</span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              To launch your website quickly, provide your domain, logo, and business texts below. If you don't have them, select "Need Help" and CodeFuser will assist you.
            </p>

            <div className="space-y-6 font-sans">
              {/* Field 1: Domain */}
              <div className="space-y-2 border-b border-neutral-900 pb-4">
                <label className="block text-[10px] font-mono font-bold uppercase text-neutral-300 tracking-wider">
                  1. Website Domain Name (e.g. mybusiness.com)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateAssetField("domain", "no");
                      setDomainInput("");
                    }}
                    className={btnClass(domainState === "pending")}
                  >
                    Incomplete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateAssetField("domain", "help")}
                    className={btnClass(domainState === "help")}
                  >
                    Need Help
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateAssetField("domain", "not_required")}
                    className={btnClass(domainState === "not_required")}
                  >
                    Not Required
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="Enter your domain address..."
                    className="flex-1 bg-neutral-950 border border-neutral-900 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!domainInput.trim()) {
                        alert("Please enter domain name or select 'Need Help'.");
                        return;
                      }
                      handleUpdateAssetField("domain", domainInput.startsWith("Provided") ? domainInput : `Provided: ${domainInput}`);
                    }}
                    disabled={isUpdatingField === "domain"}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    {isUpdatingField === "domain" ? "..." : "Save"}
                  </button>
                </div>

                {domainState === "help" && (
                  <p className="text-[11px] text-amber-400 font-sans bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                    💡 Requested Help: Our team will help you buy and register your custom domain.
                  </p>
                )}
                {domainState === "provided" && (
                  <p className="text-[11px] text-emerald-400 font-sans bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                    ✓ Domain Submitted: {project.hasDomain}
                  </p>
                )}
              </div>

              {/* Field 2: Logo */}
              <div className="space-y-2 border-b border-neutral-900 pb-4">
                <label className="block text-[10px] font-mono font-bold uppercase text-neutral-300 tracking-wider">
                  2. Business Logo & Brand Photos (Google Drive / Link)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateAssetField("logo", "no");
                      setLogoInput("");
                    }}
                    className={btnClass(logoState === "pending")}
                  >
                    Incomplete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateAssetField("logo", "help")}
                    className={btnClass(logoState === "help")}
                  >
                    Need Help
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateAssetField("logo", "not_required")}
                    className={btnClass(logoState === "not_required")}
                  >
                    Not Required
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={logoInput}
                    onChange={(e) => setLogoInput(e.target.value)}
                    placeholder="Paste Google Drive / Dropbox link..."
                    className="flex-1 bg-neutral-950 border border-neutral-900 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!logoInput.trim()) {
                        alert("Please paste link or select 'Need Help'.");
                        return;
                      }
                      handleUpdateAssetField("logo", logoInput.startsWith("Provided") ? logoInput : `Provided: ${logoInput}`);
                    }}
                    disabled={isUpdatingField === "logo"}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    {isUpdatingField === "logo" ? "..." : "Save"}
                  </button>
                </div>

                {logoState === "help" && (
                  <p className="text-[11px] text-amber-400 font-sans bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                    💡 Requested Help: Our designers will create clean branding visuals for you.
                  </p>
                )}
                {logoState === "provided" && (
                  <p className="text-[11px] text-emerald-400 font-sans bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                    ✓ Logo Link Submitted
                  </p>
                )}
              </div>

              {/* Field 3: Copy */}
              <div className="space-y-2 pb-2">
                <label className="block text-[10px] font-mono font-bold uppercase text-neutral-300 tracking-wider">
                  3. Business Details & Copy Documents
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateAssetField("copy", "no");
                      setCopyInput("");
                    }}
                    className={btnClass(copyState === "pending")}
                  >
                    Incomplete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateAssetField("copy", "no_help")}
                    className={btnClass(copyState === "help")}
                  >
                    Need Help
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateAssetField("copy", "not_required")}
                    className={btnClass(copyState === "not_required")}
                  >
                    Not Required
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={copyInput}
                    onChange={(e) => setCopyInput(e.target.value)}
                    placeholder="Paste text / Google Doc link..."
                    className="flex-1 bg-neutral-950 border border-neutral-900 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!copyInput.trim()) {
                        alert("Please paste text link or select 'Need Help'.");
                        return;
                      }
                      handleUpdateAssetField("copy", copyInput.startsWith("Provided") ? copyInput : `Provided: ${copyInput}`);
                    }}
                    disabled={isUpdatingField === "copy"}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    {isUpdatingField === "copy" ? "..." : "Save"}
                  </button>
                </div>

                {copyState === "help" && (
                  <p className="text-[11px] text-amber-400 font-sans bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                    💡 Requested Help: CodeFuser copywriters will draft customer-ready text for your website.
                  </p>
                )}
                {copyState === "provided" && (
                  <p className="text-[11px] text-emerald-400 font-sans bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                    ✓ Business Information Submitted
                  </p>
                )}
              </div>
            </div>

            {/* Direct File Upload */}
            <div className="border border-dashed border-neutral-800 rounded-2xl p-5 bg-neutral-950 text-center space-y-3 mt-4">
              <UploadCloud size={24} className="text-amber-500/60 mx-auto" />
              <span className="text-xs text-white font-bold block">Upload Files Directly</span>
              <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                Upload images, PDF brochures, or logo files directly (Max 50MB)
              </p>

              <input
                type="file"
                id="my-project-file-uploader"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="my-project-file-uploader"
                className="inline-block px-4 py-2 bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider text-white rounded-xl hover:bg-neutral-800 transition-all cursor-pointer"
              >
                Browse & Upload
              </label>

              {uploadStatus && (
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-mono text-amber-400 block uppercase">{uploadStatus}</span>
                  {uploadProgress !== null && (
                    <div className="w-full bg-neutral-900 rounded-full h-1 overflow-hidden">
                      <div className="bg-amber-500 h-1 transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                </div>
              )}

              {uploadError && <span className="text-[10px] font-mono text-red-400 block pt-1">⚠️ {uploadError}</span>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
