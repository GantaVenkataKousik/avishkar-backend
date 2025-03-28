import express from "express";
import upload from "../utils/multer.js";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

const router = express.Router();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const uploadStream = cloudinary.v2.uploader.upload_stream(
            { folder: "uploads" },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ success: false, message: error.message });
                }

                return res.status(200).json({
                    success: true,
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
