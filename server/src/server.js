import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";

import politicianRoutes from "./routes/politician-routes.js";
import promiseRoutes from "./routes/promise-routes.js";

// import promiseRoutes from "./routes/promise-routes.js";
// import evidenceRoutes from "./routes/evidence-routes.js";
// import commentRoutes from "./routes/comment-routes.js";

// Error middlewares (recommended to keep even now)
import notFound from "./middlewares/not-found.js";
import errorHandler from "./middlewares/error-handler.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Simple health check
app.get("/", (req, res) => {
  res.send("API running...");
});

/**
 * ===============================
 * API ROUTES
 * ===============================
 */

// ✅ Component 1 (Politicians & Profiles)
app.use("/api/politicians", politicianRoutes);
app.use("/api/promises", promiseRoutes);

/**
 * ===============================
 * TODO (Other Components)
 * Uncomment when those modules are ready
 * ===============================
 */

// app.use("/api/promises", promiseRoutes);
// app.use("/api/evidence", evidenceRoutes);
// app.use("/api/comments", commentRoutes);

// Error handling (keep these at the bottom)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
