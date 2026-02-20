import Politician from "../models/Politician.js";

/**
 * Convert any text into a URL-friendly slug.
 * Example: "Anura Kumara Dissanayake" -> "anura-kumara-dissanayake"
 */
const toSlug = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters
    .replace(/\s+/g, "-") // spaces -> dash
    .replace(/-+/g, "-"); // collapse multiple dashes

/**
 * Ensure slug is unique by appending "-2", "-3", etc.
 * This avoids duplicate profile URLs.
 */
const generateUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 2;

  // If excludeId is given, ignore that record when checking uniqueness (update case)
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

/**
 * CREATE politician (Admin registers)
 * - If slug not provided, generate from fullName
 * - Force slug uniqueness
 */
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

/**
 * LIST politicians (public/citizen)
 * Supports:
 * - pagination (page, limit)
 * - search across fullName/party/district (no DB index required)
 * - optional isActive filter
 */
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

  // SAFE SEARCH (regex search so it works even without text indexes)
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

/**
 * GET single politician by MongoDB _id (profile view)
 */
export const getPoliticianById = async (id) => {
  return Politician.findById(id);
};

/**
 * GET single politician by slug (clean profile URLs)
 * Example: /api/politicians/slug/anura-kumara-dissanayake
 */
export const getPoliticianBySlug = async (slug) => {
  return Politician.findOne({ slug });
};

/**
 * UPDATE politician by id
 * - If slug is provided, normalize and ensure unique
 * - If fullName changes and slug is NOT provided, we keep old slug (stable URL)
 */
export const updatePoliticianById = async (id, data) => {
  // If slug is being updated, normalize + ensure uniqueness
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

/**
 * SOFT DELETE (recommended)
 * We do NOT remove politician from DB because promises/evidence will link to them.
 * Instead, we mark them inactive.
 */
export const deletePoliticianById = async (id) => {
  const updated = await Politician.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  return updated;
};
