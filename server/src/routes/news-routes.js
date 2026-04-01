import express from "express";
import { getPoliticalNewsHandler } from "../controllers/news-controller.js";

const router = express.Router();

// Public: Sri Lanka political news cards (RSS + og:image)
router.get("/political", getPoliticalNewsHandler);

export default router;
