import { Router } from "express";
import multer from "multer";
import { prisma } from "@repo/db";
import crypto from "crypto";
import { authenticateToken } from "../middleware/auth.js";
import S3Service from "../services/s3.js";

// Mock AI processing for now
const addAIProcessingJob = async (data: any) => {
  console.log("AI processing job queued:", data);
};

const QueueMonitor = {
  getStats: async () => ({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
  }),
};

const router = Router();

// Configure multer for file uploads (using memory storage for S3)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "50000000"), // 50MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow most common file types
    const allowedTypes = [
      "image/",
      "text/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument",
      "application/json",
      "application/zip",
    ];

    const isAllowed = allowedTypes.some((type) =>
      file.mimetype.startsWith(type),
    );
    cb(null, isAllowed);
  },
});

// Upload single file
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { folderId } = req.body;
      const fileBuffer = req.file.buffer;

      // Calculate file checksum
      const checksum = crypto
        .createHash("md5")
        .update(fileBuffer)
        .digest("hex");

      // Upload to S3
      const s3Key = await S3Service.uploadFile(
        fileBuffer,
        req.file.originalname,
        req.file.mimetype,
        req.userId
      );

      // Save file metadata to database
      const file = await prisma.file.create({
        data: {
          name: req.file.originalname,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          pathOnDisk: s3Key, // Store S3 key instead of local path
          checksum,
          ownerId: req.userId,
          folderId: folderId || null,
          processingStatus: "PENDING",
        },
      });

      // Queue for AI processing
      try {
        await addAIProcessingJob({
          fileId: file.id,
          filePath: s3Key, // Pass S3 key to worker
          mimeType: req.file.mimetype,
          userId: req.userId,
        });
      } catch (queueError) {
        console.error("Failed to queue AI processing:", queueError);
        // Don't fail the upload if queuing fails
      }

      res.json({
        success: true,
        file: {
          id: file.id,
          name: file.originalName,
          size: file.size,
          mimeType: file.mimeType,
          createdAt: file.createdAt,
          processingStatus: file.processingStatus,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  },
);

// Upload multiple files
router.post(
  "/upload-multiple",
  authenticateToken,
  upload.array("files", 10),
  async (req: any, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const { folderId } = req.body;
      const uploadedFiles = [];

      for (const file of req.files) {
        try {
          const fileBuffer = file.buffer;
          const checksum = crypto
            .createHash("md5")
            .update(fileBuffer)
            .digest("hex");

          // Upload to S3
          const s3Key = await S3Service.uploadFile(
            fileBuffer,
            file.originalname,
            file.mimetype,
            req.userId
          );

          const savedFile = await prisma.file.create({
            data: {
              name: file.originalname,
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              pathOnDisk: s3Key, // Store S3 key
              checksum,
              ownerId: req.userId,
              folderId: folderId || null,
              processingStatus: "PENDING",
            },
          });

          // Queue for AI processing
          await addAIProcessingJob({
            fileId: savedFile.id,
            filePath: s3Key, // Pass S3 key
            mimeType: file.mimetype,
            userId: req.userId,
          });

          uploadedFiles.push({
            id: savedFile.id,
            name: savedFile.originalName,
            size: savedFile.size,
            mimeType: savedFile.mimeType,
            createdAt: savedFile.createdAt,
          });
        } catch (fileError) {
          console.error(
            `Failed to process file ${file.originalname}:`,
            fileError,
          );
          // Continue with other files even if one fails
        }
      }

      res.json({
        success: true,
        files: uploadedFiles,
        processed: uploadedFiles.length,
        total: req.files.length,
      });
    } catch (error) {
      console.error("Multiple upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  },
);

// Get signed URL for direct upload to S3
router.post("/upload-url", authenticateToken, async (req: any, res) => {
  try {
    const { fileName, mimeType } = req.body;
    
    if (!fileName || !mimeType) {
      return res.status(400).json({ error: "fileName and mimeType are required" });
    }

    const { url, key } = await S3Service.getSignedUploadUrl(
      fileName,
      mimeType,
      req.userId
    );

    res.json({
      success: true,
      uploadUrl: url,
      key: key,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Generate upload URL error:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

// Confirm upload completion (to save metadata after direct S3 upload)
router.post("/confirm-upload", authenticateToken, async (req: any, res) => {
  try {
    const { key, fileName, mimeType, size, folderId } = req.body;
    
    if (!key || !fileName || !mimeType || !size) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get file metadata from S3 to verify upload
    const metadata = await S3Service.getFileMetadata(key);
    
    if (!metadata) {
      return res.status(400).json({ error: "File not found in S3" });
    }

    // Calculate checksum by downloading the file
    const fileBuffer = await S3Service.getFileBuffer(key);
    const checksum = crypto
      .createHash("md5")
      .update(fileBuffer)
      .digest("hex");

    // Save file metadata to database
    const file = await prisma.file.create({
      data: {
        name: fileName,
        originalName: fileName,
        mimeType: mimeType,
        size: size,
        pathOnDisk: key, // Store S3 key
        checksum,
        ownerId: req.userId,
        folderId: folderId || null,
        processingStatus: "PENDING",
      },
    });

    // Queue for AI processing
    try {
      await addAIProcessingJob({
        fileId: file.id,
        filePath: key, // Pass S3 key
        mimeType: mimeType,
        userId: req.userId,
      });
    } catch (queueError) {
      console.error("Failed to queue AI processing:", queueError);
    }

    res.json({
      success: true,
      file: {
        id: file.id,
        name: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        createdAt: file.createdAt,
        processingStatus: file.processingStatus,
      },
    });
  } catch (error) {
    console.error("Confirm upload error:", error);
    res.status(500).json({ error: "Failed to confirm upload" });
  }
});

// Get user's files
router.get("/", authenticateToken, async (req: any, res) => {
  try {
    const { folderId, search, tag, limit = 50, offset = 0 } = req.query;

    const where: any = {
      ownerId: req.userId,
    };

    if (folderId) {
      where.folderId = folderId;
    }

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: "insensitive" } },
        { aiSummary: { contains: search, mode: "insensitive" } },
        { ocrText: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      where.aiTags = { has: tag };
    }

    const files = await prisma.file.findMany({
      where,
      include: {
        folder: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.file.count({ where });

    res.json({
      files: files.map((file) => ({
        id: file.id,
        name: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        aiTags: file.aiTags,
        aiSummary: file.aiSummary,
        aiKeywords: file.aiKeywords,
        processingStatus: file.processingStatus,
        folder: file.folder,
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// Get file details
router.get("/:fileId", authenticateToken, async (req: any, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.fileId,
        ownerId: req.userId,
      },
      include: {
        folder: {
          select: { id: true, name: true },
        },
        versions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({
      id: file.id,
      name: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      aiTags: file.aiTags,
      aiSummary: file.aiSummary,
      aiKeywords: file.aiKeywords,
      ocrText: file.ocrText,
      processingStatus: file.processingStatus,
      processedAt: file.processedAt,
      folder: file.folder,
      versions: file.versions,
    });
  } catch (error) {
    console.error("Get file details error:", error);
    res.status(500).json({ error: "Failed to fetch file details" });
  }
});

// Download file
router.get("/:fileId/download", authenticateToken, async (req: any, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.fileId,
        ownerId: req.userId,
      },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Get signed URL from S3 for secure download
    const downloadUrl = await S3Service.getSignedDownloadUrl(file.pathOnDisk);
    
    // Redirect to the signed URL for direct download
    res.redirect(downloadUrl);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Download failed" });
  }
});

// Delete file
router.delete("/:fileId", authenticateToken, async (req: any, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.fileId,
        ownerId: req.userId,
      },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete from database
    await prisma.file.delete({
      where: { id: req.params.fileId },
    });

    // Delete from S3
    try {
      await S3Service.deleteFile(file.pathOnDisk);
    } catch (s3Error) {
      console.error("Failed to delete file from S3:", s3Error);
      // Don't fail the request if S3 cleanup fails
    }

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

// Update file metadata
router.patch("/:fileId", authenticateToken, async (req: any, res) => {
  try {
    const { name, folderId } = req.body;

    const file = await prisma.file.findFirst({
      where: {
        id: req.params.fileId,
        ownerId: req.userId,
      },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const updatedFile = await prisma.file.update({
      where: { id: req.params.fileId },
      data: {
        ...(name && { originalName: name }),
        ...(folderId !== undefined && { folderId: folderId || null }),
      },
    });

    res.json({
      id: updatedFile.id,
      name: updatedFile.originalName,
      size: updatedFile.size,
      mimeType: updatedFile.mimeType,
      folderId: updatedFile.folderId,
      updatedAt: updatedFile.updatedAt,
    });
  } catch (error) {
    console.error("Update file error:", error);
    res.status(500).json({ error: "Update failed" });
  }
});

// Get queue status
router.get("/queue-status", async (req, res) => {
  try {
    const stats = await QueueMonitor.getStats();
    res.json({
      success: true,
      queues: stats,
    });
  } catch (error) {
    console.error("Queue status error:", error);
    res.status(500).json({
      error: "Failed to get queue status",
      queues: {
        aiQueue: { name: "AI Processing", error: "Connection failed" },
        cleanupQueue: { name: "File Cleanup", error: "Connection failed" },
      },
    });
  }
});

export default router;
