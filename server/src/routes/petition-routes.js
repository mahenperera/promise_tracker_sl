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

// PUBLIC list approved
router.get("/", listPublicPetitionsHandler);

// CITIZEN
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

// ADMIN
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

// PUBLIC-ish by id (approved public, else owner/admin)
router.get("/:id", jwtAuth.optional, getPetitionHandler);

export default router;
