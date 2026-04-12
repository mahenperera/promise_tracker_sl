import React, { useState, useEffect } from "react";
import { fetchPromiseFeedback, submitFeedback, updateFeedback, deleteFeedback } from "../../api/feedback-api.js";
import { useAuth } from "../../context/auth-context.jsx";

const TOXIC_WORDS = ['bad', 'terrible', 'worst', 'hate', 'stupid', 'idiot', 'scam', 'fraud', 'fake'];

export default function FeedbackSection({ promiseId }) {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [actionError, setActionError] = useState(null);

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

    const handleEditStart = (fb) => {
        setEditingId(fb._id || fb.id);
        setEditContent(fb.content);
        setActionError(null);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditContent("");
        setActionError(null);
    };

    const handleEditSubmit = async (id) => {
        if (!editContent.trim()) return;
        try {
            await updateFeedback(id, editContent);
            setEditingId(null);
            await loadData();
        } catch (e) {
            setActionError(e.message || "Failed to update feedback");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this feedback?")) return;
        try {
            await deleteFeedback(id);
            await loadData();
        } catch (e) {
            alert(e.message || "Failed to delete feedback");
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Feedback</h3>

            {/* Submit Form */}
            {user ? (() => {
                const toxicFound = TOXIC_WORDS.filter(w => content.toLowerCase().includes(w));
                const isToxic = toxicFound.length > 0;

                return (
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
                                {isToxic && <span className="text-rose-600 font-medium">Warning: Contains toxic words ({toxicFound.join(", ")})</span>}
                                {!isToxic && error && <span className="text-rose-600 font-medium">{error}</span>}
                                {message && <span className="text-emerald-600 font-medium">{message}</span>}
                            </div>
                            <button
                                type="submit"
                                disabled={submitting || !content.trim() || isToxic}
                                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Submit Feedback"}
                            </button>
                        </div>
                    </form>
                );
            })() : (
                <div className="mb-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 border border-slate-200">
                    Please log in to share your feedback.
                </div>
            )}

            {/* List Feedbacks */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-sm text-slate-500">Loading feedback...</div>
                ) : feedbacks.length > 0 ? (
                    feedbacks.map((fb) => {
                        const fbId = fb._id || fb.id;
                        const isOwner = user && fb.clerkUserId === (user.userId || user.id || user._id);
                        const isEditing = editingId === fbId;

                        return (
                            <div key={fbId} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                {isEditing ? (
                                    <div>
                                        <textarea
                                            className="w-full rounded-xl border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                                            rows="3"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                        />
                                        {(() => {
                                            const editToxicFound = TOXIC_WORDS.filter(w => editContent.toLowerCase().includes(w));
                                            const isEditToxic = editToxicFound.length > 0;
                                            return (
                                                <div className="flex gap-2 justify-end mt-2 items-center">
                                                    {isEditToxic && <span className="text-rose-600 text-xs self-center mr-auto font-medium">Contains toxic words ({editToxicFound.join(", ")})</span>}
                                                    {!isEditToxic && actionError && <span className="text-rose-600 text-xs self-center mr-auto font-medium">{actionError}</span>}
                                                    <button onClick={handleEditCancel} className="text-sm px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Cancel</button>
                                                    <button disabled={isEditToxic} onClick={() => handleEditSubmit(fbId)} className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 disabled:opacity-50">Save</button>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="text-sm font-semibold text-slate-800">
                                                Citizen {fb.clerkUserId ? fb.clerkUserId.substring(0, 8) + "..." : "Anonymous"}
                                                <span className="text-slate-400 font-normal ml-2 text-xs">
                                                    {new Date(fb.createdAt).toLocaleDateString()}
                                                </span>
                                                {fb.status && fb.status !== "APPROVED" && (
                                                    <span className="ml-2 text-[10px] uppercase font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                        {fb.status}
                                                    </span>
                                                )}
                                            </div>
                                            {isOwner && (
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleEditStart(fb)} className="text-xs font-semibold text-blue-600 hover:underline px-1">Edit</button>
                                                    <button onClick={() => handleDelete(fbId)} className="text-xs font-semibold text-rose-600 hover:underline px-1">Delete</button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-slate-700 text-sm whitespace-pre-wrap">{fb.content}</p>
                                    </>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-sm text-slate-500 italic flex justify-center py-4">No feedback yet. Be the first to share your thoughts!</div>
                )}
            </div>
        </div>
    );
}
