import EvidenceService from '../services/EvidenceService.js';
import VerificationService from '../services/VerificationService.js';

/**
 * Controller manages the HTTP request and response cycle only. 
 * Heavy business logic is delegated to the services.
 */

export const addEvidenceHandler = async (req, res, next) => {
    try {
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
        const { id: evidenceId } = req.params;
        const { voteType, comment } = req.body;
        const userUuid = req.user.userId;

        // Validate vote types
        if (!["upvote", "downvote", "flag"].includes(voteType)) {
            return res.status(400).json({ message: "Invalid voteType provided." });
        }

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
