import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Redis connection
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
});

// AI Processing Queue
export const aiQueue = new Queue('ai-processing', { 
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export interface AIJobData {
  fileId: string;
  filePath: string;
  mimeType: string;
  userId: string;
}

export const addAIProcessingJob = async (data: AIJobData) => {
  return await aiQueue.add('process-file', data, {
    priority: 1,
    delay: 1000, // 1 second delay to ensure file is saved
  });
};

// File cleanup queue for managing storage
export const cleanupQueue = new Queue('file-cleanup', { 
  connection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 10,
  },
});

export const addCleanupJob = async (filePath: string, delay: number = 0) => {
  return await cleanupQueue.add('cleanup-file', { filePath }, { delay });
};

export { connection };
