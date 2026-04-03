import mongoose from "mongoose";

const politicianSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    party: { type: String, trim: true, default: "" },

    // ✅ NEW: party logo URL (Option A)
    partyLogoUrl: { type: String, trim: true, default: "" },

    district: { type: String, trim: true, default: "" },

    position: { type: String, trim: true, default: "" },

    photoUrl: { type: String, trim: true, default: "" },

    bio: { type: String, trim: true, default: "" },

    socialLinks: {
      websiteUrl: { type: String, trim: true, default: "" },
      facebookUrl: { type: String, trim: true, default: "" },
      twitterUrl: { type: String, trim: true, default: "" },
      youtubeUrl: { type: String, trim: true, default: "" },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

politicianSchema.index({ fullName: "text", party: "text", district: "text" });

export default mongoose.model("Politician", politicianSchema);
