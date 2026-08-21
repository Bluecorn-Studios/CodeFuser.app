import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { getAuthToken } from "../../utils/auth";

interface CustomerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  clientName?: string;
  businessName?: string;
  onSuccess: () => void;
}

export const CustomerReviewModal: React.FC<CustomerReviewModalProps> = ({
  isOpen,
  onClose,
  projectId,
  clientName,
  businessName,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [answer1, setAnswer1] = useState<string>("");
  const [answer2, setAnswer2] = useState<string>("");
  const [answer3, setAnswer3] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken() || ""}`,
        },
        body: JSON.stringify({
          rating,
          answer1: answer1.trim(),
          answer2: answer2.trim(),
          answer3: answer3.trim(),
          customerName: clientName,
          businessName: businessName,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(data.error || "Failed to submit review. Please try again.");
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setErrorMessage("Network error while submitting review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2 className="font-founder text-2xl font-bold tracking-wide text-white pr-6">
          How was your CodeFuser experience?
        </h2>

        {errorMessage && (
          <div className="mt-3 p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Star selector */}
          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase tracking-wider">
              Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const activeStar = hoverRating !== null ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-white hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      size={24}
                      className={
                        activeStar
                          ? "fill-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                          : "text-neutral-600"
                      }
                    />
                  </button>
                );
              })}
              <span className="ml-2 font-mono text-xs font-bold text-neutral-300">
                {rating} / 5
              </span>
            </div>
          </div>

          {/* Question 1 */}
          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1 leading-snug">
              1. What did you like most about CodeFuser?
            </label>
            <textarea
              value={answer1}
              onChange={(e) => setAnswer1(e.target.value)}
              placeholder="Tell us what worked best for you..."
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-[#121212] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none transition-colors"
            />
          </div>

          {/* Question 2 */}
          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1 leading-snug">
              2. What could we improve?
            </label>
            <textarea
              value={answer2}
              onChange={(e) => setAnswer2(e.target.value)}
              placeholder="Any suggestions or improvements..."
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-[#121212] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none transition-colors"
            />
          </div>

          {/* Question 3 */}
          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1 leading-snug">
              3. Would you recommend CodeFuser to another business? Why?
            </label>
            <textarea
              value={answer3}
              onChange={(e) => setAnswer3(e.target.value)}
              placeholder="Your honest recommendation..."
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-[#121212] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none transition-colors"
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
