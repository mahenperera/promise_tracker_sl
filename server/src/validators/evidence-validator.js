/**
 * Validation for Evidence and Verification requests.
 * Mirrors the project's custom validation architecture to ensure lightweight, 
 * dependency-free request checking before hitting controllers.
 */

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const isValidDateString = (v) => !isNaN(Date.parse(v));

export const validateCreateEvidence = (body) => {
    const errors = [];

    if (!isNonEmptyString(body.promiseId)) errors.push("promiseId is required and must be a string");
    if (!isNonEmptyString(body.title)) errors.push("title is required and must be a string");

    // dateOccurred is required for chronological sorting
    if (!body.dateOccurred || !isValidDateString(body.dateOccurred)) {
        errors.push("dateOccurred is required and must be a valid ISO Date string");
    }

    // Media fields are optional (since they might be handled by Multer stream), but check type if present
    if (body.mediaType !== undefined && !isNonEmptyString(body.mediaType)) {
        errors.push("mediaType must be a non-empty string if provided");
    }
    if (body.mediaSourceType !== undefined && !isNonEmptyString(body.mediaSourceType)) {
        errors.push("mediaSourceType must be a non-empty string if provided");
    }

    return { ok: errors.length === 0, errors };
};

export const validateSubmitVote = (body) => {
    const errors = [];

    const validVoteTypes = ["upvote", "downvote", "flag"];
    if (!validVoteTypes.includes(body.voteType)) {
        errors.push(`voteType must be exactly one of: ${validVoteTypes.join(', ')}`);
    }

    if (body.comment !== undefined && typeof body.comment !== "string") {
        errors.push("comment must be a string if provided");
    }

    return { ok: errors.length === 0, errors };
};

export const validateUpdateStatus = (body) => {
    const errors = [];

    const validStatuses = ["pending", "verified", "disputed"];
    if (!validStatuses.includes(body.status)) {
        errors.push(`status must be exactly one of: ${validStatuses.join(', ')}`);
    }

    return { ok: errors.length === 0, errors };
};
