import Politician from "../models/Politician.js";

// Make a URL-friendly slug (e.g., "Anura Kumara" -> "anura-kumara")
const toSlug = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Make slug unique by adding -2, -3, etc.
const generateUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 2;

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

export const createPolitician = async (data) => {
  const baseSlug = data.slug ? toSlug(data.slug) : toSlug(data.fullName);
  const uniqueSlug = await generateUniqueSlug(baseSlug);

  const politician = await Politician.create({
    ...data,
    slug: uniqueSlug,
    isActive: data.isActive ?? true,
  });

  return politician;
};

export const getPoliticians = async ({
  search = "",
  page = 1,
  limit = 10,
  isActive,
}) => {
  const query = {};

  if (typeof isActive !== "undefined") {
    query.isActive = isActive === "true" || isActive === true;
  }

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

export const getPoliticianById = async (id) => {
  return Politician.findById(id);
};

export const getPoliticianBySlug = async (slug) => {
  return Politician.findOne({ slug });
};

export const updatePoliticianById = async (id, data) => {
  if (data.slug) {
    const baseSlug = toSlug(data.slug);
    data.slug = await generateUniqueSlug(baseSlug, id);
  }

  return Politician.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deletePoliticianById = async (id) => {
  return Politician.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
