import { Router } from 'express';
import { prisma } from '@repo/db';
import crypto from 'crypto';

const router = Router();

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

// Create a shareable link
router.post('/:fileId', authenticateToken, async (req: any, res) => {
  try {
    const { expiresIn, maxDownloads, password } = req.body;

    // Verify file ownership
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.fileId,
        ownerId: req.userId
      }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn) {
      const now = new Date();
      if (expiresIn === '1hour') {
        expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
      } else if (expiresIn === '1day') {
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      } else if (expiresIn === '1week') {
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (expiresIn === '1month') {
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
    }

    const sharedFile = await prisma.sharedFile.create({
      data: {
        token,
        expiresAt,
        maxDownloads: maxDownloads || null,
        password: password || null,
        fileId: req.params.fileId,
        sharedById: req.userId
      }
    });

    const shareUrl = `${process.env.APP_URL || 'http://localhost:3001'}/share/${token}`;

    res.json({
      id: sharedFile.id,
      shareUrl,
      token,
      expiresAt,
      maxDownloads,
      hasPassword: !!password,
      createdAt: sharedFile.createdAt
    });

  } catch (error) {
    console.error('Create share link error:', error);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

// Get file by share token
router.get('/:token', async (req, res) => {
  try {
    const { password } = req.query;

    const sharedFile = await prisma.sharedFile.findUnique({
      where: { token: req.params.token },
      include: {
        file: {
          select: {
            id: true,
            originalName: true,
            size: true,
            mimeType: true,
            createdAt: true,
            pathOnDisk: true
          }
        },
        sharedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!sharedFile) {
      return res.status(404).json({ error: 'Share link not found or expired' });
    }

    // Check if link has expired
    if (sharedFile.expiresAt && new Date() > sharedFile.expiresAt) {
      return res.status(410).json({ error: 'Share link has expired' });
    }

    // Check download limit
    if (sharedFile.maxDownloads && sharedFile.downloadCount >= sharedFile.maxDownloads) {
      return res.status(410).json({ error: 'Download limit reached' });
    }

    // Check password if required
    if (sharedFile.password && sharedFile.password !== password) {
      return res.status(401).json({ error: 'Password required', requiresPassword: true });
    }

    res.json({
      file: {
        id: sharedFile.file.id,
        name: sharedFile.file.originalName,
        size: sharedFile.file.size,
        mimeType: sharedFile.file.mimeType,
        createdAt: sharedFile.file.createdAt
      },
      sharedBy: sharedFile.sharedBy,
      expiresAt: sharedFile.expiresAt,
      downloadsRemaining: sharedFile.maxDownloads 
        ? sharedFile.maxDownloads - sharedFile.downloadCount 
        : null
    });

  } catch (error) {
    console.error('Get shared file error:', error);
    res.status(500).json({ error: 'Failed to access shared file' });
  }
});

// Download shared file
router.get('/:token/download', async (req, res) => {
  try {
    const { password } = req.query;

    const sharedFile = await prisma.sharedFile.findUnique({
      where: { token: req.params.token },
      include: {
        file: true
      }
    });

    if (!sharedFile) {
      return res.status(404).json({ error: 'Share link not found or expired' });
    }

    // Check if link has expired
    if (sharedFile.expiresAt && new Date() > sharedFile.expiresAt) {
      return res.status(410).json({ error: 'Share link has expired' });
    }

    // Check download limit
    if (sharedFile.maxDownloads && sharedFile.downloadCount >= sharedFile.maxDownloads) {
      return res.status(410).json({ error: 'Download limit reached' });
    }

    // Check password if required
    if (sharedFile.password && sharedFile.password !== password) {
      return res.status(401).json({ error: 'Password required' });
    }

    // Increment download count
    await prisma.sharedFile.update({
      where: { id: sharedFile.id },
      data: { downloadCount: { increment: 1 } }
    });

    // Check if file exists on disk
    const fs = await import('fs/promises');
    try {
      await fs.access(sharedFile.file.pathOnDisk);
    } catch {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${sharedFile.file.originalName}"`);
    res.setHeader('Content-Type', sharedFile.file.mimeType);
    
    const path = await import('path');
    res.sendFile(path.resolve(sharedFile.file.pathOnDisk));

  } catch (error) {
    console.error('Download shared file error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Get user's shared files
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const sharedFiles = await prisma.sharedFile.findMany({
      where: { sharedById: req.userId },
      include: {
        file: {
          select: {
            id: true,
            originalName: true,
            size: true,
            mimeType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      shares: sharedFiles.map(share => ({
        id: share.id,
        token: share.token,
        shareUrl: `${process.env.APP_URL || 'http://localhost:3001'}/share/${share.token}`,
        file: share.file,
        expiresAt: share.expiresAt,
        maxDownloads: share.maxDownloads,
        downloadCount: share.downloadCount,
        hasPassword: !!share.password,
        createdAt: share.createdAt,
        isExpired: share.expiresAt ? new Date() > share.expiresAt : false,
        isLimitReached: share.maxDownloads ? share.downloadCount >= share.maxDownloads : false
      }))
    });

  } catch (error) {
    console.error('Get shared files error:', error);
    res.status(500).json({ error: 'Failed to fetch shared files' });
  }
});

// Update share settings
router.patch('/:shareId', authenticateToken, async (req: any, res) => {
  try {
    const { expiresIn, maxDownloads, password } = req.body;

    const sharedFile = await prisma.sharedFile.findFirst({
      where: {
        id: req.params.shareId,
        sharedById: req.userId
      }
    });

    if (!sharedFile) {
      return res.status(404).json({ error: 'Shared file not found' });
    }

    // Calculate new expiration date
    let expiresAt = sharedFile.expiresAt;
    if (expiresIn !== undefined) {
      if (expiresIn === null) {
        expiresAt = null;
      } else {
        const now = new Date();
        if (expiresIn === '1hour') {
          expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
        } else if (expiresIn === '1day') {
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        } else if (expiresIn === '1week') {
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else if (expiresIn === '1month') {
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
      }
    }

    const updatedShare = await prisma.sharedFile.update({
      where: { id: req.params.shareId },
      data: {
        ...(expiresIn !== undefined && { expiresAt }),
        ...(maxDownloads !== undefined && { maxDownloads }),
        ...(password !== undefined && { password })
      }
    });

    res.json({
      id: updatedShare.id,
      expiresAt: updatedShare.expiresAt,
      maxDownloads: updatedShare.maxDownloads,
      hasPassword: !!updatedShare.password
    });

  } catch (error) {
    console.error('Update share error:', error);
    res.status(500).json({ error: 'Failed to update share settings' });
  }
});

// Delete share link
router.delete('/:shareId', authenticateToken, async (req: any, res) => {
  try {
    const sharedFile = await prisma.sharedFile.findFirst({
      where: {
        id: req.params.shareId,
        sharedById: req.userId
      }
    });

    if (!sharedFile) {
      return res.status(404).json({ error: 'Shared file not found' });
    }

    await prisma.sharedFile.delete({
      where: { id: req.params.shareId }
    });

    res.json({ success: true, message: 'Share link deleted successfully' });

  } catch (error) {
    console.error('Delete share error:', error);
    res.status(500).json({ error: 'Failed to delete share link' });
  }
});

export default router;
