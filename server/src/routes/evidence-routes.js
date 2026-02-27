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

// PUBLIC Routes

// Fetch all active chronological evidence for a promise
router.get("/promise/:promiseId", getEvidenceHandler);

// Fetch all verification interactions for an evidence
router.get("/:id/votes", getVotesHandler);

// Fetch all visual media for a specific promise
router.get("/gallery/:promiseId", getGalleryHandler);

// PROTECTED Citizen Routes

// Get all evidence added by the logged-in user
router.get("/user", jwtAuth, getUserEvidenceHandler);

// Add new evidence
router.post("/", jwtAuth, upload.single('media'), addEvidenceHandler);

// Submit a vote or flag on a evidence
router.post("/:id/verify", jwtAuth, submitVoteHandler);

// Delete a evidence
router.delete("/:id", jwtAuth, deleteEvidenceHandler);


// ADMIN Routes

// Admin update the status of a evidence
router.patch("/:id/status", jwtAuth, requireRole(["admin"]), updateStatusHandler);

export default router;
