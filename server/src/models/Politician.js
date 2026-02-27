import mongoose from "mongoose";

// Politician is the base entity; promises link via politicianId (ObjectId).
const politicianSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    // Slug makes clean URLs (e.g., "Anura Kumara" -> "anura-kumara").
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

    // Optional profile links
    socialLinks: {
      websiteUrl: { type: String, trim: true, default: "" },
      facebookUrl: { type: String, trim: true, default: "" },
      twitterUrl: { type: String, trim: true, default: "" },
      youtubeUrl: { type: String, trim: true, default: "" },
    },

    // Mark inactive to hide/filter without deleting
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Indexes to speed up searches
politicianSchema.index({ fullName: "text", party: "text", district: "text" });

export default mongoose.model("Politician", politicianSchema);
