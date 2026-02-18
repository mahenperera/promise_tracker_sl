import express from "express";
import {
  createPoliticianHandler,
  deletePoliticianHandler,
  getPoliticianHandler,
  getPoliticianBySlugHandler,
  listPoliticiansHandler,
  updatePoliticianHandler,
} from "../controllers/politician-controller.js";

import clerkAuth from "../middlewares/clerk-auth.js";
import requireRole from "../middlewares/require-role.js";
import devAdminKey from "../middlewares/dev-admin-key.js";

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
router.post(
  "/",
  devAdminKey,
  (req, res, next) => (req.devAdmin ? next() : clerkAuth(req, res, next)),
  (req, res, next) =>
    req.devAdmin ? next() : requireRole(["ADMIN"])(req, res, next),
  createPoliticianHandler,
);

/**
 * PATCH is fine (partial update).
 * (If you prefer PUT, we can change it later.)
 */
router.patch(
  "/:id",
  devAdminKey,
  (req, res, next) => (req.devAdmin ? next() : clerkAuth(req, res, next)),
  (req, res, next) =>
    req.devAdmin ? next() : requireRole(["ADMIN"])(req, res, next),
  updatePoliticianHandler,
);

router.delete(
  "/:id",
  devAdminKey,
  (req, res, next) => (req.devAdmin ? next() : clerkAuth(req, res, next)),
  (req, res, next) =>
    req.devAdmin ? next() : requireRole(["ADMIN"])(req, res, next),
  deletePoliticianHandler,
);

export default router;
