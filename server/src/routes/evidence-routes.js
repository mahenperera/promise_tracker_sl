import express from "express";
import {
    addEvidenceHandler,
    getEvidenceHandler,
    submitVoteHandler,
    updateStatusHandler,
    getVotesHandler,
    getUserEvidenceHandler
} from "../controllers/evidence-controller.js";

import jwtAuth from "../middlewares/jwt-auth.js";
import requireRole from "../middlewares/require-role.js";

const router = express.Router();

/**
 * PUBLIC Routes
 */
// Fetch all active chronological evidence for a particular promise
router.get("/promise/:promiseId", getEvidenceHandler);

// Fetch all verification interactions (upvotes/downvotes/flags/comments) for an evidence item
router.get("/:id/votes", getVotesHandler);

// Fetch all evidence submitted by a specific user 
router.get("/user/:userId", getUserEvidenceHandler);

/**
 * PROTECTED Citizen Routes
 */
// Add new evidence
router.post("/", jwtAuth, addEvidenceHandler);

// Submit a vote or flag on a piece of evidence
router.post("/:id/verify", jwtAuth, submitVoteHandler);


/**
 * ADMIN Routes
 */
// Admin forcefully override status of a piece of evidence
router.patch("/:id/status", jwtAuth, requireRole(["admin"]), updateStatusHandler);

export default router;
