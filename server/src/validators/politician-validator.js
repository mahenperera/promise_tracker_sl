/**
 * Validation for Politician requests.
 * Keep it simple: required fields + basic type checks.
 */

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export const validateCreatePolitician = (body) => {
  const errors = [];

  // These are needed for a real profile base
  if (!isNonEmptyString(body.fullName)) errors.push("fullName is required");
  if (!isNonEmptyString(body.party)) errors.push("party is required");
  if (!isNonEmptyString(body.district)) errors.push("district is required");
  if (!isNonEmptyString(body.position)) errors.push("position is required");

  // slug optional
  if (body.slug !== undefined && !isNonEmptyString(body.slug)) {
    errors.push("slug must be a non-empty string if provided");
  }

  return { ok: errors.length === 0, errors };
};

export const validateUpdatePolitician = (body) => {
  const errors = [];

  // Updates are partial, but validate types if field is included
  if (body.fullName !== undefined && !isNonEmptyString(body.fullName))
    errors.push("fullName must be a non-empty string");

  if (body.slug !== undefined && !isNonEmptyString(body.slug))
    errors.push("slug must be a non-empty string");

  if (body.party !== undefined && !isNonEmptyString(body.party))
    errors.push("party must be a non-empty string");

  if (body.district !== undefined && !isNonEmptyString(body.district))
    errors.push("district must be a non-empty string");

  if (body.position !== undefined && !isNonEmptyString(body.position))
    errors.push("position must be a non-empty string");

  // isActive should be boolean if provided
  if (body.isActive !== undefined && typeof body.isActive !== "boolean")
    errors.push("isActive must be boolean");

  return { ok: errors.length === 0, errors };
};
