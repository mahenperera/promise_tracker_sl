import express from "express";
import {
  createPoliticianHandler,
  deletePoliticianHandler,
  getPoliticianHandler,
  listPoliticiansHandler,
  updatePoliticianHandler,
} from "../controllers/politician-controller.js";

import clerkAuth from "../middlewares/clerk-auth.js";

import requireRole from "../middlewares/require-role.js";

import { devAdminKey } from "../middlewares/dev-admin-key.js";

const router = express.Router();

/**
 * PUBLIC routes (citizens/guests)
 */
router.get("/", listPoliticiansHandler);
router.get("/:id", getPoliticianHandler);

/**
 * ADMIN routes
 * - devAdminKey() lets you use Postman with x-admin-key in local dev
 * - clerkAuth + requireRole('ADMIN') is the real protection
 */
router.post(
  "/",
  devAdminKey,
  (req, res, next) => (req.devAdmin ? next() : clerkAuth(req, res, next)),
  (req, res, next) =>
    req.devAdmin ? next() : requireRole(["ADMIN"])(req, res, next),
  createPoliticianHandler,
);

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
