import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;
const BUCKET_PREFIX = process.env.S3_BUCKET_PREFIX || "files/";

export class S3Service {
  /**
   * Upload a file to S3
   */
  static async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    userId: string
  ): Promise<string> {
    const fileExtension = path.extname(originalName);
    const uniqueFileName = `${BUCKET_PREFIX}${userId}/${crypto.randomUUID()}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
      Metadata: {
        "original-name": originalName,
        "uploaded-by": userId,
        "upload-date": new Date().toISOString(),
      },
    });

    await s3Client.send(command);
    return uniqueFileName; // Return the S3 key
  }

  /**
   * Get a signed URL for file download (valid for 1 hour)
   */
  static async getSignedDownloadUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
  }

  /**
   * Get a signed URL for file upload (for direct frontend uploads)
   */
  static async getSignedUploadUrl(
    fileName: string,
    mimeType: string,
    userId: string
  ): Promise<{ url: string; key: string }> {
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${BUCKET_PREFIX}${userId}/${crypto.randomUUID()}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: mimeType,
      Metadata: {
        "original-name": fileName,
        "uploaded-by": userId,
      },
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    return {
      url: signedUrl,
      key: uniqueFileName,
    };
  }

  /**
   * Delete a file from S3
   */
  static async deleteFile(s3Key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);
  }

  /**
   * Get file from S3 as buffer
   */
  static async getFileBuffer(s3Key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    const chunks = [];

    if (response.Body && 'read' in response.Body) {
      const stream = response.Body as NodeJS.ReadableStream;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
    }

    return Buffer.concat(chunks);
  }

  /**
   * Get file metadata from S3
   */
  static async getFileMetadata(s3Key: string) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  }

  /**
   * Generate a public URL for S3 object (if bucket is configured for public access)
   */
  static getPublicUrl(s3Key: string): string {
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${s3Key}`;
  }
}

export default S3Service;
