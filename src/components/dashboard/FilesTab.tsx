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
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="bg-black border border-neutral-900 rounded-3xl p-6">
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold block mb-1">
          Files & Media Center
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight uppercase">
          Your Files & Website Deliverables
        </h2>
        <p className="text-xs text-neutral-400 mt-1 font-sans">
          Access all files you sent to us, plus official site deliverables and media assets created by CodeFuser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* GROUP 1: Things We Sent You (Deliverables) */}
        <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ShieldCheck size={15} className="text-amber-500" />
              Deliverables From CodeFuser ({codefuserDeliverables.length})
            </h3>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
              Official
            </span>
          </div>

          {codefuserDeliverables.length === 0 ? (
            <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-2xl text-center space-y-2">
              <FileText size={24} className="text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-400 font-medium">No deliverables published yet.</p>
              <p className="text-[11px] text-neutral-500">
                Design mockups, brand files, and code bundles will appear here upon milestone approvals.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 font-sans">
              {codefuserDeliverables.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-center justify-between gap-3 hover:border-neutral-800 transition-all"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{item.name}</span>
                    <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
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
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-xl text-amber-500 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* GROUP 2: Things You Sent Us */}
        <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <FolderArchive size={15} className="text-neutral-400" />
              Files You Sent Us ({clientFiles.length})
            </h3>
            <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold">Client Files</span>
          </div>

          {/* Quick Upload Box */}
          <div className="border border-dashed border-neutral-800 rounded-2xl p-4 bg-neutral-950 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-300 font-bold">
              <UploadCloud size={16} className="text-amber-500" />
              <span>Upload New File</span>
            </div>

            <input
              type="file"
              id="files-tab-uploader"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="files-tab-uploader"
              className="inline-block px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold uppercase text-white rounded-xl hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Select File
            </label>

            {uploadStatus && (
              <span className="text-[10px] font-mono text-amber-400 block uppercase">{uploadStatus}</span>
            )}
            {uploadError && <span className="text-[10px] font-mono text-red-400 block">⚠️ {uploadError}</span>}
          </div>

          {/* File List */}
          {clientFiles.length === 0 ? (
            <div className="p-4 text-center text-xs text-neutral-500 font-sans">
              No uploaded files yet. Use the uploader above to send logos or photos.
            </div>
          ) : (
            <div className="space-y-2 font-sans max-h-[350px] overflow-y-auto pr-1">
              {clientFiles.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{asset.name}</span>
                    <span className="text-[9px] font-mono text-neutral-500 block uppercase">
                      {Math.round(asset.size / 1024)} KB • Uploaded
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownloadAsset(asset.id, asset.url)}
                    className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold uppercase text-amber-500 hover:text-white rounded-lg cursor-pointer"
                  >
                    View
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
