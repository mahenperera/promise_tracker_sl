import Feedback from "../models/Feedback.js";

const postFeedback = async (promiseId, clerkUserId, content) => {
  return await Feedback.create({
    promiseId,
    clerkUserId,
    content,
    status: "PENDING", // Initial status for moderation [cite: 308]
  });
};

const getApprovedFeedbackByPromise = async (promiseId) => {
  return await Feedback.find({ promiseId, status: "APPROVED" });
};

const updateFeedbackStatus = async (id, status) => {
  return await Feedback.findByIdAndUpdate(id, { status }, { new: true });
};

const deleteFeedback = async (id) => {
  return await Feedback.findByIdAndDelete(id);
};

export default {
  postFeedback,
  getApprovedFeedbackByPromise,
  updateFeedbackStatus,
  deleteFeedback,
};