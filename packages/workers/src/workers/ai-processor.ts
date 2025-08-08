import { Worker } from 'bullmq';
import { prisma } from '@repo/db';
import OpenAI from 'openai';
import vision from '@google-cloud/vision';
import pdfParse from 'pdf-parse';
import sharp from 'sharp';
import fs from 'fs/promises';
import { connection, AIJobData } from '../queue.js';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

class AIProcessor {
  private worker: Worker;

  constructor() {
    this.worker = new Worker('ai-processing', this.processFile.bind(this), {
      connection,
      concurrency: 3, // Process 3 files simultaneously
    });

    this.worker.on('completed', (job) => {
      console.log(`AI processing completed for job ${job.id}`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`AI processing failed for job ${job?.id}:`, err.message);
    });
  }

  async processFile(job: any) {
    const { fileId, filePath, mimeType, userId }: AIJobData = job.data;
    
    console.log(`Starting AI processing for file: ${fileId}`);

    try {
      // Update processing status
      await prisma.file.update({
        where: { id: fileId },
        data: { processingStatus: 'PROCESSING' }
      });

      let aiTags: string[] = [];
      let aiSummary: string | null = null;
      let aiKeywords: string[] = [];
      let ocrText: string | null = null;

      // Process based on file type
      if (mimeType.startsWith('image/')) {
        const result = await this.processImage(filePath);
        aiTags = result.tags;
        ocrText = result.text;
        aiKeywords = result.keywords;
      } else if (mimeType === 'application/pdf') {
        const result = await this.processPDF(filePath);
        aiSummary = result.summary;
        aiKeywords = result.keywords;
        ocrText = result.text;
      } else if (mimeType.startsWith('text/')) {
        const result = await this.processText(filePath);
        aiSummary = result.summary;
        aiKeywords = result.keywords;
      }

      // Update file with AI results
      await prisma.file.update({
        where: { id: fileId },
        data: {
          aiTags,
          aiSummary,
          aiKeywords,
          ocrText,
          processedAt: new Date(),
          processingStatus: 'COMPLETED'
        }
      });

      console.log(`AI processing completed for file: ${fileId}`);
      
    } catch (error) {
      console.error(` AI processing failed for file ${fileId}:`, error);
      
      await prisma.file.update({
        where: { id: fileId },
        data: { processingStatus: 'FAILED' }
      });
      
      throw error;
    }
  }

  async processImage(filePath: string) {
    try {
      // Use Google Cloud Vision for image analysis
      const [result] = await visionClient.labelDetection(filePath);
      const labels = result.labelAnnotations || [];
      
      // Extract text using OCR
      const [textResult] = await visionClient.textDetection(filePath);
      const ocrText = textResult.textAnnotations?.[0]?.description || '';

      // Generate tags from labels
      const tags = labels
        .filter(label => (label.score || 0) > 0.7)
        .map(label => label.description || '')
        .slice(0, 10);

      // Extract keywords from OCR text
      const keywords = this.extractKeywords(ocrText);

      return {
        tags,
        text: ocrText,
        keywords
      };
    } catch (error) {
      console.error('Image processing error:', error);
      return { tags: [], text: '', keywords: [] };
    }
  }

  async processPDF(filePath: string) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(fileBuffer);
      const text = pdfData.text;

      // Generate summary using OpenAI
      const summary = await this.generateSummary(text);
      const keywords = this.extractKeywords(text);

      return {
        summary,
        keywords,
        text: text.substring(0, 5000) // Store first 5000 chars
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      return { summary: null, keywords: [], text: '' };
    }
  }

  async processText(filePath: string) {
    try {
      const text = await fs.readFile(filePath, 'utf-8');
      
      const summary = await this.generateSummary(text);
      const keywords = this.extractKeywords(text);

      return {
        summary,
        keywords
      };
    } catch (error) {
      console.error('Text processing error:', error);
      return { summary: null, keywords: [] };
    }
  }

  async generateSummary(text: string): Promise<string | null> {
    try {
      if (!text || text.length < 100) return null;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise summaries of documents. Provide a 2-3 sentence summary that captures the main points.'
          },
          {
            role: 'user',
            content: `Please summarize this text: ${text.substring(0, 3000)}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('OpenAI summary error:', error);
      return null;
    }
  }

  extractKeywords(text: string): string[] {
    if (!text) return [];

    // Simple keyword extraction (can be enhanced with NLP libraries)
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.stopWords.includes(word));

    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top 10 keywords
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private stopWords = [
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
    'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all',
    'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'only', 'own', 'same', 'than', 'too', 'very', 'can', 'will', 'just'
  ];

  async close() {
    await this.worker.close();
  }
}

// Start the worker
const processor = new AIProcessor();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down AI processor...');
  await processor.close();
  process.exit(0);
});

export default processor;
