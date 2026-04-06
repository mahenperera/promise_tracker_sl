import { getPoliticalNews } from "../services/news-service.js";

export const getPoliticalNewsHandler = async (req, res, next) => {
  try {
    const { q = "", limit = 12 } = req.query;

    const result = await getPoliticalNews({ q, limit });

    return res.status(200).json({
      message: "Political news fetched",
      ...result,
    });
  } catch (err) {
    return next(err);
  }
};
