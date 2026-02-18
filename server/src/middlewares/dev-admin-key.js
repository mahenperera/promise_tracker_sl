/**
 * Development-only admin shortcut:
 * Allows admin routes if Postman sends `x-admin-key` that matches DEV_ADMIN_KEY.
 *
 * This is ONLY for local development speed.
 * In production, rely on Clerk + RBAC.
 */
export const devAdminKey = (req, res, next) => {
  const devKey = process.env.DEV_ADMIN_KEY;
  if (!devKey) return next(); // if not set, do nothing

  const incoming = req.headers["x-admin-key"];
  if (incoming && incoming === devKey) {
    // Mark request as "admin allowed"
    req.devAdmin = true;
  }

  return next();
};
