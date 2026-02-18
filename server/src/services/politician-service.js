import Politician from "../models/Politician.js";

/**
 * Turn a name into a URL-friendly slug.
 * Example: "Anura Kumara Dissanayake" -> "anura-kumara-dissanayake"
 */
const toSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters
    .replace(/\s+/g, "-") // spaces to -
    .replace(/-+/g, "-"); // remove double --

/**
 * Ensure slug is unique by appending "-2", "-3" etc. if needed.
 */
const generateUniqueSlug = async (baseSlug) => {
  let slug = baseSlug;
  let counter = 2;

  while (await Politician.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

export const createPolitician = async (data) => {
  // If slug not provided, generate from fullName
  const baseSlug = data.slug ? toSlug(data.slug) : toSlug(data.fullName);
  const uniqueSlug = await generateUniqueSlug(baseSlug);

  const politician = await Politician.create({
    ...data,
    slug: uniqueSlug,
  });

  return politician;
};

export const getPoliticians = async ({ search = "", page = 1, limit = 10 }) => {
  const query = {};

  // Simple search across fullName/party/district using text index
  if (search && search.trim()) {
    query.$text = { $search: search.trim() };
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

export const getPoliticianById = async (id) => {
  const politician = await Politician.findById(id);
  return politician;
};

export const updatePoliticianById = async (id, data) => {
  // If slug is being updated, normalize + ensure uniqueness
  if (data.slug) {
    const baseSlug = toSlug(data.slug);
    // If slug belongs to same politician, allow it. Otherwise ensure uniqueness.
    const existing = await Politician.findOne({ slug: baseSlug });
    if (existing && existing._id.toString() !== id) {
      data.slug = await generateUniqueSlug(baseSlug);
    } else {
      data.slug = baseSlug;
    }
  }

  // If fullName updated and slug not provided, we keep old slug (stable URLs).
  const updated = await Politician.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return updated;
};

export const deletePoliticianById = async (id) => {
  const deleted = await Politician.findByIdAndDelete(id);
  return deleted;
};
