//* NOTE: this auth for petition , Had to use separate auth for this
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export default function tryJwtAuth(req, res, next) {
  const authHeader = req.headers["authorization"];

  // no token → act as public (do NOT block)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch (err) {
    // invalid token → still treat as public (do NOT block)
    req.user = null;
  }

  return next();
}
