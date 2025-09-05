// Simulate AI processing for demo purposes
export interface AIProcessingResult {
  aiTags: string[];
  aiSummary: string;
  aiKeywords: string[];
  ocrText?: string;
}

export function simulateAIProcessing(file: { name: string; mimeType: string }): Promise<AIProcessingResult> {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      const isImage = file.mimeType.startsWith('image/');
      const isPDF = file.mimeType.includes('pdf');
      const isDocument = file.mimeType.includes('document') || file.mimeType.includes('text');
      
      let result: AIProcessingResult;
      
      if (isImage) {
        result = {
          aiTags: ['image', 'photo', 'visual', 'graphic', 'media'],
          aiSummary: `Visual content detected in ${file.name}. This appears to be an image file with potential visual elements.`,
          aiKeywords: ['visual', 'image', 'media', 'content'],
          ocrText: 'Sample text extracted from image content'
        };
      } else if (isPDF) {
        result = {
          aiTags: ['document', 'pdf', 'text', 'formal', 'report'],
          aiSummary: `PDF document "${file.name}" contains structured text content with multiple pages and formatting.`,
          aiKeywords: ['document', 'pdf', 'formal', 'text', 'report'],
          ocrText: 'Extracted text content from PDF document...'
        };
      } else if (isDocument) {
        result = {
          aiTags: ['document', 'text', 'office', 'content', 'writing'],
          aiSummary: `Text document "${file.name}" containing written content and potentially structured information.`,
          aiKeywords: ['text', 'document', 'content', 'writing'],
          ocrText: 'Text content extracted from document...'
        };
      } else {
        result = {
          aiTags: ['file', 'data', 'content', 'digital'],
          aiSummary: `Digital file "${file.name}" processed for content analysis and organization.`,
          aiKeywords: ['file', 'data', 'digital', 'content']
        };
      }
      
      resolve(result);
    }, 2000 + Math.random() * 3000); // 2-5 seconds
  });
}
