import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export const validateCreateRating = (body) => {
    const errors = [];

    if (!isValidObjectId(body.promiseId)) {
        errors.push("promiseId is required and must be a valid ObjectId");
    }

    if (!isNonEmptyString(body.clerkUserId)) {
        errors.push("clerkUserId is required and must be a non-empty string");
    }

    if (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5) {
        errors.push("rating must be a number between 1 and 5");
    }

    return { ok: errors.length === 0, errors };
};

export const validateUpdateRating = (body) => {
    const errors = [];

    if (body.rating !== undefined && (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5)) {
        errors.push("rating must be a number between 1 and 5");
    }

    return { ok: errors.length === 0, errors };
};
