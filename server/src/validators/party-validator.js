const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export const validateCreateParty = (body) => {
  const errors = [];

  if (!isNonEmptyString(body.name)) errors.push("name is required");
  if (!isNonEmptyString(body.code)) errors.push("code is required");

  if (body.slug !== undefined && !isNonEmptyString(body.slug))
    errors.push("slug must be a non-empty string if provided");

  return { ok: errors.length === 0, errors };
};

export const validateUpdateParty = (body) => {
  const errors = [];

  if (body.name !== undefined && !isNonEmptyString(body.name))
    errors.push("name must be a non-empty string");

  if (body.code !== undefined && !isNonEmptyString(body.code))
    errors.push("code must be a non-empty string");

  if (body.slug !== undefined && !isNonEmptyString(body.slug))
    errors.push("slug must be a non-empty string");

  if (body.isActive !== undefined && typeof body.isActive !== "boolean")
    errors.push("isActive must be boolean");

  return { ok: errors.length === 0, errors };
};
