import Feedback from "../models/Feedback.js";

const postFeedback = async (promiseId, clerkUserId, content) => {
  return await Feedback.create({
    promiseId,
    clerkUserId,
    content,
    status: "PENDING", // Initial status for moderation [cite: 308]
  });
};

const getFeedbackByPromise = async (promiseId, currentUserId) => {
  const query = { promiseId };
  if (currentUserId) {
    query.$or = [{ status: "APPROVED" }, { clerkUserId: currentUserId }];
  } else {
    query.status = "APPROVED";
  }
  return await Feedback.find(query).sort({ createdAt: -1 });
};

const updateFeedbackStatus = async (id, status) => {
  return await Feedback.findByIdAndUpdate(id, { status }, { new: true });
};

const updateFeedbackContent = async (id, clerkUserId, content) => {
  const feedback = await Feedback.findById(id);
  if (!feedback) throw new Error("Feedback not found");
  if (feedback.clerkUserId !== clerkUserId) throw new Error("Unauthorized");
  feedback.content = content;
  feedback.status = "PENDING";
  return await feedback.save();
};

const deleteFeedbackByUser = async (id, clerkUserId, role) => {
  const feedback = await Feedback.findById(id);
  if (!feedback) throw new Error("Feedback not found");
  if (role !== "admin" && feedback.clerkUserId !== clerkUserId) throw new Error("Unauthorized");
  return await Feedback.findByIdAndDelete(id);
};

export default {
  postFeedback,
  getFeedbackByPromise,
  updateFeedbackStatus,
  updateFeedbackContent,
  deleteFeedbackByUser,
};