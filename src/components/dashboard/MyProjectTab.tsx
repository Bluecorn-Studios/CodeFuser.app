import React from "react";
import { Check, UploadCloud, FileText, Layers, Globe, ArrowRight, Clock, AlertCircle } from "lucide-react";
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
}) => {
  return (
    <div className="space-y-8 py-2">
      {/* SECTION HEADER */}
      <div className="space-y-1">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest block">
          Website Creation
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#EAE5D9] tracking-tight">
          My Website Journey
        </h1>
        <p className="text-sm text-neutral-300">
          Follow your website development stages and provide any required information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Human Timeline */}
        <div className="space-y-6">
          <section className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
              <h2 className="text-base font-bold text-[#EAE5D9] flex items-center gap-2">
                <Globe size={18} className="text-amber-400" />
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
                          ? "bg-amber-400 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-110"
                          : "bg-neutral-950 border-neutral-800"
                      }`}
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${
                            isActive ? "text-[#EAE5D9]" : isCompleted ? "text-neutral-300" : "text-neutral-500"
                          }`}
                        >
                          {stage.label}
                        </span>
                        {isCompleted && (
                          <span className="text-xs font-semibold text-emerald-400">✓ Completed</span>
                        )}
                        {isActive && (
                          <span className="text-xs font-semibold text-amber-400 animate-pulse">
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
            <section className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <h3 className="text-sm font-bold text-[#EAE5D9] flex items-center gap-2">
                  <FileText size={16} className="text-neutral-400" />
                  Approved Website Plan
                </h3>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                  Confirmed
                </span>
              </div>

              <div className="p-4 bg-black/60 rounded-2xl border border-neutral-900 max-h-[220px] overflow-y-auto text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {extraStore.quote.proposal.content}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Information Request Center */}
        <div className="space-y-6">
          <section className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-6">
            <div className="border-b border-neutral-900 pb-4 space-y-1">
              <h2 className="text-base font-bold text-[#EAE5D9]">
                We Need This From You
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Provide your details below so we can add them to your website. If you don't have them, select "CodeFuser can help".
              </p>
            </div>

            <div className="space-y-6">
              {/* Field 1: Domain */}
              <div className="space-y-3 border-b border-neutral-900/80 pb-5">
                <label className="block text-xs font-bold text-[#EAE5D9]">
                  1. Your Website Address (Domain)
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateAssetField("domain", "help")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      domainState === "help"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    CodeFuser can help
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateAssetField("domain", "not_required")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      domainState === "not_required"
                        ? "bg-neutral-800 text-neutral-200 border-neutral-700"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    I don't have this
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="e.g. mybusiness.com"
                    className="flex-1 bg-black border border-neutral-800 focus:border-[#EAE5D9] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!domainInput.trim()) {
                        alert("Please enter a domain address or select 'CodeFuser can help'.");
                        return;
                      }
                      handleUpdateAssetField("domain", domainInput.startsWith("Provided") ? domainInput : `Provided: ${domainInput}`);
                    }}
                    disabled={isUpdatingField === "domain"}
                    className="px-4 py-2.5 bg-[#EAE5D9] hover:bg-white text-black font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    {isUpdatingField === "domain" ? "Saving..." : "Save Address"}
                  </button>
                </div>

                {domainState === "help" && (
                  <p className="text-xs text-amber-300 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                    💡 CodeFuser will assist you in purchasing and connecting your website domain.
                  </p>
                )}
                {domainState === "provided" && (
                  <p className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 flex items-center gap-2">
                    <Check size={14} />
                    <span>Domain submitted: {project.hasDomain}</span>
                  </p>
                )}
              </div>

              {/* Field 2: Logo */}
              <div className="space-y-3 border-b border-neutral-900/80 pb-5">
                <label className="block text-xs font-bold text-[#EAE5D9]">
                  2. Your Logo & Photos (Google Drive or Dropbox Link)
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateAssetField("logo", "help")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      logoState === "help"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    CodeFuser can help
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateAssetField("logo", "not_required")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      logoState === "not_required"
                        ? "bg-neutral-800 text-neutral-200 border-neutral-700"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    I don't have this
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logoInput}
                    onChange={(e) => setLogoInput(e.target.value)}
                    placeholder="Paste link to Google Drive or Drive folder..."
                    className="flex-1 bg-black border border-neutral-800 focus:border-[#EAE5D9] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!logoInput.trim()) {
                        alert("Please paste a link or select 'CodeFuser can help'.");
                        return;
                      }
                      handleUpdateAssetField("logo", logoInput.startsWith("Provided") ? logoInput : `Provided: ${logoInput}`);
                    }}
                    disabled={isUpdatingField === "logo"}
                    className="px-4 py-2.5 bg-[#EAE5D9] hover:bg-white text-black font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    {isUpdatingField === "logo" ? "Saving..." : "Save Link"}
                  </button>
                </div>

                {logoState === "help" && (
                  <p className="text-xs text-amber-300 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                    💡 Our design team will create clean logo concepts and visual graphics for your business.
                  </p>
                )}
                {logoState === "provided" && (
                  <p className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 flex items-center gap-2">
                    <Check size={14} />
                    <span>Logo & photo link submitted</span>
                  </p>
                )}
              </div>

              {/* Field 3: Business Information */}
              <div className="space-y-3 pb-2">
                <label className="block text-xs font-bold text-[#EAE5D9]">
                  3. Your Business Information & Description
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateAssetField("copy", "no_help")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      copyState === "help"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    CodeFuser can help
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateAssetField("copy", "not_required")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      copyState === "not_required"
                        ? "bg-neutral-800 text-neutral-200 border-neutral-700"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    I don't have this
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={copyInput}
                    onChange={(e) => setCopyInput(e.target.value)}
                    placeholder="Paste website text, services, or document link..."
                    className="flex-1 bg-black border border-neutral-800 focus:border-[#EAE5D9] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!copyInput.trim()) {
                        alert("Please paste text or select 'CodeFuser can help'.");
                        return;
                      }
                      handleUpdateAssetField("copy", copyInput.startsWith("Provided") ? copyInput : `Provided: ${copyInput}`);
                    }}
                    disabled={isUpdatingField === "copy"}
                    className="px-4 py-2.5 bg-[#EAE5D9] hover:bg-white text-black font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    {isUpdatingField === "copy" ? "Saving..." : "Save Details"}
                  </button>
                </div>

                {copyState === "help" && (
                  <p className="text-xs text-amber-300 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                    💡 CodeFuser copywriters will write clear, professional text tailored for your website.
                  </p>
                )}
                {copyState === "provided" && (
                  <p className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 flex items-center gap-2">
                    <Check size={14} />
                    <span>Business details submitted</span>
                  </p>
                )}
              </div>
            </div>

            {/* Direct Upload Box */}
            <div className="border border-dashed border-neutral-800 rounded-3xl p-6 bg-black/40 text-center space-y-3">
              <UploadCloud size={28} className="text-neutral-400 mx-auto" />
              <div className="space-y-1">
                <span className="text-xs text-[#EAE5D9] font-bold block">Upload Photos or Documents Directly</span>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Click below to send us files directly from your phone or computer.
                </p>
              </div>

              <input
                type="file"
                id="my-project-file-uploader"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="my-project-file-uploader"
                className="inline-block px-5 py-2.5 bg-neutral-900 border border-neutral-800 text-xs font-semibold text-white rounded-xl hover:bg-neutral-800 transition-all cursor-pointer"
              >
                Browse Files & Upload
              </label>

              {uploadStatus && (
                <div className="space-y-1 pt-2">
                  <span className="text-xs text-amber-400 block font-medium">{uploadStatus}</span>
                  {uploadProgress !== null && (
                    <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#EAE5D9] h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                </div>
              )}

              {uploadError && <span className="text-xs text-red-400 block pt-1">⚠️ {uploadError}</span>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

