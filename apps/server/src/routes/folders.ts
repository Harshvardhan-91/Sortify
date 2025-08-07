import { Router } from 'express';
import { prisma } from '@repo/db';

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

// Create folder
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { name, description, color, parentId } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // Check if folder with same name exists in the same parent
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: name.trim(),
        ownerId: req.userId,
        parentId: parentId || null
      }
    });

    if (existingFolder) {
      return res.status(409).json({ error: 'Folder with this name already exists' });
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || null,
        ownerId: req.userId,
        parentId: parentId || null
      }
    });

    res.json({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      parentId: folder.parentId,
      createdAt: folder.createdAt
    });

  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Get user's folders
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const { parentId } = req.query;

    const folders = await prisma.folder.findMany({
      where: {
        ownerId: req.userId,
        parentId: parentId || null
      },
      include: {
        _count: {
          select: {
            files: true,
            children: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      folders: folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        description: folder.description,
        color: folder.color,
        parentId: folder.parentId,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
        fileCount: folder._count.files,
        subfolderCount: folder._count.children
      }))
    });

  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Get folder tree
router.get('/tree', authenticateToken, async (req: any, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: {
        ownerId: req.userId
      },
      include: {
        _count: {
          select: {
            files: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Build tree structure
    const folderMap = new Map();
    const rootFolders: any[] = [];

    // Create folder objects
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        id: folder.id,
        name: folder.name,
        description: folder.description,
        color: folder.color,
        parentId: folder.parentId,
        createdAt: folder.createdAt,
        fileCount: folder._count.files,
        children: []
      });
    });

    // Build tree
    folders.forEach(folder => {
      const folderObj = folderMap.get(folder.id);
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children.push(folderObj);
        }
      } else {
        rootFolders.push(folderObj);
      }
    });

    res.json({ tree: rootFolders });

  } catch (error) {
    console.error('Get folder tree error:', error);
    res.status(500).json({ error: 'Failed to fetch folder tree' });
  }
});

// Get folder details
router.get('/:folderId', authenticateToken, async (req: any, res) => {
  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id: req.params.folderId,
        ownerId: req.userId
      },
      include: {
        parent: {
          select: { id: true, name: true }
        },
        children: {
          select: { id: true, name: true, color: true },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            files: true,
            children: true
          }
        }
      }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      parentId: folder.parentId,
      parent: folder.parent,
      children: folder.children,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      fileCount: folder._count.files,
      subfolderCount: folder._count.children
    });

  } catch (error) {
    console.error('Get folder details error:', error);
    res.status(500).json({ error: 'Failed to fetch folder details' });
  }
});

// Update folder
router.patch('/:folderId', authenticateToken, async (req: any, res) => {
  try {
    const { name, description, color, parentId } = req.body;

    const folder = await prisma.folder.findFirst({
      where: {
        id: req.params.folderId,
        ownerId: req.userId
      }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Prevent moving folder into itself or its children
    if (parentId && parentId === req.params.folderId) {
      return res.status(400).json({ error: 'Cannot move folder into itself' });
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: req.params.folderId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(color !== undefined && { color }),
        ...(parentId !== undefined && { parentId: parentId || null })
      }
    });

    res.json({
      id: updatedFolder.id,
      name: updatedFolder.name,
      description: updatedFolder.description,
      color: updatedFolder.color,
      parentId: updatedFolder.parentId,
      updatedAt: updatedFolder.updatedAt
    });

  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Delete folder
router.delete('/:folderId', authenticateToken, async (req: any, res) => {
  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id: req.params.folderId,
        ownerId: req.userId
      },
      include: {
        _count: {
          select: {
            files: true,
            children: true
          }
        }
      }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if folder is empty
    if (folder._count.files > 0 || folder._count.children > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete folder with files or subfolders. Move or delete contents first.' 
      });
    }

    await prisma.folder.delete({
      where: { id: req.params.folderId }
    });

    res.json({ success: true, message: 'Folder deleted successfully' });

  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
