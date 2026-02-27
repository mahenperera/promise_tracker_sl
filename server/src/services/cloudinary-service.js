import { v2 as cloudinary } from 'cloudinary';

class CloudinaryService {

    static async uploadMedia(fileBuffer, folder = 'promise_tracker_evidence') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder, resource_type: "auto" },
                (error, result) => {
                    if (error) return reject(error);
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                        type: result.resource_type
                    });
                }
            );
            uploadStream.end(fileBuffer);
        });
    }

    // Deletes a file from Cloudinary
    static async deleteMedia(publicId, resourceType = 'image') {
        return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
}

export default CloudinaryService;
