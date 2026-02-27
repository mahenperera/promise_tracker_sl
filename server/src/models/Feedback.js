import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  promiseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promise', required: true },
  clerkUserId: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

// Change this line to export default
const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;