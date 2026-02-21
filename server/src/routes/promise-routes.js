import express from "express";
import {
  createPromiseHandler,
  deletePromiseHandler,
  getPromiseHandler,
  getPromiseBySlugHandler,
  listPromisesHandler,
  updatePromiseHandler,
} from "../controllers/promise-controller.js";

import clerkAuth from "../middlewares/clerk-auth.js";
import requireRole from "../middlewares/require-role.js";
import devAdminKey from "../middlewares/dev-admin-key.js";

const router = express.Router();

/**
 * PUBLIC routes (citizens/guests)
 */
router.get("/", listPromisesHandler);

// Clean public URLs per politician
router.get("/slug/:politicianId/:slug", getPromiseBySlugHandler);

router.get("/:id", getPromiseHandler);

/**
 * ADMIN routes
 */
router.post(
  "/",
  devAdminKey,
  (req, res, next) => (req.devAdmin ? next() : clerkAuth(req, res, next)),
  (req, res, next) =>
    req.devAdmin ? next() : requireRole(["ADMIN"])(req, res, next),
  createPromiseHandler,
);

router.patch(
  "/:id",
  devAdminKey,
  (req, res, next) => (req.devAdmin ? next() : clerkAuth(req, res, next)),
  (req, res, next) =>
    req.devAdmin ? next() : requireRole(["ADMIN"])(req, res, next),
  updatePromiseHandler,
);

router.delete(
  "/:id",
  devAdminKey,
  (req, res, next) => (req.devAdmin ? next() : clerkAuth(req, res, next)),
  (req, res, next) =>
    req.devAdmin ? next() : requireRole(["ADMIN"])(req, res, next),
  deletePromiseHandler,
);

export default router;
