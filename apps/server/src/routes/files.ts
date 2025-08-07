import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '@repo/db';
import { addAIProcessingJob } from '@repo/workers';
import crypto from 'crypto';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '50000000'), // 50MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow most common file types
    const allowedTypes = [
      'image/', 'text/', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument',
      'application/json', 'application/zip'
    ];
    
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    cb(null, isAllowed);
  }
});

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Upload single file
router.post('/upload', authenticateToken, upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { folderId } = req.body;
    const fileStats = await fs.stat(req.file.path);
    
    // Calculate file checksum
    const fileBuffer = await fs.readFile(req.file.path);
    const checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');

    // Save file metadata to database
    const file = await prisma.file.create({
      data: {
        name: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: fileStats.size,
        pathOnDisk: req.file.path,
        checksum,
        ownerId: req.userId,
        folderId: folderId || null,
        processingStatus: 'PENDING'
      }
    });

    // Queue for AI processing
    try {
      await addAIProcessingJob({
        fileId: file.id,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        userId: req.userId
      });
    } catch (queueError) {
      console.error('Failed to queue AI processing:', queueError);
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
        processingStatus: file.processingStatus
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }
    }
    
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload multiple files
router.post('/upload-multiple', authenticateToken, upload.array('files', 10), async (req: any, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { folderId } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        const fileStats = await fs.stat(file.path);
        const fileBuffer = await fs.readFile(file.path);
        const checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');

        const savedFile = await prisma.file.create({
          data: {
            name: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: fileStats.size,
            pathOnDisk: file.path,
            checksum,
            ownerId: req.userId,
            folderId: folderId || null,
            processingStatus: 'PENDING'
          }
        });

        // Queue for AI processing
        await addAIProcessingJob({
          fileId: savedFile.id,
          filePath: file.path,
          mimeType: file.mimetype,
          userId: req.userId
        });

        uploadedFiles.push({
          id: savedFile.id,
          name: savedFile.originalName,
          size: savedFile.size,
          mimeType: savedFile.mimeType,
          createdAt: savedFile.createdAt
        });
      } catch (fileError) {
        console.error(`Failed to process file ${file.originalname}:`, fileError);
        // Clean up this file but continue with others
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup failed file:', cleanupError);
        }
      }
    }

    res.json({
      success: true,
      files: uploadedFiles,
      processed: uploadedFiles.length,
      total: req.files.length
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get user's files
router.get('/', authenticateToken, async (req: any, res) => {
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
        { originalName: { contains: search, mode: 'insensitive' } },
        { aiSummary: { contains: search, mode: 'insensitive' } },
        { ocrText: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tag) {
      where.aiTags = { has: tag };
    }

    const files = await prisma.file.findMany({
      where,
      include: {
        folder: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.file.count({ where });

    res.json({
      files: files.map(file => ({
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
        folder: file.folder
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Get file details
router.get('/:fileId', authenticateToken, async (req: any, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.fileId,
        ownerId: req.userId
      },
      include: {
        folder: {
          select: { id: true, name: true }
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
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
      versions: file.versions
    });

  } catch (error) {
    console.error('Get file details error:', error);
    res.status(500).json({ error: 'Failed to fetch file details' });
  }
});

// Download file
router.get('/:fileId/download', authenticateToken, async (req: any, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.fileId,
        ownerId: req.userId
      }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if file exists on disk
    try {
      await fs.access(file.pathOnDisk);
    } catch {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.sendFile(path.resolve(file.pathOnDisk));

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Delete file
router.delete('/:fileId', authenticateToken, async (req: any, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.fileId,
        ownerId: req.userId
      }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from database
    await prisma.file.delete({
      where: { id: req.params.fileId }
    });

    // Delete from disk
    try {
      await fs.unlink(file.pathOnDisk);
    } catch (diskError) {
      console.error('Failed to delete file from disk:', diskError);
      // Don't fail the request if disk cleanup fails
    }

    res.json({ success: true, message: 'File deleted successfully' });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Update file metadata
router.patch('/:fileId', authenticateToken, async (req: any, res) => {
  try {
    const { name, folderId } = req.body;
    
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.fileId,
        ownerId: req.userId
      }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const updatedFile = await prisma.file.update({
      where: { id: req.params.fileId },
      data: {
        ...(name && { originalName: name }),
        ...(folderId !== undefined && { folderId: folderId || null })
      }
    });

    res.json({
      id: updatedFile.id,
      name: updatedFile.originalName,
      size: updatedFile.size,
      mimeType: updatedFile.mimeType,
      folderId: updatedFile.folderId,
      updatedAt: updatedFile.updatedAt
    });

  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
});

export default router;
