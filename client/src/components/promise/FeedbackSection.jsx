import React, { useState, useEffect } from "react";
import { fetchPromiseFeedback, submitFeedback } from "../../api/feedback-api.js";
import { useAuth } from "../../context/auth-context.jsx";

export default function FeedbackSection({ promiseId }) {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await fetchPromiseFeedback(promiseId);
            setFeedbacks(res.data || []);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        if (!user) {
            setError("Please log in to submit feedback.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setMessage("");
            await submitFeedback(promiseId, content);
            setMessage("Feedback submitted successfully.");
            setContent("");
            await loadData();
        } catch (e) {
            setError(e.message || "Failed to submit feedback.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Feedback</h3>

            {/* Submit Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <textarea
                        className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows="3"
                        placeholder="Share your thoughts or provide evidence regarding this promise..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={submitting}
                    ></textarea>
                    <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm max-w-sm">
                            {error && <span className="text-rose-600 font-medium">{error}</span>}
                            {message && <span className="text-emerald-600 font-medium">{message}</span>}
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !content.trim()}
                            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                        >
                            {submitting ? "Submitting..." : "Submit Feedback"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 border border-slate-200">
                    Please log in to share your feedback.
                </div>
            )}

            {/* List Feedbacks */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-sm text-slate-500">Loading feedback...</div>
                ) : feedbacks.length > 0 ? (
                    feedbacks.map((fb) => (
                        <div key={fb._id || fb.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                            <div className="text-sm font-semibold text-slate-800 mb-1">
                                Citizen {fb.clerkUserId ? fb.clerkUserId.substring(0, 8) + "..." : "Anonymous"}
                                <span className="text-slate-400 font-normal ml-2 text-xs">
                                    {new Date(fb.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-slate-700 text-sm whitespace-pre-wrap">{fb.content}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-sm text-slate-500 italic flex justify-center py-4">No feedback yet. Be the first to share your thoughts!</div>
                )}
            </div>
        </div>
    );
}
