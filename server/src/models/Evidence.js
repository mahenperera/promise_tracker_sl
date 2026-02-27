import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
    {
        promiseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Promise",
            required: true,
            index: true, // Get all evidence for this promise
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
        // The Chronology structure
        dateOccurred: {
            type: Date,
            required: true,
        },
        // Unified Media structure with LSP
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
        // Trust score taken from the Verification model
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
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

// Timeline Sorting 
evidenceSchema.index({ promiseId: 1, dateOccurred: 1 });

export default mongoose.model("Evidence", evidenceSchema);
