import Evidence from '../models/Evidence.js';
import PromiseModel from '../models/Promise.js';
import User from '../models/User.js';
import VerificationService from './verification-service.js';
import CloudinaryService from './cloudinary-service.js';

class EvidenceService {
    // Retrieves all evidence for a given promise, 
    // sorted chronologically.

    static async getChronologicalEvidence(promiseId) {
        // only fetch evidence if the user interacts with it. 
        const query = { promiseId, status: { $ne: 'pending' } }; // pending items are only visible to admins/owners

        return await Evidence.find(query)
            .sort({ dateOccurred: 1 })
            .populate('addedBy', 'name')
            .exec();
    }

    // Retrieves only evidence containing visual media for the gallery UI.
    static async getMediaGallery(promiseId) {
        const query = {
            promiseId,
            status: { $ne: 'pending' },
            "media.type": { $in: ["image", "video"] }
        };

        return await Evidence.find(query)
            .sort({ dateOccurred: -1 }) // Newest first for gallery
            .populate('addedBy', 'name')
            .exec();
    }

    // Adds new evidence attached to a promise.
    // used SRC and LSP for media structure
    static async addEvidence(evidenceData, file, userUuid, userRole = 'citizen') {
        const promiseId = evidenceData.promiseId;
        const title = evidenceData.title;
        const description = evidenceData.description;
        const dateOccurred = evidenceData.dateOccurred;

        let mediaType = evidenceData.mediaType || (evidenceData.media && evidenceData.media.type) || 'Other';
        const mediaSourceType = evidenceData.mediaSourceType || (evidenceData.media && evidenceData.media.sourceType) || 'Other';
        let mediaUrl = evidenceData.externalUrl || (evidenceData.media && evidenceData.media.url) || "";

        if (file) {
            const uploadResult = await CloudinaryService.uploadMedia(file.buffer);
            mediaUrl = uploadResult.url;

            if (uploadResult.type === 'video') mediaType = 'video';
            else if (uploadResult.type === 'image') mediaType = 'image';
            else if (uploadResult.type === 'raw') mediaType = 'pdf'; // Cloudinary uses raw for PDFs
        }

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
            if (highTrustSources.includes(mediaSourceType)) {
                initialTrustScore += 5;
            }
        }

        // Unified LSP Media layout 
        const unifiedMedia = {
            url: mediaUrl,
            type: mediaType, // 'image', 'video', 'pdf', 'link', 'Other'
            sourceType: mediaSourceType
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

    // Fetch all evidence submitted by a specific user (useful for dashboard).
    static async getUserEvidence(userUuid) {
        const user = await User.findOne({ userId: userUuid });
        if (!user) {
            throw new Error("User not found.");
        }

        return await Evidence.find({ addedBy: user._id })
            .sort({ dateOccurred: -1 }) // Newest first
            .populate('promiseId', 'title slug status')
            .exec();
    }

    // admin method to forcefully update status.
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

    // Delete an evidence record and its associated votes.
    static async deleteEvidence(evidenceId, userUuid, userRole = 'citizen') {
        const evidence = await Evidence.findById(evidenceId);
        if (!evidence) {
            throw new Error("Specified Evidence does not exist.");
        }

        // Authorization check(User must be an admin, or the original submitter)
        if (userRole !== 'admin') {
            const user = await User.findOne({ userId: userUuid });
            if (!user || user._id.toString() !== evidence.addedBy.toString()) {
                throw new Error("Unauthorized: You can only delete your own evidence.");
            }
        }

        // Try to delete media from Cloudinary if it is hosted there
        if (evidence.media && evidence.media.url && evidence.media.url.includes('cloudinary')) {
            try {
                // Best-effort extraction of Cloudinary Public ID from generic URLs
                // Example URL: https://res.cloudinary.com/demo/image/upload/v1234/folder/file.jpg
                const urlParts = evidence.media.url.split('/');
                const filenameWithExt = urlParts[urlParts.length - 1];
                const folderName = urlParts[urlParts.length - 2];
                const filename = filenameWithExt.split('.')[0];
                const publicId = `${folderName}/${filename}`;

                let resourceType = 'image';
                if (evidence.media.type === 'video') resourceType = 'video';
                else if (evidence.media.type === 'pdf') resourceType = 'raw';

                await CloudinaryService.deleteMedia(publicId, resourceType);
            } catch (err) {
                console.error("Cloudinary media deletion failed during evidence delete:", err);
                // We won't throw an error because the Database cleanup is highest priority
            }
        }

        // Cascade delete all verification votes 
        await VerificationService.deleteVotesForEvidence(evidenceId);

        // Delete the actual Evidence record
        return await Evidence.findByIdAndDelete(evidenceId);
    }
}

export default EvidenceService;
