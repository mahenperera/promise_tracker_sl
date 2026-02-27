import mongoose from "mongoose";

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const validateCreateFeedback = (body) => {
    const errors = [];

    if (!isValidObjectId(body.promiseId)) {
        errors.push("promiseId is required and must be a valid ObjectId");
    }

    if (!isNonEmptyString(body.clerkUserId)) {
        errors.push("clerkUserId is required and must be a non-empty string");
    }

    if (!isNonEmptyString(body.content)) {
        errors.push("content is required and must be a non-empty string");
    }

    if (
        body.status !== undefined &&
        !["PENDING", "APPROVED", "REJECTED"].includes(body.status)
    ) {
        errors.push("status must be PENDING, APPROVED, or REJECTED");
    }

    return { ok: errors.length === 0, errors };
};

export const validateUpdateFeedback = (body) => {
    const errors = [];

    if (body.content !== undefined && !isNonEmptyString(body.content)) {
        errors.push("content must be a non-empty string");
    }

    if (
        body.status !== undefined &&
        !["PENDING", "APPROVED", "REJECTED"].includes(body.status)
    ) {
        errors.push("status must be PENDING, APPROVED, or REJECTED");
    }

    return { ok: errors.length === 0, errors };
};
