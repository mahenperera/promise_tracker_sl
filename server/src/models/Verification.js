import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
    {
        evidenceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Evidence",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        voteType: {
            type: String,
            enum: ["upvote", "downvote", "flag"],
            required: true
        },
        comment: {
            type: String, // Optional reason for the vote/flag
            trim: true
        }
    },
    { timestamps: true }
);

// Prevent a user from voting on the same piece of evidence twice
verificationSchema.index({ evidenceId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Verification", verificationSchema);
