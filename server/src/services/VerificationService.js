import Verification from '../models/Verification.js';
import Evidence from '../models/Evidence.js';
import User from '../models/User.js';

class VerificationService {
    /**
     * Submits a user verification interaction (upvote, downvote, or flag)
     * Tracks it and recalculates the Evidence trustScore.
     */
    static async submitVote(evidenceId, userUuid, voteType, comment) {
        // 1. Check if evidence exists
        const evidence = await Evidence.findById(evidenceId);
        if (!evidence) {
            throw new Error("Specified Evidence does not exist");
        }

        const user = await User.findOne({ userId: userUuid });
        if (!user) {
            throw new Error("Voting user not found.");
        }
        const userId = user._id;

        // 2. Insert vote
        // Will throw if duplicate voting happens due to composite index { evidenceId, userId }
        try {
            const newVote = new Verification({
                evidenceId,
                userId,
                voteType,
                comment
            });
            await newVote.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new Error("User has already voted on this evidence");
            }
            throw error;
        }

        // 3. Calc trust score diff
        let scoreChange = 0;
        if (voteType === 'upvote') scoreChange = 1;
        else if (voteType === 'downvote') scoreChange = -1;
        else if (voteType === 'flag') scoreChange = -2;

        evidence.trustScore += scoreChange;

        // 4. Auto-update status limits based on democratic community score
        if (evidence.trustScore <= -10 || voteType === 'flag') {
            // Logic: Flags drop credibility faster
            const flagCount = await Verification.countDocuments({ evidenceId, voteType: 'flag' });
            if (flagCount >= 5) {
                evidence.status = 'disputed';
            }
        } else if (evidence.status === 'pending' && evidence.trustScore >= 10) {
            // Reached community consensus
            evidence.status = 'verified';
        } else if (evidence.status === 'disputed' && evidence.trustScore >= 5) {
            // Hard recovery
            evidence.status = 'verified';
        }

        await evidence.save();
        return evidence;
    }

    /**
     * Fetch verification history for an evidence piece.
     */
    static async getVotesForEvidence(evidenceId) {
        return await Verification.find({ evidenceId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
    }
}

export default VerificationService;
