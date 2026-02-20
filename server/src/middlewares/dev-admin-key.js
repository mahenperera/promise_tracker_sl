/**
 * DEV ADMIN KEY middleware (for easy Postman testing)
 *
 * If request contains correct x-admin-key header:
 *   - set req.devAdmin = true
 *   - allow route to pass without Clerk
 */

export default function devAdminKey(req, res, next) {
  const key = req.headers["x-admin-key"];
  const expected = process.env.DEV_ADMIN_KEY;

  if (key && expected && key === expected) {
    req.devAdmin = true;
  } else {
    req.devAdmin = false;
  }

  next();
}
