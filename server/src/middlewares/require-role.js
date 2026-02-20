/**
 * Temporary role middleware (DEV mode)
 * -----------------------------------
 * Since Clerk role verification isn't ready,
 * this placeholder simply allows the request.
 *
 * Later: Enforce roles from Clerk claims / DB.
 */
export default function requireRole(roles = []) {
  return (req, res, next) => next();
}
