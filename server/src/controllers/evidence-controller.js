import EvidenceService from '../services/evidence-service.js';
import VerificationService from '../services/verification-service.js';
import {
    validateCreateEvidence,
    validateSubmitVote,
    validateUpdateStatus
} from '../validators/evidence-validator.js';

/**
 * Controller manages the HTTP request and response cycle only. 
 * Heavy business logic is delegated to the services.
 */

export const addEvidenceHandler = async (req, res, next) => {
    try {
        const validation = validateCreateEvidence(req.body);
        if (!validation.ok) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.errors
            });
        }

        // Assuming req.user is set by jwtAuth middleware
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

export const getEvidenceHandler = async (req, res, next) => {
    try {
        const { promiseId } = req.params;
        const evidenceList = await EvidenceService.getChronologicalEvidence(promiseId);
        return res.status(200).json({ message: "Evidence retrieved successfully", data: evidenceList });
    } catch (err) {
        return next(err);
    }
};

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

export const getVotesHandler = async (req, res, next) => {
    try {
        const { id: evidenceId } = req.params;
        const votes = await VerificationService.getVotesForEvidence(evidenceId);
        return res.status(200).json({ message: "Verification history retrieved successfully", data: votes });
    } catch (err) {
        return next(err);
    }
};

export const getGalleryHandler = async (req, res, next) => {
    try {
        const { promiseId } = req.params;
        const gallery = await EvidenceService.getMediaGallery(promiseId);
        return res.status(200).json({ message: "Media gallery retrieved successfully", data: gallery });
    } catch (err) {
        return next(err);
    }
};

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
