import {
  createPromise,
  deletePromiseById,
  getPromiseById,
  getPromiseBySlug,
  getPromises,
  updatePromiseById,
} from "../services/promise-service.js";

import {
  validateCreatePromise,
  validateUpdatePromise,
} from "../validators/promise-validator.js";

/**
 * Controller = handles req/res only.
 * All DB logic stays inside the service layer.
 */

export const createPromiseHandler = async (req, res, next) => {
  try {
    const validation = validateCreatePromise(req.body);
    if (!validation.ok) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validation.errors });
    }

    const promise = await createPromise(req.body);

    return res.status(201).json({ message: "Promise created", data: promise });
  } catch (err) {
    return next(err);
  }
};

export const listPromisesHandler = async (req, res, next) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      politicianId,
      status,
      isActive,
    } = req.query;

    const result = await getPromises({
      search,
      page,
      limit,
      politicianId,
      status,
      isActive,
    });

    return res.status(200).json({ message: "Promises fetched", ...result });
  } catch (err) {
    return next(err);
  }
};

export const getPromiseHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const promise = await getPromiseById(id);
    if (!promise) {
      return res.status(404).json({ message: "Promise not found" });
    }

    return res.status(200).json({ message: "Promise fetched", data: promise });
  } catch (err) {
    return next(err);
  }
};

export const getPromiseBySlugHandler = async (req, res, next) => {
  try {
    const { politicianId, slug } = req.params;

    const promise = await getPromiseBySlug(politicianId, slug);
    if (!promise) {
      return res.status(404).json({ message: "Promise not found" });
    }

    return res.status(200).json({ message: "Promise fetched", data: promise });
  } catch (err) {
    return next(err);
  }
};

export const updatePromiseHandler = async (req, res, next) => {
  try {
    const validation = validateUpdatePromise(req.body);
    if (!validation.ok) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validation.errors });
    }

    const { id } = req.params;

    const updated = await updatePromiseById(id, req.body);

    if (!updated) {
      return res.status(404).json({ message: "Promise not found" });
    }

    return res.status(200).json({ message: "Promise updated", data: updated });
  } catch (err) {
    return next(err);
  }
};

export const deletePromiseHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await deletePromiseById(id);

    if (!updated) {
      return res.status(404).json({ message: "Promise not found" });
    }

    return res.status(200).json({ message: "Promise deleted", data: updated });
  } catch (err) {
    return next(err);
  }
};
