import express from "express";
import {
  createPoliticianHandler,
  deletePoliticianHandler,
  getPoliticianHandler,
  getPoliticianBySlugHandler,
  listPoliticiansHandler,
  updatePoliticianHandler,
} from "../controllers/politician-controller.js";

import { authenticate } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/require-role.js";

const router = express.Router();

/**
 * PUBLIC routes (citizens/guests)
 */
router.get("/", listPoliticiansHandler);
router.get("/slug/:slug", getPoliticianBySlugHandler);
router.get("/:id", getPoliticianHandler);

/**
 * ADMIN routes
 * - devAdminKey lets you test with Postman (x-admin-key) without Clerk
 * - if devAdmin is NOT used, we fall back to Clerk auth + ADMIN role
 */
router.post("/", authenticate, requireRole(["admin"]), createPoliticianHandler);

/**
 * PATCH is fine (partial update).
 * (If you prefer PUT, we can change it later.)
 */
router.patch(
  "/:id",
  authenticate,
  requireRole(["admin"]),
  updatePoliticianHandler,
);

router.delete(
  "/:id",
  authenticate,
  requireRole(["admin"]),
  deletePoliticianHandler,
);

export default router;
