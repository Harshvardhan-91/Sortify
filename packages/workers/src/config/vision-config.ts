// Google Cloud Vision Configuration
// This file contains configuration for Google Cloud Vision API integration

export const visionConfig = {
  // Minimum confidence scores for different detection types
  confidence: {
    labels: 0.7, // General image labels
    objects: 0.8, // Object detection
    logos: 0.7, // Logo detection
    text: 0.6, // OCR text detection
  },

  // Maximum number of results to return
  maxResults: {
    labels: 8,
    objects: 5,
    logos: 3,
    text: 1,
  },

  // Supported image formats
  supportedFormats: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/tiff",
  ],

  // Vision API features to enable
  features: [
    "LABEL_DETECTION",
    "TEXT_DETECTION",
    "OBJECT_LOCALIZATION",
    "LOGO_DETECTION",
  ],
};

export const documentClassificationPatterns = {
  receipt: /receipt|total|tax|purchase|pay|store|shop/i,
  invoice: /invoice|bill|due|amount|payment|billing/i,
  "business-card": /phone|email|@|company|contact|business/i,
  certificate: /certificate|certified|diploma|award|achievement/i,
  license: /license|permit|issued|valid|authority/i,
  contract: /contract|agreement|terms|conditions|legal/i,
  report: /report|analysis|summary|findings|conclusion/i,
  form: /form|application|submit|signature|field/i,
  whiteboard: /whiteboard|board|meeting|notes|brainstorm/i,
  screenshot: /screenshot|screen|browser|app|interface/i,
  handwritten: /handwriting|handwritten|notes|written|manual/i,
  presentation: /slide|presentation|powerpoint|deck|agenda/i,
  financial: /\$|USD|EUR|GBP|\d+\.\d{2}|financial|budget/i,
  medical: /medical|health|doctor|patient|prescription|clinic/i,
  legal: /legal|law|court|attorney|case|jurisdiction/i,
  educational: /school|university|student|course|grade|assignment/i,
  identification: /id|identification|passport|driver|license/i,
};
