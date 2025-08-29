import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

export class WorkerS3Service {
  /**
   * Get file from S3 as buffer for AI processing
   */
  static async getFileBuffer(s3Key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    const chunks: Buffer[] = [];

    if (response.Body && 'read' in response.Body) {
      const stream = response.Body as NodeJS.ReadableStream;
      
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
    }

    return Buffer.concat(chunks);
  }

  /**
   * Check if a path is an S3 key (vs local file path)
   */
  static isS3Path(path: string): boolean {
    return path.includes('/') && !path.startsWith('./') && !path.startsWith('/') && !path.includes('\\');
  }
}

export default WorkerS3Service;
