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

// Semantic search across files
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const { q: query, type, tags, dateFrom, dateTo, limit = 20, offset = 0 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const where: any = {
      ownerId: req.userId,
      AND: []
    };

    // Text search across multiple fields
    where.OR = [
      { originalName: { contains: query, mode: 'insensitive' } },
      { aiSummary: { contains: query, mode: 'insensitive' } },
      { ocrText: { contains: query, mode: 'insensitive' } },
      { aiKeywords: { hasSome: [query] } }
    ];

    // Filter by file type
    if (type) {
      where.AND.push({ mimeType: { startsWith: type } });
    }

    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.AND.push({ aiTags: { hasSome: tagArray } });
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const dateFilter: any = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      where.AND.push({ createdAt: dateFilter });
    }

    const files = await prisma.file.findMany({
      where,
      include: {
        folder: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.file.count({ where });

    // Log search query for analytics
    await prisma.searchQuery.create({
      data: {
        query: query.trim(),
        userId: req.userId,
        resultsCount: files.length
      }
    });

    res.json({
      query,
      results: files.map((file: any) => ({
        id: file.id,
        name: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        aiTags: file.aiTags,
        aiSummary: file.aiSummary,
        aiKeywords: file.aiKeywords,
        folder: file.folder,
        // Calculate relevance score (simple implementation)
        relevance: calculateRelevance(query, file)
      })).sort((a: any, b: any) => b.relevance - a.relevance),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get search suggestions
router.get('/suggestions', authenticateToken, async (req: any, res) => {
  try {
    const { q: query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    // Get filename suggestions
    const filenameSuggestions = await prisma.file.findMany({
      where: {
        ownerId: req.userId,
        originalName: { contains: query, mode: 'insensitive' }
      },
      select: { originalName: true },
      take: 5,
      distinct: ['originalName']
    });

    // Get tag suggestions
    const files = await prisma.file.findMany({
      where: {
        ownerId: req.userId,
        aiTags: { hasSome: [] }
      },
      select: { aiTags: true }
    });

    const allTags = files.flatMap((file: any) => file.aiTags);
    const tagSuggestions = [...new Set(allTags)]
      .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);

    // Get keyword suggestions
    const keywordFiles = await prisma.file.findMany({
      where: {
        ownerId: req.userId,
        aiKeywords: { hasSome: [] }
      },
      select: { aiKeywords: true }
    });

    const allKeywords = keywordFiles.flatMap((file: any) => file.aiKeywords);
    const keywordSuggestions = [...new Set(allKeywords)]
      .filter(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);

    const suggestions = [
      ...filenameSuggestions.map((f: any) => ({ type: 'filename', value: f.originalName })),
      ...tagSuggestions.map(tag => ({ type: 'tag', value: tag })),
      ...keywordSuggestions.map(keyword => ({ type: 'keyword', value: keyword }))
    ];

    res.json({ suggestions: suggestions.slice(0, 10) });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get popular tags
router.get('/tags', authenticateToken, async (req: any, res) => {
  try {
    const files = await prisma.file.findMany({
      where: {
        ownerId: req.userId,
        aiTags: { not: { isEmpty: true } }
      },
      select: { aiTags: true }
    });

    const tagCounts: Record<string, number> = {};
    files.forEach((file: any) => {
      file.aiTags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    res.json({ tags: popularTags });

  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to get tags' });
  }
});

// Advanced search with filters
router.post('/advanced', authenticateToken, async (req: any, res) => {
  try {
    const { 
      query, 
      fileTypes, 
      tags, 
      keywords,
      dateRange,
      sizeRange,
      folders,
      processingStatus,
      sortBy = 'relevance',
      sortOrder = 'desc',
      limit = 20, 
      offset = 0 
    } = req.body;

    const where: any = {
      ownerId: req.userId,
      AND: []
    };

    // Text search
    if (query && query.trim().length > 0) {
      where.OR = [
        { originalName: { contains: query, mode: 'insensitive' } },
        { aiSummary: { contains: query, mode: 'insensitive' } },
        { ocrText: { contains: query, mode: 'insensitive' } },
        { aiKeywords: { hasSome: [query] } }
      ];
    }

    // File type filters
    if (fileTypes && fileTypes.length > 0) {
      where.AND.push({
        OR: fileTypes.map((type: string) => ({ mimeType: { startsWith: type } }))
      });
    }

    // Tag filters
    if (tags && tags.length > 0) {
      where.AND.push({ aiTags: { hasSome: tags } });
    }

    // Keyword filters
    if (keywords && keywords.length > 0) {
      where.AND.push({ aiKeywords: { hasSome: keywords } });
    }

    // Date range
    if (dateRange) {
      const dateFilter: any = {};
      if (dateRange.from) dateFilter.gte = new Date(dateRange.from);
      if (dateRange.to) dateFilter.lte = new Date(dateRange.to);
      where.AND.push({ createdAt: dateFilter });
    }

    // Size range
    if (sizeRange) {
      const sizeFilter: any = {};
      if (sizeRange.min) sizeFilter.gte = sizeRange.min;
      if (sizeRange.max) sizeFilter.lte = sizeRange.max;
      where.AND.push({ size: sizeFilter });
    }

    // Folder filters
    if (folders && folders.length > 0) {
      where.AND.push({ folderId: { in: folders } });
    }

    // Processing status
    if (processingStatus) {
      where.AND.push({ processingStatus });
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'name') orderBy = { originalName: sortOrder };
    else if (sortBy === 'size') orderBy = { size: sortOrder };
    else if (sortBy === 'date') orderBy = { createdAt: sortOrder };

    const files = await prisma.file.findMany({
      where,
      include: {
        folder: {
          select: { id: true, name: true }
        }
      },
      orderBy,
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.file.count({ where });

    let results = files.map((file: any) => ({
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
      relevance: query ? calculateRelevance(query, file) : 0
    }));

    // Sort by relevance if requested
    if (sortBy === 'relevance' && query) {
      results = results.sort((a, b) => b.relevance - a.relevance);
    }

    res.json({
      results,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      },
      filters: {
        query,
        fileTypes,
        tags,
        keywords,
        dateRange,
        sizeRange,
        folders,
        processingStatus
      }
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Advanced search failed' });
  }
});

// Simple relevance scoring function
function calculateRelevance(query: string, file: any): number {
  let score = 0;
  const queryLower = query.toLowerCase();

  // Exact name match gets highest score
  if (file.originalName.toLowerCase().includes(queryLower)) {
    score += 100;
  }

  // Summary match
  if (file.aiSummary && file.aiSummary.toLowerCase().includes(queryLower)) {
    score += 50;
  }

  // Tag match
  if (file.aiTags && file.aiTags.some((tag: string) => tag.toLowerCase().includes(queryLower))) {
    score += 30;
  }

  // Keyword match
  if (file.aiKeywords && file.aiKeywords.some((keyword: string) => keyword.toLowerCase().includes(queryLower))) {
    score += 20;
  }

  // OCR text match
  if (file.ocrText && file.ocrText.toLowerCase().includes(queryLower)) {
    score += 10;
  }

  return score;
}

export default router;
