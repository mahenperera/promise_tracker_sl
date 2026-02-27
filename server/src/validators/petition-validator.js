import mongoose from "mongoose";

export const validateObjectIdParam = (id) => {
  const ok = mongoose.Types.ObjectId.isValid(id);
  return ok ? { ok: true } : { ok: false, errors: ["Invalid id"] };
};

export const validateCreatePetition = (body) => {
  const errors = [];

  if (!body?.title || !String(body.title).trim())
    errors.push("title is required");
  if (!body?.addressedTo || !String(body.addressedTo).trim())
    errors.push("addressedTo is required");
  if (!body?.body || !String(body.body).trim()) errors.push("body is required");

  if (typeof body?.declarationAccepted !== "boolean") {
    errors.push("declarationAccepted must be true/false");
  }

  // ✅ IMPORTANT: do NOT validate petitionerEmail here.
  // It is auto-set from JWT->users DB.

  return errors.length ? { ok: false, errors } : { ok: true };
};

export const validateRejectPetition = (body) => {
  const errors = [];
  if (!body?.rejectionReason || !String(body.rejectionReason).trim()) {
    errors.push("rejectionReason is required");
  }
  return errors.length ? { ok: false, errors } : { ok: true };
};
