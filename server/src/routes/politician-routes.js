import express from "express";
import {
  createPoliticianHandler,
  deletePoliticianHandler,
  getPoliticianHandler,
  getPoliticianBySlugHandler,
  listPoliticiansHandler,
  updatePoliticianHandler,
} from "../controllers/politician-controller.js";

import jwtAuth from "../middlewares/jwt-auth.js";
import requireRole from "../middlewares/require-role.js";

const router = express.Router();

// Public routes (citizens/guests)
router.get("/", listPoliticiansHandler);
router.get("/slug/:slug", getPoliticianBySlugHandler);
router.get("/:id", getPoliticianHandler);

// Admin: x-admin-key (Postman) or Clerk admin
router.post("/", jwtAuth, requireRole(["admin"]), createPoliticianHandler);

// PATCH for partial updates (can switch to PUT later)
router.patch("/:id", jwtAuth, requireRole(["admin"]), updatePoliticianHandler);

router.delete("/:id", jwtAuth, requireRole(["admin"]), deletePoliticianHandler);

export default router;
