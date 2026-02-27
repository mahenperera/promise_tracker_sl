import { v2 as cloudinary } from 'cloudinary';

class CloudinaryService {
    /**
     * Uploads a file stream/buffer to Cloudinary
     * @param {Buffer} fileBuffer - The file buffer to upload
     * @param {string} folder - Destination folder in Cloudinary
     * @returns {Promise<Object>} Object containing url, public_id, and resource_type
     */
    static async uploadMedia(fileBuffer, folder = 'promise_tracker_evidence') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder, resource_type: "auto" },
                (error, result) => {
                    if (error) return reject(error);
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                        type: result.resource_type // e.g., 'image', 'video', 'raw'
                    });
                }
            );
            uploadStream.end(fileBuffer);
        });
    }

    /**
     * Deletes a file from Cloudinary given its public_id
     * @param {string} publicId - Cloudinary public id
     * @param {string} resourceType - Type of resource (image, video, raw)
     * @returns {Promise<Object>} Response from Cloudinary
     */
    static async deleteMedia(publicId, resourceType = 'image') {
        return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
}

export default CloudinaryService;
