import {
  createParty,
  deletePartyById,
  getParties,
  getPartyBySlug,
  getPartyProfileBySlug,
  updatePartyById,
} from "../services/party-service.js";

import {
  validateCreateParty,
  validateUpdateParty,
} from "../validators/party-validator.js";

export const createPartyHandler = async (req, res, next) => {
  try {
    const validation = validateCreateParty(req.body);
    if (!validation.ok) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validation.errors });
    }

    const party = await createParty(req.body);
    return res.status(201).json({ message: "Party created", data: party });
  } catch (err) {
    return next(err);
  }
};

export const listPartiesHandler = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 10, isActive } = req.query;
    const result = await getParties({ search, page, limit, isActive });
    return res.status(200).json({ message: "Parties fetched", ...result });
  } catch (err) {
    return next(err);
  }
};

// GET /api/parties/:slug  (party + politicians)
export const getPartyBySlugHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12, isActive = "true" } = req.query;

    const data = await getPartyProfileBySlug({ slug, page, limit, isActive });
    if (!data) return res.status(404).json({ message: "Party not found" });

    return res.status(200).json({ message: "Party fetched", data });
  } catch (err) {
    return next(err);
  }
};

// GET /api/parties/:slug/politicians  (same as above but focused)
export const getPartyPoliticiansBySlugHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12, isActive = "true" } = req.query;

    const data = await getPartyProfileBySlug({ slug, page, limit, isActive });
    if (!data) return res.status(404).json({ message: "Party not found" });

    return res.status(200).json({
      message: "Party politicians fetched",
      data: {
        party: data.party,
        politicians: data.politicians,
        meta: data.meta,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const updatePartyHandler = async (req, res, next) => {
  try {
    const validation = validateUpdateParty(req.body);
    if (!validation.ok) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validation.errors });
    }

    const updated = await updatePartyById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Party not found" });

    return res.status(200).json({ message: "Party updated", data: updated });
  } catch (err) {
    return next(err);
  }
};

export const deletePartyHandler = async (req, res, next) => {
  try {
    const updated = await deletePartyById(req.params.id);
    if (!updated) return res.status(404).json({ message: "Party not found" });

    return res
      .status(200)
      .json({ message: "Party deactivated", data: updated });
  } catch (err) {
    return next(err);
  }
};
