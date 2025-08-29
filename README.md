# Sortify - AI-Powered File Management

An intelligent cloud storage platform that uses AI to automatically organize, tag, and make your files searchable.

## 🚀 Features

- **AI-Powered Organization**: Automatic file tagging and categorization using OpenAI and Google Cloud Vision
- **Smart Search**: Natural language search across all your files
- **Cloud Storage**: Secure file storage with AWS S3 integration
- **Real-time Processing**: Background AI processing with Redis queues
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **Enterprise Security**: Authentication, file sharing, and access controls

## 🛠 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **NextAuth.js** for authentication

### Backend
- **Express.js** API server
- **Prisma ORM** with PostgreSQL
- **AWS S3** for file storage
- **Redis + BullMQ** for background processing

### AI & Processing
- **OpenAI GPT** for text summarization and tagging
- **Google Cloud Vision** for image analysis
- **PDF parsing** and OCR capabilities

## 📁 Project Structure

```
Sortify/
├── apps/
│   ├── web/          # Next.js frontend
│   └── server/       # Express.js API
├── packages/
│   ├── db/           # Prisma schema & client
│   ├── ui/           # Shared React components
│   ├── workers/      # AI processing workers
│   └── ...config packages
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis server
- AWS S3 bucket (optional, can use local storage)
- OpenAI API key (optional, for AI features)
- Google Cloud Vision API key (optional, for image processing)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Harshvardhan-91/Sortify.git
cd Sortify
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy example files
cp apps/server/.env.example apps/server/.env
cp packages/workers/.env.example packages/workers/.env
cp apps/web/.env.example apps/web/.env

# Edit the .env files with your configurations
```

4. **Set up the database**
```bash
cd packages/db
npx prisma migrate dev
npx prisma generate
```

5. **Start the development servers**
```bash
npm run dev
```

This will start:
- Web app: http://localhost:3001
- API server: http://localhost:3002
- Background workers

## 🔧 Configuration

### AWS S3 Setup

For cloud file storage, see [AWS S3 Setup Guide](docs/AWS_S3_SETUP.md).

### AI Processing

1. **OpenAI** (for text summarization):
   ```env
   OPENAI_API_KEY=your-openai-api-key
   ```

2. **Google Cloud Vision** (for image analysis):
   ```env
   GOOGLE_CLOUD_KEY_FILE=path/to/service-account-key.json
   ```

### Database

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sortify"
```

### Redis Queue

```env
REDIS_URL="redis://localhost:6379"
```

## 📚 API Documentation

### File Upload

#### Direct S3 Upload (Recommended)
```typescript
// 1. Get signed upload URL
POST /api/files/upload-url
{
  "fileName": "document.pdf",
  "mimeType": "application/pdf"
}

// 2. Upload to S3 using returned URL
PUT <signed-url>

// 3. Confirm upload
POST /api/files/confirm-upload
{
  "key": "s3-object-key",
  "fileName": "document.pdf",
  "mimeType": "application/pdf",
  "size": 1024
}
```

#### Server Upload (Alternative)
```typescript
POST /api/files/upload
FormData: file
```

### File Operations

```typescript
GET /api/files              # List user files
GET /api/files/:id          # Get file details
GET /api/files/:id/download # Download file
DELETE /api/files/:id       # Delete file
PATCH /api/files/:id        # Update file metadata
```

## 📄 License

This project is licensed under the MIT License.


### Utilities

This Turborepo has some additional tools already setup for you:

- [Tailwind CSS](https://tailwindcss.com/) for styles
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
