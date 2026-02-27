import express from "express";
import {
    addEvidenceHandler,
    getEvidenceHandler,
    submitVoteHandler,
    updateStatusHandler,
    getVotesHandler,
    getUserEvidenceHandler,
    deleteEvidenceHandler,
    getGalleryHandler
} from "../controllers/evidence-controller.js";

import jwtAuth from "../middlewares/jwt-auth.js";
import requireRole from "../middlewares/require-role.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

/**
 * PUBLIC Routes
 */
// Fetch all active chronological evidence for a particular promise
router.get("/promise/:promiseId", getEvidenceHandler);

// Fetch all verification interactions (upvotes/downvotes/flags/comments) for an evidence item
router.get("/:id/votes", getVotesHandler);

// Fetch all visual media (images/videos) for a specific promise
router.get("/gallery/:promiseId", getGalleryHandler);

/**
 * PROTECTED Citizen Routes
 */
// Get all evidence added by the logged-in user
router.get("/user", jwtAuth, getUserEvidenceHandler);

// Add new evidence
router.post("/", jwtAuth, upload.single('media'), addEvidenceHandler);

// Submit a vote or flag on a piece of evidence
router.post("/:id/verify", jwtAuth, submitVoteHandler);

// Delete a specific piece of evidence
router.delete("/:id", jwtAuth, deleteEvidenceHandler);


/**
 * ADMIN Routes
 */
// Admin forcefully override status of a piece of evidence
router.patch("/:id/status", jwtAuth, requireRole(["admin"]), updateStatusHandler);

export default router;
