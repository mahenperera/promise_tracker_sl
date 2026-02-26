const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
  promiseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promise',
    required: true
  },
  clerkUserId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['UPVOTE', 'DOWNVOTE'],
    required: true
  }
}, { timestamps: true });

// Ensures a user can only have one vote per promise
rateSchema.index({ promiseId: 1, clerkUserId: 1 }, { unique: true });

module.exports = mongoose.model('Rate', rateSchema);