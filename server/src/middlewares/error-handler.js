/**
 * errorHandler middleware
 * - Catches errors thrown in controllers/services
 * - Returns a clean JSON error response
 */
export default function errorHandler(err, req, res, next) {
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Server Error",
    // Stack trace is useful in development, hide it in production
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}
