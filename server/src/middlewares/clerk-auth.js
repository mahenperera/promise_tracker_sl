/**
 * Temporary Clerk auth middleware (DEV mode)
 * -----------------------------------------
 * We haven't connected Clerk token verification yet.
 * So for now, this middleware just allows the request to continue.
 *
 * Later: Replace this with real Clerk JWT verification.
 */
export default function clerkAuth(req, res, next) {
  return next();
}
