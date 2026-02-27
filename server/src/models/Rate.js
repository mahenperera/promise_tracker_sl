import mongoose from 'mongoose';

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
    rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    }
}, { timestamps: true });

// Ensure a user can rate a specific promise only once
rateSchema.index({ promiseId: 1, clerkUserId: 1 }, { unique: true });

const Rate = mongoose.model('Rate', rateSchema);
export default Rate;
