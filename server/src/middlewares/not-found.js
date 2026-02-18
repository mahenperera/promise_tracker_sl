/**
 * notFound middleware
 * - Runs when no route matches
 * - Returns a clean 404 JSON response
 */
export default function notFound(req, res, next) {
  res.status(404).json({
    message: `Not Found - ${req.originalUrl}`,
  });
}
