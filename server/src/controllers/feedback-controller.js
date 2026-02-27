// server/src/controllers/feedback-controller.js

import feedbackService from '../services/feedback-service.js';
import apiResponse from '../utils/api-response.js';

export const postFeedback = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        //const clerkUserId = req.auth.userId; 
        const clerkUserId = "user_test_12345"; // Placeholder until auth is implemented

        const newFeedback = await feedbackService.postFeedback(id, clerkUserId, content);
        return res.status(201).json(apiResponse.success("Feedback submitted", newFeedback));
    } catch (error) {
        next(error);
    }
};

export const getPromiseFeedback = async (req, res, next) => {
    try {
        const feedbacks = await feedbackService.getApprovedFeedbackByPromise(req.params.id);
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

export const deleteFeedback = async (req, res, next) => {
    try {
        const { id } = req.params; // This is the Feedback ID
        const deleted = await feedbackService.deleteFeedback(id);
        
        if (!deleted) {
            return res.status(404).json(apiResponse.error("Feedback not found"));
        }
        
        return res.json(apiResponse.success("Feedback deleted successfully"));
    } catch (error) {
        next(error);
    }
};