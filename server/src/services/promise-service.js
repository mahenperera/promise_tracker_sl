import PromiseModel from "../models/Promise.js";
import Politician from "../models/Politician.js";

// Convert any text into a URL-friendly slug
const toSlug = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Generate unique slug per politician
const generateUniqueSlug = async (politicianId, baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 2;

  const existsQuery = (s) => {
    const q = { politicianId, slug: s };
    if (excludeId) q._id = { $ne: excludeId };
    return q;
  };

  while (await PromiseModel.exists(existsQuery(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

// Create promise
export const createPromise = async (data) => {
  const politicianExists = await Politician.exists({
    _id: data.politicianId,
  });

  if (!politicianExists) {
    const error = new Error("Invalid politicianId. Politician not found.");
    error.statusCode = 400;
    throw error;
  }

  const baseSlug = data.slug ? toSlug(data.slug) : toSlug(data.title);

  const uniqueSlug = await generateUniqueSlug(data.politicianId, baseSlug);

  const promise = await PromiseModel.create({
    ...data,
    slug: uniqueSlug,
    isActive: data.isActive ?? true,
  });

  return promise;
};

// Get all promises
export const getPromises = async ({
  search = "",
  page = 1,
  limit = 10,
  politicianId,
  status,
  isActive,
}) => {
  const query = {};

  if (politicianId) query.politicianId = politicianId;

  if (status) query.status = status;

  if (typeof isActive !== "undefined") {
    query.isActive = isActive === "true" || isActive === true;
  }

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { title: { $regex: s, $options: "i" } },
      { description: { $regex: s, $options: "i" } },
      { category: { $regex: s, $options: "i" } },
    ];
  }

  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    PromiseModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("politicianId", "fullName slug party")
      .populate("createdBy", "fullName email role"),

    PromiseModel.countDocuments(query),
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

// Get promise
export const getPromiseById = async (id) => {
  return PromiseModel.findById(id)
    .populate("politicianId", "fullName slug party")
    .populate("createdBy", "fullName email role");
};

// Get promise by slug
export const getPromiseBySlug = async (politicianId, slug) => {
  return PromiseModel.findOne({ politicianId, slug })
    .populate("politicianId", "fullName slug party")
    .populate("createdBy", "fullName email role");
};

// Update promise
export const updatePromiseById = async (id, data) => {
  if (data.slug && data.politicianId) {
    const baseSlug = toSlug(data.slug);
    data.slug = await generateUniqueSlug(data.politicianId, baseSlug, id);
  }

  if (data.slug && !data.politicianId) {
    // fetch existing promise to get politicianId
    const existing = await PromiseModel.findById(id);
    if (existing) {
      const baseSlug = toSlug(data.slug);
      data.slug = await generateUniqueSlug(existing.politicianId, baseSlug, id);
    }
  }

  const updated = await PromiseModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return updated;
};

// Deactivate promise
export const deactivatePromiseById = async (id) => {
  return PromiseModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

// Delete promise
export const deletePromiseById = async (id) => {
  return PromiseModel.findByIdAndDelete(id);
};
