import express from "express";
import {
  createPromiseHandler,
  deletePromiseHandler,
  getPromiseHandler,
  getPromiseBySlugHandler,
  listPromisesHandler,
  updatePromiseHandler,
} from "../controllers/promise-controller.js";

import jwtAuth from "../middlewares/jwt-auth.js";
import requireRole from "../middlewares/require-role.js";

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
router.post("/", jwtAuth, requireRole(["admin"]), createPromiseHandler);

router.patch("/:id", jwtAuth, requireRole(["admin"]), updatePromiseHandler);

router.delete("/:id", jwtAuth, requireRole(["admin"]), deletePromiseHandler);

export default router;
