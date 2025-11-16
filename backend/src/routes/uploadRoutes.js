import express from "express";
import upload from "../middleware/upload.js";
import { uploadFile } from "../services/s3Service.js";
import path from "path";
import fs from "fs";

const router = express.Router();

router.post("/", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const s3Key = `${Date.now()}-${req.file.originalname}`;
    const s3Url = await uploadFile(req.file.path, s3Key);

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "Video uploaded to S3 successfully",
      s3Url,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

export default router;
