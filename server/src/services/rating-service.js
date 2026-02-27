import Rate from "../models/Rate.js";
import mongoose from "mongoose";

// Get all ratings for a promise
export const getRatingsByPromise = async (promiseId) => {
    return await Rate.find({ promiseId }).sort({ createdAt: -1 });
};

// Create a new rating
export const createRating = async (ratingData) => {
    const { promiseId, clerkUserId, rating } = ratingData;

    // Check if user already rated this promise
    const existingRating = await Rate.findOne({ promiseId, clerkUserId });
    if (existingRating) {
        throw new Error('User has already rated this promise');
    }

    const newRating = new Rate({
        promiseId,
        clerkUserId,
        rating
    });

    return await newRating.save();
};

// Update an existing rating
export const updateRating = async (id, clerkUserId, updateData) => {
    const existingRate = await Rate.findById(id);

    if (!existingRate) {
        throw new Error('Rating not found');
    }

    // Ensure only the user who created it can update it
    if (existingRate.clerkUserId !== clerkUserId) {
        throw new Error('Not authorized to update this rating');
    }

    if (updateData.rating !== undefined) {
        existingRate.rating = updateData.rating;
    }

    return await existingRate.save();
};

// Delete a rating
export const deleteRating = async (id, clerkUserId) => {
    const existingRate = await Rate.findById(id);

    if (!existingRate) {
        throw new Error('Rating not found');
    }

    // Ensure only the user who created it can delete it
    if (existingRate.clerkUserId !== clerkUserId) {
        throw new Error('Not authorized to delete this rating');
    }

    return await Rate.findByIdAndDelete(id);
};

// Get the average rating for a promise
export const getAverageRating = async (promiseId) => {
    const result = await Rate.aggregate([
        { $match: { promiseId: new mongoose.Types.ObjectId(promiseId) } },
        { $group: { _id: "$promiseId", average: { $avg: "$rating" }, totalRatings: { $sum: 1 } } }
    ]);

    if (result.length > 0) {
        return {
            average: Number(result[0].average.toFixed(1)), // rounding to 1 decimal place
            totalRatings: result[0].totalRatings
        };
    }

    return { average: 0, totalRatings: 0 };
};
