import express from "express";
import {
  createPromiseHandler,
  deletePromiseHandler,
  getPromiseHandler,
  getPromiseBySlugHandler,
  listPromisesHandler,
  updatePromiseHandler,
} from "../controllers/promise-controller.js";

import { authenticate } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/require-role.js";

const router = express.Router();

router.get("/", listPromisesHandler);

router.get("/slug/:politicianId/:slug", getPromiseBySlugHandler);

router.get("/:id", getPromiseHandler);

router.post(
  "/",
  authenticate,
  requireRole(["admin", "politician"]),
  createPromiseHandler,
);

router.patch(
  "/:id",
  authenticate,
  requireRole(["admin", "politician"]),
  updatePromiseHandler,
);

router.delete(
  "/:id",
  authenticate,
  requireRole(["admin", "politician"]),
  deletePromiseHandler,
);

export default router;
