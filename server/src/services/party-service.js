import Party from "../models/Party.js";
import Politician from "../models/Politician.js";

const toSlug = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const generateUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 2;

  const existsQuery = (s) => {
    const q = { slug: s };
    if (excludeId) q._id = { $ne: excludeId };
    return q;
  };

  while (await Party.exists(existsQuery(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return slug;
};

export const createParty = async (data) => {
  const code = data.code.trim().toUpperCase();
  const baseSlug = data.slug ? toSlug(data.slug) : toSlug(code);
  const slug = await generateUniqueSlug(baseSlug);

  const party = await Party.create({
    ...data,
    code,
    slug,
    isActive: data.isActive ?? true,
  });

  return party;
};

export const getParties = async ({
  search = "",
  page = 1,
  limit = 10,
  isActive,
} = {}) => {
  const query = {};

  if (typeof isActive !== "undefined") {
    query.isActive = isActive === "true" || isActive === true;
  }

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { name: { $regex: s, $options: "i" } },
      { code: { $regex: s, $options: "i" } },
    ];
  }

  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Party.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Party.countDocuments(query),
  ]);

  // add politician counts (simple + reliable)
  const itemsWithCounts = await Promise.all(
    items.map(async (p) => {
      const count = await Politician.countDocuments({
        isActive: true,
        party: p.code, // politician.party stores code like "NPP"
      });

      const obj = p.toObject();
      return {
        ...obj,
        count,
        partyLogoUrl: obj.logoUrl || "", // ✅ keep compatibility with your UI
      };
    }),
  );

  return {
    items: itemsWithCounts,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const getPartyBySlug = async (slug) => {
  return Party.findOne({ slug });
};

export const getPartyProfileBySlug = async ({
  slug,
  page = 1,
  limit = 12,
  isActive = true,
} = {}) => {
  const party = await Party.findOne({ slug });
  if (!party) return null;

  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const q = { party: party.code };
  if (typeof isActive !== "undefined")
    q.isActive = isActive === "true" || isActive === true;

  const [politicians, total] = await Promise.all([
    Politician.find(q).sort({ fullName: 1 }).skip(skip).limit(safeLimit),
    Politician.countDocuments(q),
  ]);

  const partyObj = party.toObject();
  const count = await Politician.countDocuments({
    isActive: true,
    party: party.code,
  });

  return {
    party: {
      ...partyObj,
      count,
      partyLogoUrl: partyObj.logoUrl || "",
    },
    politicians,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const updatePartyById = async (id, data) => {
  if (data.slug) {
    const baseSlug = toSlug(data.slug);
    data.slug = await generateUniqueSlug(baseSlug, id);
  }

  if (data.code) {
    data.code = data.code.trim().toUpperCase();
  }

  return Party.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deletePartyById = async (id) => {
  return Party.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
