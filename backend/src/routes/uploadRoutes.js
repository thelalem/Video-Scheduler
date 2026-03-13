import express from "express";
import upload from "../middleware/upload.js";
import { uploadFile } from "../services/s3Service.js";
import fs from "fs";

const router = express.Router();

router.post("/", upload.single("video"), async (req, res) => {
  try {
    console.log("[UPLOAD] Request received", {
      hasFile: !!req.file,
      contentType: req.headers["content-type"],
    });

    if (!req.file) {
      console.log("[UPLOAD] No file found in request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path; // multer path
    const key = req.file.filename; // filename in S3

    console.log("[UPLOAD] File parsed by multer", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filePath,
      key,
    });

    console.log("[UPLOAD] Starting S3 upload", { key });
    const storedKey = await uploadFile(filePath, key, req.file.mimetype);
    console.log("[UPLOAD] S3 upload success", { storedKey });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("[UPLOAD] Local temp file removed", { filePath });
    }

    res.status(200).json({
      message: "Video uploaded successfully",
      s3Url: storedKey,
    });
  } catch (error) {
    console.error("[UPLOAD] Upload failed", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

export default router;
