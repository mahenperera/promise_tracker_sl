import Politician from "../models/Politician.js";

// Make a URL-friendly slug (e.g., "Anura Kumara Dissanayake" -> "anura-kumara-dissanayake")
const toSlug = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters
    .replace(/\s+/g, "-") // spaces -> dash
    .replace(/-+/g, "-"); // collapse multiple dashes

// Make slug unique by adding -2, -3, etc. (avoids duplicate URLs)
const generateUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 2;

  // If excludeId is set, skip that record when checking uniqueness (updates)
  const existsQuery = (s) => {
    const q = { slug: s };
    if (excludeId) q._id = { $ne: excludeId };
    return q;
  };

  while (await Politician.exists(existsQuery(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

// Create politician: generate slug if missing + ensure it's unique
export const createPolitician = async (data) => {
  const baseSlug = data.slug ? toSlug(data.slug) : toSlug(data.fullName);
  const uniqueSlug = await generateUniqueSlug(baseSlug);

  const politician = await Politician.create({
    ...data,
    slug: uniqueSlug,
    // default active unless specified
    isActive: data.isActive ?? true,
  });

  return politician;
};

// List politicians: pagination + search (name/party/district) + optional isActive filter
export const getPoliticians = async ({
  search = "",
  page = 1,
  limit = 10,
  isActive,
}) => {
  const query = {};

  // filter by active status if client asks
  if (typeof isActive !== "undefined") {
    query.isActive = isActive === "true" || isActive === true;
  }

  // Safe regex search (works without text indexes)
  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { fullName: { $regex: s, $options: "i" } },
      { party: { $regex: s, $options: "i" } },
      { district: { $regex: s, $options: "i" } },
    ];
  }

  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Politician.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Politician.countDocuments(query),
  ]);

  return {
    items,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

// Get politician by _id (profile)
export const getPoliticianById = async (id) => {
  return Politician.findById(id);
};

// Get politician by slug (e.g., /api/politicians/slug/anura-kumara-dissanayake)
export const getPoliticianBySlug = async (slug) => {
  return Politician.findOne({ slug });
};

// Update by id: normalize/unique slug if given; otherwise keep old slug for stable URL
export const updatePoliticianById = async (id, data) => {
  // If slug changes, normalize it and keep it unique
  if (data.slug) {
    const baseSlug = toSlug(data.slug);
    data.slug = await generateUniqueSlug(baseSlug, id);
  }

  const updated = await Politician.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return updated;
};

// Soft delete: mark inactive (don’t remove, since other records link to them)
export const deletePoliticianById = async (id) => {
  const updated = await Politician.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  return updated;
};
