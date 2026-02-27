import mongoose from "mongoose";

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const validateCreatePromise = (body) => {
  const errors = [];

  if (!isValidObjectId(body.politicianId))
    errors.push("politicianId is required and must be a valid ObjectId");

  if (!isNonEmptyString(body.title)) errors.push("title is required");

  // slug optional
  if (body.slug !== undefined && !isNonEmptyString(body.slug)) {
    errors.push("slug must be a non-empty string if provided");
  }

  if (body.description !== undefined && !isNonEmptyString(body.description))
    errors.push("description must be a non-empty string");

  if (body.category !== undefined && !isNonEmptyString(body.category))
    errors.push("category must be a non-empty string");

  if (
    body.status !== undefined &&
    !["pending", "in_progress", "fulfilled", "broken"].includes(body.status)
  ) {
    errors.push("status must be pending, in_progress, fulfilled, or broken");
  }

  if (body.promiseDate !== undefined && isNaN(Date.parse(body.promiseDate))) {
    errors.push("promiseDate must be a valid date");
  }

  return { ok: errors.length === 0, errors };
};

export const validateUpdatePromise = (body) => {
  const errors = [];

  if (body.title !== undefined && !isNonEmptyString(body.title))
    errors.push("title must be a non-empty string");

  if (body.slug !== undefined && !isNonEmptyString(body.slug))
    errors.push("slug must be a non-empty string");

  if (body.description !== undefined && !isNonEmptyString(body.description))
    errors.push("description must be a non-empty string");

  if (body.category !== undefined && !isNonEmptyString(body.category))
    errors.push("category must be a non-empty string");

  if (
    body.status !== undefined &&
    !["pending", "in_progress", "fulfilled", "broken"].includes(body.status)
  ) {
    errors.push("status must be pending, in_progress, fulfilled, or broken");
  }

  if (body.promiseDate !== undefined && isNaN(Date.parse(body.promiseDate))) {
    errors.push("promiseDate must be a valid date");
  }

  if (body.isActive !== undefined && typeof body.isActive !== "boolean")
    errors.push("isActive must be boolean");

  return { ok: errors.length === 0, errors };
};
