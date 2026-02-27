import {
    getRatingsByPromise,
    createRating,
    updateRating,
    deleteRating,
    getAverageRating,
} from "../services/rating-service.js";
import {
    validateCreateRating,
    validateUpdateRating,
} from "../validators/rating-validator.js";

// Get all ratings for a promise
export const getRatings = async (req, res) => {
    try {
        const { promiseId } = req.params;
        const ratings = await getRatingsByPromise(promiseId);
        return res.status(200).json(ratings);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid promise ID format" });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Create a new rating
export const create = async (req, res) => {
    try {
        const { ok, errors } = validateCreateRating(req.body);
        if (!ok) {
            return res.status(400).json({ errors });
        }

        const newRating = await createRating({
            promiseId: req.body.promiseId,
            clerkUserId: req.body.clerkUserId,
            rating: req.body.rating,
        });

        return res.status(201).json(newRating);
    } catch (error) {
        if (error.message === 'User has already rated this promise') {
            return res.status(409).json({ message: error.message });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid format for one or more IDs" });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update a rating
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { clerkUserId, rating } = req.body;

        if (!clerkUserId) {
            return res.status(400).json({ message: "clerkUserId is required to update a rating" });
        }

        const { ok, errors } = validateUpdateRating(req.body);
        if (!ok) {
            return res.status(400).json({ errors });
        }

        const updated = await updateRating(id, clerkUserId, { rating });
        return res.status(200).json(updated);
    } catch (error) {
        if (error.message === 'Rating not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Not authorized to update this rating') {
            return res.status(403).json({ message: error.message });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid rating ID format" });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a rating
export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const { clerkUserId } = req.body;

        if (!clerkUserId) {
            return res.status(400).json({ message: "clerkUserId is required to delete a rating" });
        }

        await deleteRating(id, clerkUserId);
        return res.status(200).json({ message: "Rating deleted successfully" });
    } catch (error) {
        if (error.message === 'Rating not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Not authorized to delete this rating') {
            return res.status(403).json({ message: error.message });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid rating ID format" });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get the average rating for a promise
export const getAverage = async (req, res) => {
    try {
        const { promiseId } = req.params;
        const data = await getAverageRating(promiseId);
        return res.status(200).json(data);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid promise ID format" });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
