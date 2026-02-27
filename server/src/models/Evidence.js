import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
    {
        promiseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Promise",
            required: true,
            index: true, // Optimized for "Get all evidence for this promise"
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        // The "Chronology" anchor
        dateOccurred: {
            type: Date,
            required: true,
        },
        // LSP Implementation: Unified Media structure
        media: {
            url: { type: String, required: true },
            type: {
                type: String,
                enum: ["image", "video", "pdf", "link"],
                required: true
            },
            sourceType: {
                type: String,
                enum: ["News", "Gazette", "Social Media", "Official Document", "Other"],
                default: "Other"
            }
        },
        // Trust score derived from the Verification model
        trustScore: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["pending", "verified", "disputed"],
            default: "pending"
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Assuming you have a user system
            required: true
        }
    },
    { timestamps: true }
);

// Index for Timeline Sorting (Oldest to Newest)
evidenceSchema.index({ promiseId: 1, dateOccurred: 1 });

export default mongoose.model("Evidence", evidenceSchema);
