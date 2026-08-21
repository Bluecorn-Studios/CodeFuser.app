import React, { useState, useEffect } from "react";
import { Star, Shield, RefreshCw } from "lucide-react";

interface ReviewRecord {
  id: string;
  projectId: string;
  customerId?: string | null;
  customerName: string;
  businessName: string;
  rating: number;
  answer1: string;
  answer2: string;
  answer3: string;
  published: boolean;
  createdAt: string;
}

interface ReviewsAdminManagerProps {
  getAdminHeaders: (extra?: Record<string, string>) => Record<string, string>;
}

export const ReviewsAdminManager: React.FC<ReviewsAdminManagerProps> = ({ getAdminHeaders }) => {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/reviews", {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews(data.data || []);
      } else {
        setErrorMsg(data.error || "Failed to load customer reviews.");
      }
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      setErrorMsg("Network error loading reviews.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleTogglePublish = async (reviewId: string, published: boolean) => {
    setUpdatingId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/publish`, {
        method: "PATCH",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ published }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, published } : r))
        );
      } else {
        alert(data.error || "Failed to update publish status.");
      }
    } catch (err) {
      console.error("Failed to update review publish status:", err);
      alert("Network error updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
            <Shield size={14} className="text-white" />
            <span>CUSTOMER FEEDBACK CONTROL</span>
          </div>
          <h2 className="font-founder text-2xl font-bold text-white tracking-wide">
            Customer Reviews & Feedback
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Review post-launch customer ratings and feedback. Published reviews are visible on the public CodeFuser website. Unpublished reviews remain saved privately for internal use.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-xs font-mono text-white rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl text-xs font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="p-12 text-center text-xs font-mono text-neutral-500">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center border border-white/10 rounded-2xl bg-[#0A0A0A]">
          <p className="text-sm font-mono text-neutral-400">No customer reviews submitted yet.</p>
          <p className="text-xs text-neutral-600 mt-1">
            Reviews will appear here automatically when post-launch customers complete their review prompt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all space-y-4"
            >
              {/* Top row: Business info, rating, status badge */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{rev.businessName}</span>
                    <span className="text-xs text-neutral-400">• {rev.customerName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Submitted {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 bg-neutral-900 px-3 py-1 rounded-full border border-white/10">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= rev.rating ? "fill-white text-white" : "text-neutral-700"
                        }
                      />
                    ))}
                    <span className="ml-1 text-xs font-mono font-bold text-white">
                      {rev.rating}/5
                    </span>
                  </div>

                  {/* Published status badge */}
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      rev.published
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-neutral-800 border-white/10 text-neutral-400"
                    }`}
                  >
                    {rev.published ? "✓ Published" : "Private (Unpublished)"}
                  </span>
                </div>
              </div>

              {/* Feedback Questions & Answers */}
              <div className="space-y-2.5 text-xs">
                {rev.answer1 && (
                  <div>
                    <span className="font-mono text-[11px] text-neutral-400 block mb-0.5">
                      1. What they liked most:
                    </span>
                    <p className="text-neutral-200 bg-neutral-900/60 p-3 rounded-xl border border-white/5 leading-relaxed">
                      "{rev.answer1}"
                    </p>
                  </div>
                )}

                {rev.answer2 && (
                  <div>
                    <span className="font-mono text-[11px] text-neutral-400 block mb-0.5">
                      2. What to improve:
                    </span>
                    <p className="text-neutral-200 bg-neutral-900/60 p-3 rounded-xl border border-white/5 leading-relaxed">
                      "{rev.answer2}"
                    </p>
                  </div>
                )}

                {rev.answer3 && (
                  <div>
                    <span className="font-mono text-[11px] text-neutral-400 block mb-0.5">
                      3. Recommendation:
                    </span>
                    <p className="text-neutral-200 bg-neutral-900/60 p-3 rounded-xl border border-white/5 leading-relaxed">
                      "{rev.answer3}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons: Publish / Don't Publish */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  onClick={() => handleTogglePublish(rev.id, false)}
                  disabled={updatingId === rev.id || !rev.published}
                  className={`px-4 py-2 font-mono text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    !rev.published
                      ? "bg-neutral-900 border-white/10 text-neutral-500 opacity-60 cursor-default"
                      : "bg-neutral-900 border-white/10 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  Don't Publish
                </button>

                <button
                  onClick={() => handleTogglePublish(rev.id, true)}
                  disabled={updatingId === rev.id || rev.published}
                  className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    rev.published
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 opacity-70 cursor-default"
                      : "bg-white text-black hover:bg-neutral-200"
                  }`}
                >
                  {updatingId === rev.id ? "Updating..." : "Publish"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
