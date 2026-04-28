const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export const validateCreateParty = (body) => {
  const errors = [];

  if (!isNonEmptyString(body.name)) errors.push("name is required");
  if (!isNonEmptyString(body.code)) errors.push("code is required");

  if (body.slug !== undefined && !isNonEmptyString(body.slug)) {
    errors.push("slug must be a non-empty string if provided");
  }

  if (body.logoUrl !== undefined && typeof body.logoUrl !== "string") {
    errors.push("logoUrl must be a string");
  }

  if (body.bannerUrl !== undefined && typeof body.bannerUrl !== "string") {
    errors.push("bannerUrl must be a string");
  }

  if (body.websiteUrl !== undefined && typeof body.websiteUrl !== "string") {
    errors.push("websiteUrl must be a string");
  }

  if (body.description !== undefined && typeof body.description !== "string") {
    errors.push("description must be a string");
  }

  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
    errors.push("isActive must be boolean");
  }

  return { ok: errors.length === 0, errors };
};

export const validateUpdateParty = (body) => {
  const errors = [];

  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    errors.push("name must be a non-empty string");
  }

  if (body.code !== undefined && !isNonEmptyString(body.code)) {
    errors.push("code must be a non-empty string");
  }

  if (body.slug !== undefined && !isNonEmptyString(body.slug)) {
    errors.push("slug must be a non-empty string");
  }

  if (body.logoUrl !== undefined && typeof body.logoUrl !== "string") {
    errors.push("logoUrl must be a string");
  }

  if (body.bannerUrl !== undefined && typeof body.bannerUrl !== "string") {
    errors.push("bannerUrl must be a string");
  }

  if (body.websiteUrl !== undefined && typeof body.websiteUrl !== "string") {
    errors.push("websiteUrl must be a string");
  }

  if (body.description !== undefined && typeof body.description !== "string") {
    errors.push("description must be a string");
  }

  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
    errors.push("isActive must be boolean");
  }

  return { ok: errors.length === 0, errors };
};
