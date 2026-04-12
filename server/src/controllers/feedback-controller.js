// server/src/controllers/feedback-controller.js

import feedbackService from '../services/feedback-service.js';
import apiResponse from '../utils/api-response.js';

const TOXIC_WORDS = ['bad', 'terrible', 'worst', 'hate', 'stupid', 'idiot', 'scam', 'fraud', 'fake',
    'fuck', 'bitch', 'asshole', 'motherfucker', 'bastard', 'son of a bitch', 'hell', 'damn', 'cunt',
    'shit', 'piss', 'cock', 'dick', 'vagina', 'penis', 'boob', 'nipple', 'butt', 'arse', 'arsehole',
    'wanker', 'twat', 'prick', 'jerk', 'dumb', 'moron', 'fool', 'clown', 'jester', 'buffoon'];

function checkToxic(content) {
    const lower = content.toLowerCase();
    return TOXIC_WORDS.filter(w => lower.includes(w));
}

export const postFeedback = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const clerkUserId = req.user.userId;

        const toxic = checkToxic(content);
        if (toxic.length > 0) {
            return res.status(400).json(apiResponse.error("Cannot submit feedback containing toxic words: " + toxic.join(", ")));
        }

        const newFeedback = await feedbackService.postFeedback(id, clerkUserId, content);
        return res.status(201).json(apiResponse.success("Feedback submitted", newFeedback));
    } catch (error) {
        next(error);
    }
};

export const getPromiseFeedback = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.userId : null;
        const feedbacks = await feedbackService.getFeedbackByPromise(req.params.id, userId);
        return res.json(apiResponse.success("Feedback retrieved", feedbacks));
    } catch (error) {
        next(error);
    }
};

export const approveFeedback = async (req, res, next) => {
    try {
        const updated = await feedbackService.updateFeedbackStatus(req.params.id, 'APPROVED');
        return res.json(apiResponse.success("Feedback approved", updated));
    } catch (error) {
        next(error);
    }
};

export const editFeedback = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const clerkUserId = req.user.userId;

        const toxic = checkToxic(content);
        if (toxic.length > 0) {
            return res.status(400).json(apiResponse.error("Cannot edit feedback to contain toxic words: " + toxic.join(", ")));
        }

        const updated = await feedbackService.updateFeedbackContent(id, clerkUserId, content);
        return res.json(apiResponse.success("Feedback updated successfully", updated));
    } catch (error) {
        if (error.message === "Unauthorized") return res.status(403).json(apiResponse.error("Unauthorized"));
        if (error.message === "Feedback not found") return res.status(404).json(apiResponse.error("Feedback not found"));
        next(error);
    }
};

export const deleteFeedback = async (req, res, next) => {
    try {
        const { id } = req.params;
        const clerkUserId = req.user.userId;
        const role = req.user.role;

        const deleted = await feedbackService.deleteFeedbackByUser(id, clerkUserId, role);
        if (!deleted) {
            return res.status(404).json(apiResponse.error("Feedback not found"));
        }

        return res.json(apiResponse.success("Feedback deleted successfully"));
    } catch (error) {
        if (error.message === "Unauthorized") return res.status(403).json(apiResponse.error("Unauthorized"));
        if (error.message === "Feedback not found") return res.status(404).json(apiResponse.error("Feedback not found"));
        next(error);
    }
};