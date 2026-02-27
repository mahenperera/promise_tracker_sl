import mongoose from "mongoose";

const petitionSchema = new mongoose.Schema(
  {
    createdBy: { type: String, required: true, index: true }, // uuid userId from JWT

    // Email comes from the DB, not from the client (don't trust req.body for this).
    petitionerEmail: { type: String, required: true, trim: true, index: true },

    title: { type: String, required: true, trim: true },
    subjectLine: { type: String, trim: true, default: "" },
    addressedTo: { type: String, required: true, trim: true },

    body: { type: String, required: true, trim: true },

    evidenceSummary: { type: String, trim: true, default: "" },
    deadline: { type: Date, default: null },

    attachments: [{ type: String, trim: true }],

    declarationAccepted: { type: Boolean, required: true },

    status: {
      type: String,
      enum: ["submitted", "approved", "rejected", "archived"],
      default: "submitted",
      index: true,
    },

    isActive: { type: Boolean, default: true, index: true },

    reviewedBy: { type: String, default: "" }, // admin uuid
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, trim: true, default: "" },

    // Keeping signer UUIDs here so we can easily see them in MongoDB
    signedBy: { type: [String], default: [] },
    signCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

petitionSchema.index({ title: "text", subjectLine: "text", body: "text" });

export default mongoose.model("Petition", petitionSchema);
