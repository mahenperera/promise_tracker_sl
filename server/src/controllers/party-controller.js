// import {
//   createParty,
//   deletePartyById,
//   getParties,
//   getPartyById,
//   getPartyBySlug,
//   updatePartyById,
//   getPoliticiansByPartyCode,
// } from "../services/party-service.js";

// import {
//   validateCreateParty,
//   validateUpdateParty,
// } from "../validators/party-validator.js";

// export const createPartyHandler = async (req, res, next) => {
//   try {
//     const validation = validateCreateParty(req.body);
//     if (!validation.ok) {
//       return res
//         .status(400)
//         .json({ message: "Validation failed", errors: validation.errors });
//     }

//     const party = await createParty(req.body);
//     return res.status(201).json({ message: "Party created", data: party });
//   } catch (err) {
//     return next(err);
//   }
// };

// export const listPartiesHandler = async (req, res, next) => {
//   try {
//     const { search = "", page = 1, limit = 10, isActive } = req.query;
//     const result = await getParties({ search, page, limit, isActive });
//     return res.status(200).json({ message: "Parties fetched", ...result });
//   } catch (err) {
//     return next(err);
//   }
// };

// export const getPartyHandler = async (req, res, next) => {
//   try {
//     const party = await getPartyById(req.params.id);
//     if (!party) return res.status(404).json({ message: "Party not found" });
//     return res.status(200).json({ message: "Party fetched", data: party });
//   } catch (err) {
//     return next(err);
//   }
// };

// export const getPartyBySlugHandler = async (req, res, next) => {
//   try {
//     const party = await getPartyBySlug(req.params.slug);
//     if (!party) return res.status(404).json({ message: "Party not found" });
//     return res.status(200).json({ message: "Party fetched", data: party });
//   } catch (err) {
//     return next(err);
//   }
// };

// export const getPartyPoliticiansBySlugHandler = async (req, res, next) => {
//   try {
//     const party = await getPartyBySlug(req.params.slug);
//     if (!party) return res.status(404).json({ message: "Party not found" });

//     const politicians = await getPoliticiansByPartyCode(party.code);
//     return res.status(200).json({
//       message: "Party politicians fetched",
//       party,
//       politicians,
//     });
//   } catch (err) {
//     return next(err);
//   }
// };

// export const updatePartyHandler = async (req, res, next) => {
//   try {
//     const validation = validateUpdateParty(req.body);
//     if (!validation.ok) {
//       return res
//         .status(400)
//         .json({ message: "Validation failed", errors: validation.errors });
//     }

//     const updated = await updatePartyById(req.params.id, req.body);
//     if (!updated) return res.status(404).json({ message: "Party not found" });

//     return res.status(200).json({ message: "Party updated", data: updated });
//   } catch (err) {
//     return next(err);
//   }
// };

// export const deletePartyHandler = async (req, res, next) => {
//   try {
//     const updated = await deletePartyById(req.params.id);
//     if (!updated) return res.status(404).json({ message: "Party not found" });

//     return res
//       .status(200)
//       .json({ message: "Party deactivated", data: updated });
//   } catch (err) {
//     return next(err);
//   }
// };

import { getPartyBySlug, listParties } from "../services/party-service.js";

export const listPartiesHandler = async (req, res, next) => {
  try {
    const items = await listParties();
    return res.status(200).json({ message: "Parties fetched", items });
  } catch (e) {
    return next(e);
  }
};

export const getPartyBySlugHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const data = await getPartyBySlug(slug);

    if (!data) return res.status(404).json({ message: "Party not found" });

    return res.status(200).json({ message: "Party fetched", data });
  } catch (e) {
    return next(e);
  }
};
