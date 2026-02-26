import {
  adminApprovePetition,
  adminListPetitions,
  adminRejectPetition,
  createPetition,
  getPetitionByIdWithAccess,
  listMyPetitions,
  listPublicPetitions,
  signPetition,
} from "../services/petition-service.js";

import {
  validateCreatePetition,
  validateObjectIdParam,
  validateRejectPetition,
} from "../validators/petition-validator.js";

// CITIZEN: create petition -> submitted
export const createPetitionHandler = async (req, res, next) => {
  try {
    const validation = validateCreatePetition(req.body);
    if (!validation.ok) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validation.errors });
    }

    const userId = req.user.userId;
    const petition = await createPetition(userId, req.body);

    return res
      .status(201)
      .json({ message: "Petition submitted", data: petition });
  } catch (err) {
    return next(err);
  }
};

// PUBLIC: list approved petitions
export const listPublicPetitionsHandler = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const result = await listPublicPetitions({ search, page, limit });
    return res.status(200).json({ message: "Petitions fetched", ...result });
  } catch (err) {
    return next(err);
  }
};

// CITIZEN: list my petitions (any status)
export const listMyPetitionsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;

    const result = await listMyPetitions(userId, { page, limit });
    return res.status(200).json({ message: "My petitions fetched", ...result });
  } catch (err) {
    return next(err);
  }
};

// PUBLIC/OWNER/ADMIN: get petition by id with access rules
export const getPetitionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const idVal = validateObjectIdParam(id);
    if (!idVal.ok)
      return res
        .status(400)
        .json({ message: "Validation failed", errors: idVal.errors });

    // user may be missing if public route hits this
    const userId = req.user?.userId || "";
    const role = req.user?.role || "";

    const petition = await getPetitionByIdWithAccess(id, userId, role);

    if (!petition)
      return res.status(404).json({ message: "Petition not found" });
    if (petition === "FORBIDDEN")
      return res.status(403).json({ error: "Forbidden" });

    return res
      .status(200)
      .json({ message: "Petition fetched", data: petition });
  } catch (err) {
    return next(err);
  }
};

// CITIZEN: sign approved petition once
export const signPetitionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const idVal = validateObjectIdParam(id);
    if (!idVal.ok)
      return res
        .status(400)
        .json({ message: "Validation failed", errors: idVal.errors });

    const userId = req.user.userId;

    const result = await signPetition(id, userId);

    if (result?.error === "NOT_FOUND")
      return res.status(404).json({ message: "Petition not found" });
    if (result?.error === "NOT_SIGNABLE")
      return res.status(400).json({ message: "Petition is not signable" });
    if (result?.error === "ALREADY_SIGNED")
      return res.status(409).json({ message: "Already signed" });

    return res.status(200).json({ message: "Signed successfully" });
  } catch (err) {
    return next(err);
  }
};

// ADMIN: list all petitions
export const adminListPetitionsHandler = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, search = "" } = req.query;
    const result = await adminListPetitions({ status, page, limit, search });
    return res
      .status(200)
      .json({ message: "Admin petitions fetched", ...result });
  } catch (err) {
    return next(err);
  }
};

// ADMIN: approve
export const adminApprovePetitionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const idVal = validateObjectIdParam(id);
    if (!idVal.ok)
      return res
        .status(400)
        .json({ message: "Validation failed", errors: idVal.errors });

    const adminUserId = req.user.userId;
    const updated = await adminApprovePetition(id, adminUserId);

    if (!updated)
      return res.status(404).json({ message: "Petition not found" });

    return res
      .status(200)
      .json({ message: "Petition approved", data: updated });
  } catch (err) {
    return next(err);
  }
};

// ADMIN: reject
export const adminRejectPetitionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const idVal = validateObjectIdParam(id);
    if (!idVal.ok)
      return res
        .status(400)
        .json({ message: "Validation failed", errors: idVal.errors });

    const validation = validateRejectPetition(req.body);
    if (!validation.ok) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validation.errors });
    }

    const adminUserId = req.user.userId;
    const reason = req.body.rejectionReason || "";

    const updated = await adminRejectPetition(id, adminUserId, reason);

    if (!updated)
      return res.status(404).json({ message: "Petition not found" });

    return res
      .status(200)
      .json({ message: "Petition rejected", data: updated });
  } catch (err) {
    return next(err);
  }
};
