import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { redis } from "../lib/db.js";
import { v4 as uuidv4 } from "uuid";
import { env } from "../lib/env.js";
const s3Client = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadtoS3 = async (
  path: string,
  name: string,
  contentType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf",
  fileBuffer: Buffer
) => {
  try {
    const uploadId = uuidv4();
    const filename = `${uploadId}-${name}`;
    const key = `${path}/${filename}`;
    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });
    await s3Client.send(command);
    const publicUrl = `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`;
    return {
      publicUrl,
      key,
      uploadId,
      filename,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    throw error;
  }
};

export const generatePresignedUrl = async (
  path: string,
  name: string,
  contentType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf",
  expiresIn: number = 60 * 5
) => {
  try {
    if (!path || !name) {
      throw new Error("Path and name are required");
    }
    const uploadId = uuidv4();
    const filename = `${uploadId}-${name}`;
    const key = `${path}/${filename}`;
    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
      signingDate: new Date(),
    });
    await redis.set(
      `presigned:${uploadId}`,
      JSON.stringify({
        key,
        contentType,
        filename: name,
        status: "pending",
        publicUrl: `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`,
        presignedUrl,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      })
    );
    await redis.expire(uploadId, expiresIn);
    return { presignedUrl, uploadId };
  } catch (error) {
    throw error;
  }
};
