import express from "express";
import {
    getRatings,
    create,
    update,
    remove,
    getAverage,
} from "../controllers/rating-controller.js";

const router = express.Router();

// Base path: /api/ratings

// Get average rating for a promise
router.get("/promise/:promiseId/average", getAverage);

// Get all ratings for a promise
router.get("/promise/:promiseId", getRatings);

// Create a rating
router.post("/", create);

// Update a rating
router.put("/:id", update);

// Delete a rating
router.delete("/:id", remove);

export default router;
