// import Party from "../models/Party.js";
// import Politician from "../models/Politician.js";

// const toSlug = (text = "") =>
//   text
//     .toString()
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/-+/g, "-");

// const generateUniqueSlug = async (baseSlug, excludeId = null) => {
//   let slug = baseSlug;
//   let counter = 2;

//   const existsQuery = (s) => {
//     const q = { slug: s };
//     if (excludeId) q._id = { $ne: excludeId };
//     return q;
//   };

//   while (await Party.exists(existsQuery(slug))) {
//     slug = `${baseSlug}-${counter}`;
//     counter += 1;
//   }
//   return slug;
// };

// export const createParty = async (data) => {
//   const code = data.code.trim().toUpperCase();
//   const baseSlug = data.slug ? toSlug(data.slug) : toSlug(code);
//   const slug = await generateUniqueSlug(baseSlug);

//   const party = await Party.create({
//     ...data,
//     code,
//     slug,
//     isActive: data.isActive ?? true,
//   });

//   return party;
// };

// export const getParties = async ({
//   search = "",
//   page = 1,
//   limit = 10,
//   isActive,
// }) => {
//   const query = {};

//   if (typeof isActive !== "undefined") {
//     query.isActive = isActive === "true" || isActive === true;
//   }

//   if (search && search.trim()) {
//     const s = search.trim();
//     query.$or = [
//       { name: { $regex: s, $options: "i" } },
//       { code: { $regex: s, $options: "i" } },
//     ];
//   }

//   const safePage = Math.max(parseInt(page, 10) || 1, 1);
//   const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
//   const skip = (safePage - 1) * safeLimit;

//   const [items, total] = await Promise.all([
//     Party.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
//     Party.countDocuments(query),
//   ]);

//   return {
//     items,
//     meta: {
//       page: safePage,
//       limit: safeLimit,
//       total,
//       totalPages: Math.ceil(total / safeLimit),
//     },
//   };
// };

// export const getPartyById = async (id) => Party.findById(id);

// export const getPartyBySlug = async (slug) => Party.findOne({ slug });

// export const updatePartyById = async (id, data) => {
//   if (data.slug) {
//     const baseSlug = toSlug(data.slug);
//     data.slug = await generateUniqueSlug(baseSlug, id);
//   }

//   if (data.code) {
//     data.code = data.code.trim().toUpperCase();
//     // if slug not provided, keep old slug stable
//   }

//   return Party.findByIdAndUpdate(id, data, { new: true, runValidators: true });
// };

// export const deletePartyById = async (id) => {
//   return Party.findByIdAndUpdate(id, { isActive: false }, { new: true });
// };

// // Politicians in a party (by code)
// export const getPoliticiansByPartyCode = async (code) => {
//   return Politician.find({ party: code, isActive: true }).sort({
//     createdAt: -1,
//   });
// };

import Politician from "../models/Politician.js";

const toSlug = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const listParties = async () => {
  const rows = await Politician.aggregate([
    { $match: { isActive: true, party: { $ne: "" } } },
    {
      $group: {
        _id: "$party",
        count: { $sum: 1 },
        partyLogoUrl: { $first: "$partyLogoUrl" }, // ok if empty
      },
    },
    { $sort: { count: -1, _id: 1 } },
  ]);

  return rows.map((r) => ({
    name: r._id,
    slug: toSlug(r._id),
    count: r.count,
    partyLogoUrl: r.partyLogoUrl || "",
  }));
};

export const getPartyBySlug = async (slug) => {
  const parties = await listParties();
  const party = parties.find((p) => p.slug === slug);
  if (!party) return null;

  const politicians = await Politician.find({
    isActive: true,
    party: party.name,
  }).sort({ fullName: 1 });

  return { party, politicians };
};
