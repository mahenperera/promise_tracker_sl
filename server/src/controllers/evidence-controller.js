import EvidenceService from '../services/evidence-service.js';
import VerificationService from '../services/verification-service.js';
import {
    validateCreateEvidence,
    validateSubmitVote,
    validateUpdateStatus
} from '../validators/evidence-validator.js';

// add new evidence and save
export const addEvidenceHandler = async (req, res, next) => {
    try {
        const validation = validateCreateEvidence(req.body);
        if (!validation.ok) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.errors
            });
        }

        const userUuid = req.user.userId;
        const userRole = req.user.role || 'citizen';

        const evidence = await EvidenceService.addEvidence(req.body, userUuid, userRole);
        return res.status(201).json({ message: "Evidence successfully submitted", data: evidence });
    } catch (err) {
        if (err.message === "Specified Promise does not exist.") {
            return res.status(404).json({ message: err.message });
        }
        return next(err);
    }
};

// all the evidence for a specific promise, ordered by date.
export const getEvidenceHandler = async (req, res, next) => {
    try {
        const { promiseId } = req.params;
        const evidenceList = await EvidenceService.getChronologicalEvidence(promiseId);
        return res.status(200).json({ message: "Evidence retrieved successfully", data: evidenceList });
    } catch (err) {
        return next(err);
    }
};

//user vote on evidence and prevent multiple voting
export const submitVoteHandler = async (req, res, next) => {
    try {
        const validation = validateSubmitVote(req.body);
        if (!validation.ok) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.errors
            });
        }

        const { id: evidenceId } = req.params;
        const { voteType, comment } = req.body;
        const userUuid = req.user.userId;

        const updatedEvidence = await VerificationService.submitVote(evidenceId, userUuid, voteType, comment);
        return res.status(200).json({ message: "Vote successfully recorded", data: updatedEvidence });
    } catch (err) {
        if (err.message === "User has already voted on this evidence") {
            return res.status(409).json({ message: err.message });
        }
        if (err.message === "Specified Evidence does not exist") {
            return res.status(404).json({ message: err.message });
        }
        return next(err);
    }
};

//update the status of a evidence
export const updateStatusHandler = async (req, res, next) => {
    try {
        const validation = validateUpdateStatus(req.body);
        if (!validation.ok) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.errors
            });
        }

        const { id: evidenceId } = req.params;
        const { status } = req.body;

        const updatedEvidence = await EvidenceService.updateStatus(evidenceId, status);

        if (!updatedEvidence) {
            return res.status(404).json({ message: "Specified Evidence does not exist" });
        }

        return res.status(200).json({ message: "Status forcefully updated", data: updatedEvidence });
    } catch (err) {
        if (err.message === "Invalid status type") {
            return res.status(400).json({ message: err.message });
        }
        return next(err);
    }
};

// Gets all the votes or verification history for a specific piece of evidence.
export const getVotesHandler = async (req, res, next) => {
    try {
        const { id: evidenceId } = req.params;
        const votes = await VerificationService.getVotesForEvidence(evidenceId);
        return res.status(200).json({ message: "Verification history retrieved successfully", data: votes });
    } catch (err) {
        return next(err);
    }
};

// Grabs all the media files of a promise to show in a gallery.
export const getGalleryHandler = async (req, res, next) => {
    try {
        const { promiseId } = req.params;
        const gallery = await EvidenceService.getMediaGallery(promiseId);
        return res.status(200).json({ message: "Media gallery retrieved successfully", data: gallery });
    } catch (err) {
        return next(err);
    }
};

// Gets all the evidence submitted by the currently logged-in user.
export const getUserEvidenceHandler = async (req, res, next) => {
    try {
        const userUuid = req.user.userId;
        const evidenceList = await EvidenceService.getUserEvidence(userUuid);
        return res.status(200).json({ message: "User evidence retrieved successfully", data: evidenceList });
    } catch (err) {
        if (err.message === "User not found.") {
            return res.status(404).json({ message: err.message });
        }
        return next(err);
    }
};

// Deletes a evidence. makes sure user allowed to delete
export const deleteEvidenceHandler = async (req, res, next) => {
    try {
        const { id: evidenceId } = req.params;
        const userUuid = req.user.userId;
        const userRole = req.user.role || 'citizen';

        await EvidenceService.deleteEvidence(evidenceId, userUuid, userRole);
        return res.status(200).json({ message: "Evidence deleted successfully." });
    } catch (err) {
        if (err.message === "Specified Evidence does not exist.") {
            return res.status(404).json({ message: err.message });
        }
        if (err.message === "Unauthorized: You can only delete your own evidence.") {
            return res.status(403).json({ message: err.message });
        }
        return next(err);
    }
};
