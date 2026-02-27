import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const SALT_ROUNDS = 10;

class AuthService {
  static async register(email, password, role) {
    const existing = await User.findOne({ email });
    if (existing) throw new Error("Email already registered");

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const userId = uuidv4();
    const user = await User.create({ userId, email, password: hashed, role });

    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    return { user, token };
  }

  static async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    return { user, token };
  }
}

export default AuthService;
