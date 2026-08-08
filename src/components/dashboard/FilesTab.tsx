import React from "react";
import { FolderArchive, UploadCloud, Download, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { ProjectRecord, ExtraStore } from "./dashboardTypes";

interface FilesTabProps {
  project: ProjectRecord;
  extraStore: ExtraStore;
  handleDownloadAsset: (id: string, url: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadStatus: string | null;
  uploadProgress: number | null;
  uploadError: string | null;
}

export const FilesTab: React.FC<FilesTabProps> = ({
  project,
  extraStore,
  handleDownloadAsset,
  handleFileUpload,
  uploadStatus,
  uploadProgress,
  uploadError,
}) => {
  const clientFiles = extraStore.assets || [];
  const codefuserDeliverables = extraStore.quote?.deliverables || [];

  return (
    <div className="space-y-8 py-2">
      {/* SECTION HEADER */}
      <div className="space-y-1">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest block">
          Files
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#EAE5D9] tracking-tight">
          My Files & Deliverables
        </h1>
        <p className="text-sm text-neutral-300">
          Access files you've uploaded or view deliverables created by CodeFuser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* GROUP 1: Things You Sent Us */}
        <section className="p-6 sm:p-8 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <h2 className="text-base font-bold text-[#EAE5D9]">
              Files You Sent Us ({clientFiles.length})
            </h2>
          </div>

          {/* Uploader */}
          <div className="border border-dashed border-neutral-800 rounded-2xl p-4 bg-black/40 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-[#EAE5D9] font-semibold">
              <UploadCloud size={18} className="text-amber-400" />
              <span>Send New File</span>
            </div>

            <input
              type="file"
              id="files-tab-uploader"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="files-tab-uploader"
              className="inline-block px-4 py-2 bg-neutral-900 border border-neutral-800 text-xs font-semibold text-white rounded-xl hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Browse & Upload
            </label>

            {uploadStatus && (
              <span className="text-xs text-amber-400 block font-medium">{uploadStatus}</span>
            )}
            {uploadError && <span className="text-xs text-red-400 block">⚠️ {uploadError}</span>}
          </div>

          {/* File List */}
          {clientFiles.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400">
              No uploaded files yet. Use the button above to upload logos or images.
            </div>
          ) : (
            <div className="space-y-3 font-sans max-h-[350px] overflow-y-auto pr-1">
              {clientFiles.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3.5 bg-black/60 border border-neutral-900 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#EAE5D9] block truncate">{asset.name}</span>
                    <span className="text-[11px] text-neutral-500 block">
                      {Math.round(asset.size / 1024)} KB
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownloadAsset(asset.id, asset.url)}
                    className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 text-xs font-semibold text-[#EAE5D9] hover:bg-neutral-800 rounded-xl cursor-pointer"
                  >
                    View File
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* GROUP 2: Deliverables From CodeFuser */}
        <section className="p-6 sm:p-8 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <h2 className="text-base font-bold text-[#EAE5D9]">
              Files From CodeFuser ({codefuserDeliverables.length})
            </h2>
          </div>

          {codefuserDeliverables.length === 0 ? (
            <div className="p-8 bg-black/40 border border-neutral-900 rounded-2xl text-center space-y-2">
              <FileText size={28} className="text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-300 font-medium">No files published yet.</p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Your website designs and deliverables will appear here as soon as they are ready.
              </p>
            </div>
          ) : (
            <div className="space-y-3 font-sans">
              {codefuserDeliverables.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-black/60 border border-neutral-900 rounded-2xl flex items-center justify-between gap-3 hover:border-neutral-800 transition-all"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#EAE5D9] block truncate">{item.name}</span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">
                      {item.category || "Deliverable"} • {Math.round((item.size || 1024) / 1024)} KB
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const matchingAsset = extraStore.assets?.find((a) => a.url === item.url);
                      if (matchingAsset) {
                        handleDownloadAsset(matchingAsset.id, item.url);
                      } else {
                        window.open(item.url, "_blank");
                      }
                    }}
                    className="px-3.5 py-1.5 bg-[#EAE5D9] hover:bg-white text-black font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

