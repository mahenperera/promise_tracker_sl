import {
  createPolitician,
  deletePoliticianById,
  getPoliticianById,
  getPoliticianBySlug,
  getPoliticians,
  updatePoliticianById,
} from "../services/politician-service.js";

import {
  validateCreatePolitician,
  validateUpdatePolitician,
} from "../validators/politician-validator.js";

/**
 * Controller = handles req/res only.
 * All DB logic stays inside the service layer.
 */

export const createPoliticianHandler = async (req, res, next) => {
  try {
    const validation = validateCreatePolitician(req.body);
    if (!validation.ok) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validation.errors });
    }

    const politician = await createPolitician(req.body);

    return res
      .status(201)
      .json({ message: "Politician created", data: politician });
  } catch (err) {
    return next(err);
  }
};

export const listPoliticiansHandler = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 10, isActive } = req.query;
    const result = await getPoliticians({ search, page, limit, isActive });

    return res.status(200).json({ message: "Politicians fetched", ...result });
  } catch (err) {
    return next(err);
  }
};

export const getPoliticianHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const politician = await getPoliticianById(id);
    if (!politician) {
      return res.status(404).json({ message: "Politician not found" });
    }

    return res
      .status(200)
      .json({ message: "Politician fetched", data: politician });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get by slug (clean public profile URLs)
 */
export const getPoliticianBySlugHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const politician = await getPoliticianBySlug(slug);
    if (!politician) {
      return res.status(404).json({ message: "Politician not found" });
    }

    return res
      .status(200)
      .json({ message: "Politician fetched", data: politician });
  } catch (err) {
    return next(err);
  }
};

export const updatePoliticianHandler = async (req, res, next) => {
  try {
    const validation = validateUpdatePolitician(req.body);
    if (!validation.ok) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validation.errors });
    }

    const { id } = req.params;
    const updated = await updatePoliticianById(id, req.body);

    if (!updated) {
      return res.status(404).json({ message: "Politician not found" });
    }

    return res
      .status(200)
      .json({ message: "Politician updated", data: updated });
  } catch (err) {
    return next(err);
  }
};

export const deletePoliticianHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete (sets isActive false)
    const updated = await deletePoliticianById(id);

    if (!updated) {
      return res.status(404).json({ message: "Politician not found" });
    }

    return res
      .status(200)
      .json({ message: "Politician deactivated", data: updated });
  } catch (err) {
    return next(err);
  }
};
