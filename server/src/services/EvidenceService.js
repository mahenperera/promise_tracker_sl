import Evidence from '../models/Evidence.js';
import PromiseModel from '../models/Promise.js';
import User from '../models/User.js';

class EvidenceService {
    /**
     * Retrieves all evidence for a given promise, sorted chronologically.
     * By default, it retrieves evidence that is not completely hidden/rejected.
     * @param {string} promiseId
     * @returns {Promise<Array>}
     */
    static async getChronologicalEvidence(promiseId) {
        // We only fetch evidence if the user interacts with it. 
        // We can also let the controller pass in filter conditions.
        const query = { promiseId, status: { $ne: 'pending' } }; // Maybe 'pending' items are only visible to admins/owners

        return await Evidence.find(query)
            .sort({ dateOccurred: 1 })
            .populate('addedBy', 'name')
            .exec();
    }

    /**
     * Adds new evidence attached to a promise.
     * Ensures the SRC and LSP principles by mapping the unified media structure.
     */
    static async addEvidence(evidenceData, userUuid, userRole = 'citizen') {
        const { promiseId, title, description, dateOccurred, media } = evidenceData;

        const user = await User.findOne({ userId: userUuid });
        if (!user) {
            throw new Error("Submitting user not found.");
        }
        const userId = user._id;

        // Validate promise
        const promise = await PromiseModel.findById(promiseId);
        if (!promise) {
            throw new Error("Specified Promise does not exist.");
        }

        let initialTrustScore = 0;
        let initialStatus = 'pending';

        // If an Admin adds it, it's auto-verified
        if (userRole === 'admin') {
            initialStatus = 'verified';
            initialTrustScore = 100;
        } else {
            // Small automated trust logic based on Source Type
            const highTrustSources = ['Gazette', 'Official Document'];
            if (media && highTrustSources.includes(media.sourceType)) {
                initialTrustScore += 5;
            }
        }

        // Unified LSP Media layout enforcement
        const unifiedMedia = {
            url: media.url,
            type: media.type, // 'image', 'video', 'pdf', 'link'
            sourceType: media.sourceType || 'Other'
        };

        const newEvidence = new Evidence({
            promiseId,
            title,
            description,
            dateOccurred,
            media: unifiedMedia,
            trustScore: initialTrustScore,
            status: initialStatus,
            addedBy: userId
        });

        return await newEvidence.save();
    }

    /**
     * Fallback or admin method to forcefully update status.
     */
    static async updateStatus(evidenceId, newStatus) {
        const validStatuses = ["pending", "verified", "disputed"];
        if (!validStatuses.includes(newStatus)) {
            throw new Error("Invalid status type");
        }

        return await Evidence.findByIdAndUpdate(
            evidenceId,
            { status: newStatus },
            { new: true }
        );
    }
}

export default EvidenceService;
