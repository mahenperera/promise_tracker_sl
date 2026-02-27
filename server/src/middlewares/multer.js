import multer from "multer";

/**
 * Configure multer to use memory storage.
 * This is optimal for our CloudinaryService, as it allows us to buffer the file
 * entirely in memory and pipe it directly to the Cloudinary API stream without
 * writing temporary files to the server's local disk.
 */
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

export default upload;
