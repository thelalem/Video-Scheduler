import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a local file to S3 and return the stored object key.
 * @param {string} filePath - Local path to file
 * @param {string} key - Filename in S3
 * @param {string} contentType - MIME type of the uploaded file
 * @returns {Promise<string>} S3 object key
 */
export const uploadFile = async (filePath, key, contentType = "video/mp4") => {
  console.log("[S3] uploadFile called", {
    filePath,
    key,
    contentType,
    bucket: process.env.S3_BUCKET_NAME,
    region: process.env.AWS_REGION,
  });

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
  };

  try {
    console.log("[S3] Sending PutObjectCommand", {
      bucket: uploadParams.Bucket,
      key: uploadParams.Key,
      contentType: uploadParams.ContentType,
    });
    await s3.send(new PutObjectCommand(uploadParams));
    console.log("[S3] PutObjectCommand success", { key });
    return key;
  } catch (err) {
    console.error("[S3] Error uploading to S3", {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });
    throw err;
  }
};

/**
 * Create a temporary signed download URL for a stored object key.
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Signed URL expiration in seconds
 * @returns {Promise<string>} Signed GET URL
 */
export const getSignedDownloadUrl = async (key, expiresIn = 3600) => {
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      }),
      { expiresIn }
    );
  } catch (err) {
    console.error("Error generating signed download URL:", err);
    throw err;
  }
};