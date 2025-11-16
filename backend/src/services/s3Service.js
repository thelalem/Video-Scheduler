import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a local file to S3
 * @param {string} filePath - local path to file
 * @param {string} key - filename in S3
 */
export const uploadFile = async (filePath, key) => {
  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: fileStream,
    ContentType: "video/mp4", // adjust if needed
  };

  try {
    const result = await s3.send(new PutObjectCommand(uploadParams));
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw err;
  }
};
