const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

const isOptionalString = (v) => v === undefined || typeof v === "string";

const isOptionalUrl = (v) => {
  if (v === undefined) return true;
  if (typeof v !== "string") return false;
  if (!v.trim()) return true; // allow empty string
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

export const validateCreatePolitician = (body) => {
  const errors = [];

  if (!isNonEmptyString(body.fullName)) errors.push("fullName is required");
  if (!isNonEmptyString(body.party)) errors.push("party is required");
  if (!isNonEmptyString(body.district)) errors.push("district is required");
  if (!isNonEmptyString(body.position)) errors.push("position is required");

  if (body.slug !== undefined && !isNonEmptyString(body.slug)) {
    errors.push("slug must be a non-empty string if provided");
  }

  // ✅ optional fields
  if (!isOptionalUrl(body.photoUrl))
    errors.push("photoUrl must be a valid URL");
  if (!isOptionalUrl(body.partyLogoUrl))
    errors.push("partyLogoUrl must be a valid URL");
  if (!isOptionalString(body.bio)) errors.push("bio must be a string");

  if (body.socialLinks !== undefined) {
    const s = body.socialLinks;
    if (typeof s !== "object" || s === null)
      errors.push("socialLinks must be an object");
    else {
      if (!isOptionalUrl(s.websiteUrl))
        errors.push("socialLinks.websiteUrl must be a valid URL");
      if (!isOptionalUrl(s.facebookUrl))
        errors.push("socialLinks.facebookUrl must be a valid URL");
      if (!isOptionalUrl(s.twitterUrl))
        errors.push("socialLinks.twitterUrl must be a valid URL");
      if (!isOptionalUrl(s.youtubeUrl))
        errors.push("socialLinks.youtubeUrl must be a valid URL");
    }
  }

  return { ok: errors.length === 0, errors };
};

export const validateUpdatePolitician = (body) => {
  const errors = [];

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

  if (body.isActive !== undefined && typeof body.isActive !== "boolean")
    errors.push("isActive must be boolean");

  // ✅ optional fields
  if (!isOptionalUrl(body.photoUrl))
    errors.push("photoUrl must be a valid URL");
  if (!isOptionalUrl(body.partyLogoUrl))
    errors.push("partyLogoUrl must be a valid URL");
  if (body.bio !== undefined && typeof body.bio !== "string")
    errors.push("bio must be a string");

  if (body.socialLinks !== undefined) {
    const s = body.socialLinks;
    if (typeof s !== "object" || s === null)
      errors.push("socialLinks must be an object");
    else {
      if (!isOptionalUrl(s.websiteUrl))
        errors.push("socialLinks.websiteUrl must be a valid URL");
      if (!isOptionalUrl(s.facebookUrl))
        errors.push("socialLinks.facebookUrl must be a valid URL");
      if (!isOptionalUrl(s.twitterUrl))
        errors.push("socialLinks.twitterUrl must be a valid URL");
      if (!isOptionalUrl(s.youtubeUrl))
        errors.push("socialLinks.youtubeUrl must be a valid URL");
    }
  }

  return { ok: errors.length === 0, errors };
};
