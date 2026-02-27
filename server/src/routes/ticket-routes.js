import express from "express";
import jwtAuth from "../middlewares/jwt-auth.js";
import requireRole from "../middlewares/require-role.js";

import {
  createTicketHandler,
  listTicketsHandler,
  getTicketHandler,
  replyTicketHandler,
  updateTicketHandler,
  assignTicketHandler,
  deleteTicketHandler,
} from "../controllers/ticket-controller.js";

const router = express.Router();

// Citizen routes
router.post("/", jwtAuth, requireRole(["citizen"]), createTicketHandler);

router.get("/", jwtAuth, listTicketsHandler);

router.get("/:id", jwtAuth, getTicketHandler);

router.post("/:id/reply", jwtAuth, replyTicketHandler);

// Admin routes
router.patch("/:id", jwtAuth, requireRole(["admin"]), updateTicketHandler);

router.patch(
  "/:id/assign",
  jwtAuth,
  requireRole(["admin"]),
  assignTicketHandler,
);

router.delete("/:id", jwtAuth, requireRole(["admin"]), deleteTicketHandler);

export default router;
