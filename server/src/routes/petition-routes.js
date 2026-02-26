import express from "express";
import jwtAuth from "../middlewares/jwt-auth.js";
import requireRole from "../middlewares/require-role.js";

import {
  adminApprovePetitionHandler,
  adminListPetitionsHandler,
  adminRejectPetitionHandler,
  createPetitionHandler,
  getPetitionHandler,
  listMyPetitionsHandler,
  listPublicPetitionsHandler,
  signPetitionHandler,
} from "../controllers/petition-controller.js";

const router = express.Router();

/**
 * PUBLIC
 * list approved petitions
 */
router.get("/", listPublicPetitionsHandler);

/**
 * PUBLIC-ish (but if not approved, only owner/admin can see)
 * We allow optional jwtAuth (if token exists).
 * Easiest approach: keep two routes:
 *  - public route -> only approved will be visible
 *  - private route -> owner/admin can view anything
 *
 * So:
 *  - GET /:id (public approved only)
 *  - GET /private/:id (jwt required, owner/admin allowed)
 */
router.get("/:id", getPetitionHandler);

/**
 * CITIZEN
 */
router.post(
  "/",
  jwtAuth,
  requireRole(["citizen", "admin"]),
  createPetitionHandler,
);
router.get(
  "/mine/list",
  jwtAuth,
  requireRole(["citizen", "admin"]),
  listMyPetitionsHandler,
);
router.post(
  "/:id/sign",
  jwtAuth,
  requireRole(["citizen", "admin"]),
  signPetitionHandler,
);

/**
 * ADMIN
 */
router.get(
  "/admin/all",
  jwtAuth,
  requireRole(["admin"]),
  adminListPetitionsHandler,
);
router.patch(
  "/admin/:id/approve",
  jwtAuth,
  requireRole(["admin"]),
  adminApprovePetitionHandler,
);
router.patch(
  "/admin/:id/reject",
  jwtAuth,
  requireRole(["admin"]),
  adminRejectPetitionHandler,
);

export default router;
