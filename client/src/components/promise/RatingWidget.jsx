import React, { useState, useEffect } from "react";
import { fetchAverageRating, createRating } from "../../api/rating-api.js";
import { useAuth } from "../../context/auth-context.jsx";

export default function RatingWidget({ promiseId }) {
  const { user } = useAuth();
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hovered, setHovered] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAverageRating(promiseId);
      setAvg(res.average || 0);
      setCount(res.totalRatings || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (promiseId) {
      loadData();
    }
  }, [promiseId]);

  const handleRate = async (val) => {
    if (!user) {
      setError("You must be logged in to rate.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await createRating({
        promiseId,
        clerkUserId: user.userId || user.id || user._id,
        rating: val,
      });
      setSuccess("Thank you for rating!");
      await loadData();
    } catch (e) {
      if (e.message?.includes("already rated")) {
        setError("You have already rated this promise.");
      } else {
        setError(e.message || "Failed to submit rating.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Loading rating...</div>;
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Community Rating
          </h3>
          <p className="text-sm text-slate-500">
            {avg.toFixed(1)} out of 5 ({count} ratings)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={submitting}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => handleRate(star)}
              className="text-2xl transition hover:scale-110 focus:outline-none disabled:opacity-50"
            >
              <span
                className={
                  star <= (hovered || avg) ? "text-amber-400" : "text-slate-200"
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm font-medium text-rose-600">{error}</div>
      )}
      {success && (
        <div className="mt-3 text-sm font-medium text-emerald-600">
          {success}
        </div>
      )}
    </div>
  );
}
