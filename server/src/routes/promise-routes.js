import express from "express";
import {
  createPromiseHandler,
  deletePromiseHandler,
  getPromiseHandler,
  getPromiseBySlugHandler,
  listPromisesHandler,
  updatePromiseHandler,
  adminUpdatePromiseStatusHandler,
} from "../controllers/promise-controller.js";

import jwtAuth from "../middlewares/jwt-auth.js";
import requireRole from "../middlewares/require-role.js";

const router = express.Router();

// Public routes for citizens
router.get("/", listPromisesHandler);

router.get("/slug/:politicianSlug/:slug", getPromiseBySlugHandler);

router.get("/:id", getPromiseHandler);

// Admin routes
router.get("/admin/all", jwtAuth, requireRole(["admin"]), listPromisesHandler);

router.patch(
  "/admin/:id/status",
  jwtAuth,
  requireRole(["admin"]),
  adminUpdatePromiseStatusHandler,
);

router.post("/", jwtAuth, requireRole(["admin"]), createPromiseHandler);

router.patch("/:id", jwtAuth, requireRole(["admin"]), updatePromiseHandler);

router.delete("/:id", jwtAuth, requireRole(["admin"]), deletePromiseHandler);

export default router;
