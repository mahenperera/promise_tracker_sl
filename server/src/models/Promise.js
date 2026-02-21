import mongoose from "mongoose";

/**
 * Promise model:
 * - Represents a single promise made by a politician
 * - Linked to Politician via politicianId (ObjectId)
 * - Evidence & comments will attach to this later
 */
const promiseSchema = new mongoose.Schema(
  {
    politicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Politician",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Clean URL slug like: "reduce-fuel-prices"
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Category helps filtering (economy, education, health, corruption, etc.)
    category: {
      type: String,
      trim: true,
      default: "",
    },

    // Simple progress tracking (can be expanded later)
    status: {
      type: String,
      enum: ["pending", "in_progress", "fulfilled", "broken"],
      default: "pending",
    },

    // Optional: when the promise was originally made
    promiseDate: {
      type: Date,
      default: null,
    },

    // Visibility control (like politician isActive)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Helpful for search
promiseSchema.index({ title: "text", description: "text", category: "text" });

// Avoid duplicate slugs per politician
promiseSchema.index({ politicianId: 1, slug: 1 }, { unique: true });

export default mongoose.model("Promise", promiseSchema);
