/**
 * Validation functions for Politician requests.
 * Keep it simple: validate required fields and basic types.
 */

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export const validateCreatePolitician = (body) => {
  const errors = [];

  if (!isNonEmptyString(body.fullName)) {
    errors.push("fullName is required");
  }

  // slug is optional in request; we can generate from fullName in service
  if (body.slug && !isNonEmptyString(body.slug)) {
    errors.push("slug must be a non-empty string if provided");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
};

export const validateUpdatePolitician = (body) => {
  const errors = [];

  // For updates, allow partial updates but validate types if fields are provided.
  if (body.fullName !== undefined && !isNonEmptyString(body.fullName)) {
    errors.push("fullName must be a non-empty string");
  }
  if (body.slug !== undefined && !isNonEmptyString(body.slug)) {
    errors.push("slug must be a non-empty string");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
};
