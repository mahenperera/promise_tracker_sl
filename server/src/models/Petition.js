import mongoose from "mongoose";

const petitionSchema = new mongoose.Schema(
  {
    // who created it (from JWT payload)
    createdBy: { type: String, required: true, index: true }, // userId (uuid string)

    // petition content
    title: { type: String, required: true, trim: true },
    subjectLine: { type: String, trim: true, default: "" },
    addressedTo: { type: String, required: true, trim: true },

    // keep it practical: body includes background + request + impact etc.
    body: { type: String, required: true, trim: true },

    // optional extra bits
    evidenceSummary: { type: String, trim: true, default: "" },
    deadline: { type: Date, default: null },

    // attachments for now = list of strings (urls/filenames)
    attachments: [{ type: String, trim: true }],

    // petitioner info (keep public-safe)
    petitioner: {
      name: { type: String, required: true, trim: true },
      contact: { type: String, required: true, trim: true }, // phone or email
      address: { type: String, trim: true, default: "" },
      nic: { type: String, trim: true, default: "" }, // keep for admin/owner use only
    },

    declarationAccepted: { type: Boolean, required: true },

    status: {
      type: String,
      enum: ["submitted", "approved", "rejected", "archived"],
      default: "submitted",
      index: true,
    },

    isActive: { type: Boolean, default: true, index: true },

    // admin actions
    reviewedBy: { type: String, default: "" }, // admin userId
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, trim: true, default: "" },

    // optional nice-to-have
    signCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

petitionSchema.index({ title: "text", subjectLine: "text", body: "text" });

export default mongoose.model("Petition", petitionSchema);
