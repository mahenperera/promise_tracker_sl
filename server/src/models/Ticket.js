import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["admin", "citizen"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const ticketSchema = new mongoose.Schema(
  {
    createdBy: {
      type: String,
      required: true,
      index: true,
    },

    assignedTo: {
      type: String,
      default: null,
      index: true,
    },

    politicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Politician",
      default: null,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    replies: [replySchema],

    lastRepliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Ticket", ticketSchema);
