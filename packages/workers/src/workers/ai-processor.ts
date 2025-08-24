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
      } else if (mimeType.startsWith("text/")) {
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

      // Perform multiple types of analysis
      const [labelResult] = await visionClient.labelDetection(filePath);
      const [textResult] = await visionClient.textDetection(filePath);

      // Object localization and logo detection (optional features)
      let objectAnnotations: any[] = [];
      let logoAnnotations: any[] = [];

      try {
        if (visionClient.objectLocalization) {
          const [objectResult] =
            await visionClient.objectLocalization(filePath);
          objectAnnotations = objectResult.localizedObjectAnnotations || [];
        }
      } catch (error) {
        console.warn("Object localization not available:", error);
      }

      try {
        if (visionClient.logoDetection) {
          const [logoResult] = await visionClient.logoDetection(filePath);
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

      // Enhance tags with document-specific classifications
      const enhancedTags = this.enhanceImageTags(
        allTags,
        textResult.textAnnotations?.[0]?.description || "",
      );

      // Extract OCR text
      const ocrText = textResult.textAnnotations?.[0]?.description || "";

      // Extract keywords from OCR text
      const keywords = this.extractKeywords(ocrText);

      console.log(
        `✅ Image processing completed. Found ${enhancedTags.length} tags, ${keywords.length} keywords`,
      );

      return {
        tags: enhancedTags,
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
      const fileBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(fileBuffer);
      const text = pdfData.text;

      if (text.length < 50) {
        return { summary: null, keywords: [], text: text };
      }

      const summary = await this.generateSummary(text);

      const keywords = this.extractKeywords(text);

      return {
        summary,
        keywords,
        text: text.substring(0, 5000), // Store first 5000 chars
      };
    } catch (error) {
      console.log(error);
      return { summary: null, keywords: [], text: "" };
    }
  }

  async processText(filePath: string) {
    try {
      const text = await fs.readFile(filePath, "utf-8");

      const summary = await this.generateSummary(text);
      const keywords = this.extractKeywords(text);

      return {
        summary,
        keywords,
      };
    } catch (error) {
      console.error("Text processing error:", error);
      return { summary: null, keywords: [] };
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
        console.log(error);
      } else if (error.code === "invalid_api_key") {
        console.log(error);
      } else if (error.status === 429) {
        console.log(error);
      }

      return null;
    }
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
