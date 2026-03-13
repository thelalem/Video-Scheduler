import express from "express";
import upload from "../middleware/upload.js";
import { uploadFile } from "../services/s3Service.js";
import fs from "fs";

const router = express.Router();

router.post("/", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path; // multer path
    const key = req.file.filename; // filename in S3

    const storedKey = await uploadFile(filePath, key, req.file.mimetype);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      message: "Video uploaded successfully",
      s3Url: storedKey,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

export default router;
