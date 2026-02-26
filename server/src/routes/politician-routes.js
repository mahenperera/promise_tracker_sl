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
router.post("/", jwtAuth, requireRole(["admin"]), createPoliticianHandler);

/**
 * PATCH is fine (partial update).
 * (If you prefer PUT, we can change it later.)
 */
router.patch("/:id", jwtAuth, requireRole(["admin"]), updatePoliticianHandler);

router.delete("/:id", jwtAuth, requireRole(["admin"]), deletePoliticianHandler);

export default router;
