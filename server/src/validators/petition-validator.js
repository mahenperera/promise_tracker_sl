import mongoose from "mongoose";

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const validateCreatePetition = (body) => {
  const errors = [];

  if (!isNonEmptyString(body.title)) errors.push("title is required");
  if (!isNonEmptyString(body.addressedTo))
    errors.push("addressedTo is required");
  if (!isNonEmptyString(body.body)) errors.push("body is required");

  if (!body.petitioner || typeof body.petitioner !== "object") {
    errors.push("petitioner object is required");
  } else {
    if (!isNonEmptyString(body.petitioner.name))
      errors.push("petitioner.name is required");
    if (!isNonEmptyString(body.petitioner.contact))
      errors.push("petitioner.contact is required");

    if (
      body.petitioner.address !== undefined &&
      typeof body.petitioner.address !== "string"
    ) {
      errors.push("petitioner.address must be string");
    }
    if (
      body.petitioner.nic !== undefined &&
      typeof body.petitioner.nic !== "string"
    ) {
      errors.push("petitioner.nic must be string");
    }
  }

  if (body.subjectLine !== undefined && typeof body.subjectLine !== "string")
    errors.push("subjectLine must be string");

  if (
    body.evidenceSummary !== undefined &&
    typeof body.evidenceSummary !== "string"
  )
    errors.push("evidenceSummary must be string");

  if (
    body.deadline !== undefined &&
    body.deadline !== null &&
    isNaN(Date.parse(body.deadline))
  ) {
    errors.push("deadline must be a valid date");
  }

  if (body.attachments !== undefined) {
    if (!Array.isArray(body.attachments))
      errors.push("attachments must be an array");
    else {
      const bad = body.attachments.some((a) => typeof a !== "string");
      if (bad) errors.push("attachments must be array of strings");
    }
  }

  if (typeof body.declarationAccepted !== "boolean")
    errors.push("declarationAccepted must be boolean");

  return { ok: errors.length === 0, errors };
};

export const validateRejectPetition = (body) => {
  const errors = [];
  if (
    body.rejectionReason !== undefined &&
    typeof body.rejectionReason !== "string"
  )
    errors.push("rejectionReason must be string");
  return { ok: errors.length === 0, errors };
};

export const validateObjectIdParam = (id) => {
  const errors = [];
  if (!isValidObjectId(id)) errors.push("Invalid id");
  return { ok: errors.length === 0, errors };
};
