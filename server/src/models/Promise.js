import mongoose from "mongoose";

const promiseSchema = new mongoose.Schema(
  {
    politicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Politician",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

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

    category: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "fulfilled", "broken"],
      default: "pending",
    },

    promiseDate: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

promiseSchema.index({ title: "text", description: "text", category: "text" });

// Avoid duplicate slugs per politician
promiseSchema.index({ politicianId: 1, slug: 1 }, { unique: true });

export default mongoose.model("Promise", promiseSchema);
