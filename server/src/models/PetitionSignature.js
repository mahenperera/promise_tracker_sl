import mongoose from "mongoose";

const petitionSignatureSchema = new mongoose.Schema(
  {
    petitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Petition",
      required: true,
      index: true,
    },
    userId: { type: String, required: true, index: true }, // uuid string from JWT
    signedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// one citizen can sign one petition only once (hard rule)
petitionSignatureSchema.index({ petitionId: 1, userId: 1 }, { unique: true });

export default mongoose.model("PetitionSignature", petitionSignatureSchema);
