import { getAuth } from "@clerk/express";

export const authenticate = (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Please sign in",
    });
  }

  req.userId = userId;
  console.log(userId);
  next();
};
