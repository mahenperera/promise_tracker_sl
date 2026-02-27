import mongoose from "mongoose";

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export const validateCreateTicket = (body) => {
  const errors = [];

  if (!isNonEmptyString(body.subject)) errors.push("subject is required");

  if (!isNonEmptyString(body.message)) errors.push("message is required");

  if (body.priority && !["low", "medium", "high"].includes(body.priority)) {
    errors.push("priority must be low, medium, or high");
  }

  if (
    body.politicianId &&
    !mongoose.Types.ObjectId.isValid(body.politicianId)
  ) {
    errors.push("politicianId must be valid ObjectId");
  }

  return { ok: errors.length === 0, errors };
};

export const validateReply = (body) => {
  const errors = [];

  if (!isNonEmptyString(body.message)) errors.push("reply message is required");

  return { ok: errors.length === 0, errors };
};

export const validateUpdateTicket = (body) => {
  const errors = [];

  if (
    body.status &&
    !["open", "in_progress", "resolved", "closed"].includes(body.status)
  ) {
    errors.push("invalid status value");
  }

  if (body.priority && !["low", "medium", "high"].includes(body.priority)) {
    errors.push("invalid priority value");
  }

  return { ok: errors.length === 0, errors };
};
