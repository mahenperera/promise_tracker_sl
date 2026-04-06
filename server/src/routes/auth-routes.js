import express from "express";
import { register, login, getAdmins } from "../controllers/auth-controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/admins", getAdmins);

export default router;
