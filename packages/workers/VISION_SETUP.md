# Google Cloud Vision API Setup Guide

This guide will help you set up Google Cloud Vision API for AI-powered image tagging in Sortify.

## Prerequisites

1. Google Cloud Platform account
2. Google Cloud Vision API enabled
3. Service account with Vision API permissions

## Setup Steps

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project

### 2. Enable Vision API
1. Navigate to APIs & Services > Library
2. Search for "Vision API"
3. Click "Enable"

### 3. Create Service Account
1. Go to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Name: `sortify-vision-api`
4. Grant roles:
   - Cloud Vision API User
   - Storage Object Viewer (if files are in Cloud Storage)

### 4. Create and Download Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose JSON format
5. Download the key file

### 5. Environment Configuration
Add the following to your `.env` file:

```env
# Google Cloud Vision API
GOOGLE_CLOUD_KEY_FILE=/path/to/your/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

### 6. Security Best Practices
- Never commit the service account key to version control
- Store the key file securely
- Use environment variables for configuration
- Consider using Google Cloud Secret Manager in production

## Features Enabled

With Google Cloud Vision API configured, Sortify can automatically:

✅ **Label Detection**: Identify objects, scenes, and activities in images
✅ **Text Detection (OCR)**: Extract text from images and documents  
✅ **Object Localization**: Detect and locate specific objects
✅ **Logo Detection**: Identify company logos and brands
✅ **Document Classification**: Auto-categorize receipts, invoices, business cards, etc.

## Supported Image Types

- JPEG/JPG
- PNG  
- GIF
- BMP
- WebP
- TIFF

## API Costs

Google Cloud Vision API pricing:
- First 1,000 requests per month: Free
- Additional requests: $1.50 per 1,000 images

Monitor usage in Google Cloud Console to avoid unexpected charges.

## Troubleshooting

### Common Issues

1. **"Vision client not configured"**
   - Check if `GOOGLE_CLOUD_KEY_FILE` environment variable is set
   - Verify the service account key file exists and is accessible

2. **Authentication errors**
   - Ensure the service account has Vision API permissions
   - Check if the key file is valid JSON

3. **API not enabled**
   - Verify Vision API is enabled in Google Cloud Console
   - Check if billing is enabled for the project

### Testing the Setup

Run the AI worker and upload an image file to test if Vision API is working:

```bash
# Check if Vision API is responding
npm run worker
```

Look for logs like:
```
🖼️ Processing image with Google Cloud Vision: /path/to/image.jpg
✅ Image processing completed. Found 5 tags, 3 keywords
```

## Integration Status

Post 9 ✅ **AI Tagging with Google Cloud Vision** - COMPLETE

The AI worker now automatically:
- Analyzes uploaded images
- Extracts descriptive tags
- Performs OCR on text in images  
- Classifies document types
- Enhances organization with smart tagging

Next: Building file tree and folder structure UI!
