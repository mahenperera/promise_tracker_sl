import Verification from '../models/Verification.js';
import Evidence from '../models/Evidence.js';
import User from '../models/User.js';

class VerificationService {
    // Submits a user verification (upvote, downvote, or flag)
    // Tracks it and recalculates the Evidence trustScore.

    static async submitVote(evidenceId, userUuid, voteType, comment) {
        // Check if evidence exists
        const evidence = await Evidence.findById(evidenceId);
        if (!evidence) {
            throw new Error("Specified Evidence does not exist");
        }

        const user = await User.findOne({ userId: userUuid });
        if (!user) {
            throw new Error("Voting user not found.");
        }
        const userId = user._id;

        // Insert vote
        // throw an error if multiple voting happens
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

        // Calculat trust score change
        let scoreChange = 0;
        if (voteType === 'upvote') scoreChange = 1;
        else if (voteType === 'downvote') scoreChange = -1;
        else if (voteType === 'flag') scoreChange = -2;

        evidence.trustScore += scoreChange;

        // Auto-update status based on community score
        if (evidence.trustScore <= -5) {
            evidence.status = 'disputed';
        } else if (evidence.status === 'pending' && evidence.trustScore >= 10) {
            evidence.status = 'verified';
        } else if (evidence.status === 'disputed' && evidence.trustScore >= 5) {
            evidence.status = 'verified';
        }

        await evidence.save();
        return evidence;
    }


    // Fetch verification history for an evidence
    static async getVotesForEvidence(evidenceId) {
        return await Verification.find({ evidenceId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
    }

    //  Deletes all verification history of a evidence.
    static async deleteVotesForEvidence(evidenceId) {
        return await Verification.deleteMany({ evidenceId });
    }
}

export default VerificationService;
