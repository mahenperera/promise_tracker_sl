import AuthService from "../services/auth-service.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function register(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const { user, token } = await AuthService.register(email, password, role);

    res.status(201).json({
      message: "User registered",
      token,
      user: { userId: user.userId, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const { user, token } = await AuthService.login(email, password);
    
    res
      .status(200)
      .json({
        token,
        user: { userId: user.userId, email: user.email, role: user.role },
      });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}
