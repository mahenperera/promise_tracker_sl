import mongoose from "mongoose";

/**
 * Politician model:
 * - This is the "base" entity for the system.
 * - Promises (Component 2) will link to Politician via politicianId (ObjectId).
 */
const politicianSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    // Slug is used for clean URLs in frontend later: /politicians/<slug>
    // Example: "Anura Kumara" -> "anura-kumara"
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    party: {
      type: String,
      trim: true,
      default: "",
    },

    district: {
      type: String,
      trim: true,
      default: "",
    },

    position: {
      type: String,
      trim: true,
      default: "",
    },

    photoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    // Optional links (nice for profile pages)
    socialLinks: {
      websiteUrl: { type: String, trim: true, default: "" },
      facebookUrl: { type: String, trim: true, default: "" },
      twitterUrl: { type: String, trim: true, default: "" },
      youtubeUrl: { type: String, trim: true, default: "" },
    },

    // If a politician is no longer active, we can hide/filter without deleting
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Helpful indexes for faster searching
politicianSchema.index({ fullName: "text", party: "text", district: "text" });

export default mongoose.model("Politician", politicianSchema);
