import { Worker } from "bullmq";
import { prisma } from "@repo/db";
import OpenAI from "openai";
import vision from "@google-cloud/vision";
import pdfParse from "pdf-parse";
import sharp from "sharp";
import fs from "fs/promises";
import { connection, AIJobData } from "../queue.js";
import {
  visionConfig,
  documentClassificationPatterns,
} from "../config/vision-config.js";
import WorkerS3Service from "../services/s3.js";

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const visionClient = process.env.GOOGLE_CLOUD_KEY_FILE
  ? new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    })
  : null;

class AIProcessor {
  private worker: Worker;

  constructor() {
    this.worker = new Worker("ai-processing", this.processFile.bind(this), {
      connection,
      concurrency: 3,
    });

    this.worker.on("completed", (job) => {
      console.log(`AI processing completed for job ${job.id}`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`AI processing failed for job ${job?.id}:`, err.message);
    });
  }

  async processFile(job: any) {
    const { fileId, filePath, mimeType, userId }: AIJobData = job.data;

    console.log(`Starting AI processing for file: ${fileId}`);
    console.log(`File path: ${filePath}`);
    console.log(`MIME type: ${mimeType}`);

    try {
      // Update processing status
      await prisma.file.update({
        where: { id: fileId },
        data: { processingStatus: "PROCESSING" },
      });

      let aiTags: string[] = [];
      let aiSummary: string | null = null;
      let aiKeywords: string[] = [];
      let ocrText: string | null = null;

      // Process based on file type
      if (mimeType.startsWith("image/")) {
        const result = await this.processImage(filePath);
        aiTags = result.tags;
        ocrText = result.text;
        aiKeywords = result.keywords;
      } else if (mimeType === "application/pdf") {
        const result = await this.processPDF(filePath);
        aiSummary = result.summary;
        aiKeywords = result.keywords;
        ocrText = result.text;
        aiTags = result.aiTags || ["pdf", "document"];
      } else if (mimeType.startsWith("text/")) {
        const result = await this.processText(filePath);
        aiSummary = result.summary;
        aiKeywords = result.keywords;
        aiTags = result.aiTags || ["text", "document"];
      } else {
        // Handle other file types with basic tagging
        aiTags = await this.generateBasicTags(mimeType);
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
          processingStatus: "COMPLETED",
        },
      });

      console.log(`AI processing completed for file: ${fileId}`);
    } catch (error) {
      console.error(`AI processing failed for file ${fileId}:`, error);

      await prisma.file.update({
        where: { id: fileId },
        data: { processingStatus: "FAILED" },
      });

      throw error;
    }
  }

  /**
   * Helper to get file buffer whether from S3 or local disk
   */
  private async getFileBuffer(filePath: string): Promise<Buffer> {
    if (WorkerS3Service.isS3Path(filePath)) {
      return await WorkerS3Service.getFileBuffer(filePath);
    } else {
      return await fs.readFile(filePath);
    }
  }

  async processImage(filePath: string) {
    try {
      console.log(`🖼️ Processing image with Google Cloud Vision: ${filePath}`);

      // Check if Vision client is available
      if (!visionClient) {
        console.warn(
          "⚠️ Google Cloud Vision client not configured. Using basic image processing.",
        );
        return {
          tags: ["image", "unprocessed"],
          text: "",
          keywords: [],
        };
      }

      // Get file buffer
      const imageBuffer = await this.getFileBuffer(filePath);

      // Perform multiple types of analysis using buffer
      const [labelResult] = await visionClient.labelDetection({
        image: { content: imageBuffer },
      });
      const [textResult] = await visionClient.textDetection({
        image: { content: imageBuffer },
      });

      // Object localization and logo detection (optional features)
      let objectAnnotations: any[] = [];
      let logoAnnotations: any[] = [];

      try {
        if (visionClient.objectLocalization) {
          const [objectResult] = await visionClient.objectLocalization({
            image: { content: imageBuffer },
          });
          objectAnnotations = objectResult.localizedObjectAnnotations || [];
        }
      } catch (error) {
        console.warn("Object localization not available:", error);
      }

      try {
        if (visionClient.logoDetection) {
          const [logoResult] = await visionClient.logoDetection({
            image: { content: imageBuffer },
          });
          logoAnnotations = logoResult.logoAnnotations || [];
        }
      } catch (error) {
        console.warn("Logo detection not available:", error);
      }

      // Extract labels (general image content)
      const labels = labelResult.labelAnnotations || [];
      const labelTags = labels
        .filter((label) => (label.score || 0) > visionConfig.confidence.labels)
        .map((label) => label.description || "")
        .slice(0, visionConfig.maxResults.labels);

      // Extract objects (specific items in the image)
      const objectTags = objectAnnotations
        .filter((obj) => (obj.score || 0) > visionConfig.confidence.objects)
        .map((obj) => obj.name || "")
        .slice(0, visionConfig.maxResults.objects);

      // Extract logos/brands
      const logoTags = logoAnnotations
        .filter((logo) => (logo.score || 0) > visionConfig.confidence.logos)
        .map((logo) => logo.description || "")
        .slice(0, visionConfig.maxResults.logos);

      // Combine all tags and remove duplicates
      const allTags = [...new Set([...labelTags, ...objectTags, ...logoTags])];

      // Extract OCR text
      const ocrText = textResult.textAnnotations?.[0]?.description || "";

      // Generate AI tags for text content if OCR text is substantial
      let aiTextTags: string[] = [];
      if (ocrText.length > 100) {
        aiTextTags = await this.generateAITags(ocrText, "image-with-text");
      }

      // Enhance tags with document-specific classifications
      const enhancedTags = this.enhanceImageTags(allTags, ocrText);

      // Combine all tags: Vision API + AI text analysis + enhancements
      const combinedTags = [
        "image",
        ...enhancedTags,
        ...aiTextTags
      ];
      const uniqueTags = [...new Set(combinedTags)];

      // Extract keywords from OCR text using AI if available, fallback to basic
      const keywords = ocrText.length > 50 
        ? await this.generateAIKeywords(ocrText)
        : this.extractKeywords(ocrText);

      console.log(
        `✅ Image processing completed. Found ${uniqueTags.length} tags, ${keywords.length} keywords`,
      );

      return {
        tags: uniqueTags,
        text: ocrText,
        keywords,
      };
    } catch (error) {
      console.error("Image processing error:", error);
      return {
        tags: ["image", "processing-failed"],
        text: "",
        keywords: [],
      };
    }
  }

  async processPDF(filePath: string) {
    try {
      const fileBuffer = await this.getFileBuffer(filePath);
      const pdfData = await pdfParse(fileBuffer);
      const text = pdfData.text;

      if (text.length < 50) {
        return { 
          summary: null, 
          keywords: [], 
          text: text,
          aiTags: ["pdf", "document"]
        };
      }

      // Generate AI-powered summary, tags, and keywords
      const [summary, aiTags, aiKeywords] = await Promise.all([
        this.generateSummary(text),
        this.generateAITags(text, "pdf"),
        this.generateAIKeywords(text)
      ]);

      // Combine AI tags with basic PDF tags
      const combinedTags = ["pdf", "document", ...aiTags];
      const uniqueTags = [...new Set(combinedTags)];

      return {
        summary,
        keywords: aiKeywords,
        text: text.substring(0, 5000), // Store first 5000 chars
        aiTags: uniqueTags
      };
    } catch (error) {
      console.error("PDF processing error:", error);
      return { 
        summary: null, 
        keywords: [], 
        text: "",
        aiTags: ["pdf", "document", "processing-failed"]
      };
    }
  }

  async processText(filePath: string) {
    try {
      const fileBuffer = await this.getFileBuffer(filePath);
      const text = fileBuffer.toString('utf-8');

      if (text.length < 50) {
        return { 
          summary: null, 
          keywords: [],
          aiTags: ["text", "document"]
        };
      }

      // Generate AI-powered summary, tags, and keywords
      const [summary, aiTags, aiKeywords] = await Promise.all([
        this.generateSummary(text),
        this.generateAITags(text, "text"),
        this.generateAIKeywords(text)
      ]);

      // Combine AI tags with basic text tags
      const combinedTags = ["text", "document", ...aiTags];
      const uniqueTags = [...new Set(combinedTags)];

      return {
        summary,
        keywords: aiKeywords,
        aiTags: uniqueTags
      };
    } catch (error) {
      console.error("Text processing error:", error);
      return { 
        summary: null, 
        keywords: [],
        aiTags: ["text", "document", "processing-failed"]
      };
    }
  }

  async generateSummary(text: string): Promise<string | null> {
    try {
      if (!text || text.length < 100) {
        console.log(`Text too short for summary (${text.length} chars)`);
        return null;
      }

      if (!process.env.OPENAI_API_KEY) {
        console.error("OpenAI API key not found");
        return null;
      }

      // Truncate text to fit within token limits (roughly 3000 chars = ~750 tokens)
      const textToSummarize = text.substring(0, 3000);

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that creates concise summaries of documents. Provide a 2-3 sentence summary that captures the main points and key information.",
          },
          {
            role: "user",
            content: `Please summarize this document:\n\n${textToSummarize}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
      });

      const summary = response.choices[0]?.message?.content;

      if (summary) {
        console.log(
          `OpenAI summary generated successfully (${summary.length} chars)`,
        );
      } else {
        console.warn("OpenAI returned empty summary");
      }

      return summary || null;
    } catch (error: any) {
      // Check for specific OpenAI errors
      if (error.code === "insufficient_quota") {
        console.error("OpenAI quota exceeded:", error);
      } else if (error.code === "invalid_api_key") {
        console.error("Invalid OpenAI API key:", error);
      } else if (error.status === 429) {
        console.error("OpenAI rate limit exceeded:", error);
      } else {
        console.error("OpenAI API error:", error);
      }

      return null;
    }
  }

  /**
   * Generate AI tags for text content using OpenAI
   */
  async generateAITags(text: string, fileType: string): Promise<string[]> {
    try {
      if (!text || text.length < 50) {
        console.log(`Text too short for AI tagging (${text.length} chars)`);
        return [];
      }

      if (!process.env.OPENAI_API_KEY) {
        console.error("OpenAI API key not found");
        return [];
      }

      // Truncate text to fit within token limits
      const textToAnalyze = text.substring(0, 2000);

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert document classifier. Analyze the content and generate relevant tags that describe:
1. Document type (e.g., invoice, receipt, contract, report, email, letter)
2. Subject matter (e.g., finance, legal, medical, technical, personal)
3. Content themes (e.g., urgent, confidential, quarterly, annual)
4. Industry/domain (e.g., healthcare, education, technology, retail)

Return exactly 5-10 relevant tags as a JSON array. Tags should be lowercase, single words or short phrases.
File type context: ${fileType}`,
          },
          {
            role: "user",
            content: `Analyze this content and generate tags:\n\n${textToAnalyze}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.warn("OpenAI returned empty response for tagging");
        return [];
      }

      try {
        const parsed = JSON.parse(content);
        const tags = parsed.tags || parsed.categories || parsed.keywords || [];
        
        if (Array.isArray(tags)) {
          console.log(`Generated ${tags.length} AI tags:`, tags);
          return tags.slice(0, 10); // Limit to 10 tags
        }
      } catch (parseError) {
        console.warn("Failed to parse OpenAI tags response, falling back to text parsing");
        // Fallback: extract tags from text response
        const tagMatches = content.match(/["']([^"']+)["']/g);
        if (tagMatches) {
          return tagMatches.map(tag => tag.replace(/["']/g, '')).slice(0, 10);
        }
      }

      return [];
    } catch (error: any) {
      console.error("OpenAI tagging error:", error);
      return [];
    }
  }

  /**
   * Generate contextual keywords from text using OpenAI
   */
  async generateAIKeywords(text: string): Promise<string[]> {
    try {
      if (!text || text.length < 100) {
        return this.extractKeywords(text); // Fallback to basic extraction
      }

      if (!process.env.OPENAI_API_KEY) {
        return this.extractKeywords(text); // Fallback to basic extraction
      }

      const textToAnalyze = text.substring(0, 1500);

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Extract the most important keywords and key phrases from the text. Focus on:
1. Main topics and subjects
2. Important names, places, organizations
3. Key concepts and technical terms
4. Action items or important dates

Return 8-15 keywords as a JSON array. Use single words or short phrases.`,
          },
          {
            role: "user",
            content: `Extract keywords from this text:\n\n${textToAnalyze}`,
          },
        ],
        max_tokens: 80,
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return this.extractKeywords(text); // Fallback
      }

      try {
        const parsed = JSON.parse(content);
        const keywords = parsed.keywords || parsed.terms || parsed.phrases || [];
        
        if (Array.isArray(keywords)) {
          console.log(`Generated ${keywords.length} AI keywords:`, keywords);
          return keywords.slice(0, 15);
        }
      } catch (parseError) {
        console.warn("Failed to parse OpenAI keywords response");
      }

      return this.extractKeywords(text); // Fallback
    } catch (error) {
      console.error("OpenAI keyword extraction error:", error);
      return this.extractKeywords(text); // Fallback
    }
  }

  /**
   * Generate basic tags based on file type when AI processing isn't applicable
   */
  async generateBasicTags(mimeType: string): Promise<string[]> {
    const basicTags = ["file"];

    if (mimeType.startsWith("image/")) {
      basicTags.push("image");
      if (mimeType.includes("jpeg") || mimeType.includes("jpg")) basicTags.push("photo");
      if (mimeType.includes("png")) basicTags.push("graphic");
      if (mimeType.includes("gif")) basicTags.push("animated");
    } else if (mimeType.startsWith("video/")) {
      basicTags.push("video", "media");
    } else if (mimeType.startsWith("audio/")) {
      basicTags.push("audio", "media");
    } else if (mimeType.includes("pdf")) {
      basicTags.push("pdf", "document");
    } else if (mimeType.includes("word") || mimeType.includes("msword")) {
      basicTags.push("word", "document", "office");
    } else if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
      basicTags.push("excel", "spreadsheet", "office");
    } else if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) {
      basicTags.push("powerpoint", "presentation", "office");
    } else if (mimeType.startsWith("text/")) {
      basicTags.push("text", "document");
    } else if (mimeType.includes("zip") || mimeType.includes("archive")) {
      basicTags.push("archive", "compressed");
    }

    return basicTags;
  }

  enhanceImageTags(baseTags: string[], ocrText: string): string[] {
    const enhancedTags = [...baseTags];
    const lowerOcrText = ocrText.toLowerCase();

    // Document type detection based on OCR content using imported patterns
    for (const [tag, pattern] of Object.entries(
      documentClassificationPatterns,
    )) {
      if (pattern.test(lowerOcrText) && !enhancedTags.includes(tag)) {
        enhancedTags.push(tag);
      }
    }

    // Visual content enhancement based on existing tags
    const visualEnhancements = {
      text: ["document", "readable"],
      person: ["people", "portrait"],
      vehicle: ["transportation"],
      building: ["architecture", "structure"],
      food: ["dining", "meal"],
      nature: ["outdoor", "scenic"],
      technology: ["digital", "tech"],
      handwriting: ["personal", "manual"],
      paper: ["document", "printed"],
      book: ["reading", "literature"],
      computer: ["digital", "technology"],
      phone: ["mobile", "communication"],
    };

    for (const [baseTag, additions] of Object.entries(visualEnhancements)) {
      if (baseTags.some((tag) => tag.toLowerCase().includes(baseTag))) {
        additions.forEach((addition) => {
          if (!enhancedTags.includes(addition)) {
            enhancedTags.push(addition);
          }
        });
      }
    }

    // Quality and utility tags
    if (ocrText.length > 100) {
      enhancedTags.push("text-rich");
    } else if (ocrText.length > 20) {
      enhancedTags.push("has-text");
    }

    if (ocrText.length < 10 && baseTags.length > 0) {
      enhancedTags.push("visual-content");
    }

    // Add utility tags based on content
    if (ocrText.includes("@") || ocrText.includes("email")) {
      enhancedTags.push("contact-info");
    }

    if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(ocrText)) {
      enhancedTags.push("phone-number");
    }

    if (/\$\d+|\d+\.\d{2}/.test(ocrText)) {
      enhancedTags.push("monetary");
    }

    return enhancedTags.slice(0, 15); // Limit to 15 tags max
  }

  extractKeywords(text: string): string[] {
    if (!text) return [];

    // Simple keyword extraction (can be enhanced with NLP libraries)
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .filter((word) => !this.stopWords.includes(word));

    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top 10 keywords
    const keywords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return keywords;
  }

  private stopWords = [
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "up",
    "about",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "among",
    "this",
    "that",
    "these",
    "those",
    "what",
    "which",
    "who",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "only",
    "own",
    "same",
    "than",
    "too",
    "very",
    "can",
    "will",
    "just",
  ];

  async close() {
    await this.worker.close();
  }
}

// Start the worker
const processor = new AIProcessor();

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  await processor.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await processor.close();
  process.exit(0);
});

export default processor;
