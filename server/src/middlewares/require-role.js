import { getAuth } from "@clerk/express";

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const { sessionClaims } = getAuth(req);

    const userRole = sessionClaims?.role || "citizen";

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required: ${allowedRoles.join(", ")}. Your role: ${userRole}`,
      });
    }

    req.userRole = userRole;
    next();
  };
};
