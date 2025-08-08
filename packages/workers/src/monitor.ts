import { aiQueue, cleanupQueue } from './queue.js';

interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  totalJobs: number;
}

export class QueueMonitor {
  static async getStats() {
    const aiStats = await aiQueue.getJobCounts();
    const cleanupStats = await cleanupQueue.getJobCounts();
    
    return {
      aiQueue: {
        name: 'AI Processing',
        ...aiStats,
        totalJobs: Object.values(aiStats).reduce((sum: number, count: unknown) => sum + (count as number), 0)
      } as QueueStats,
      cleanupQueue: {
        name: 'File Cleanup',
        ...cleanupStats,
        totalJobs: Object.values(cleanupStats).reduce((sum: number, count: unknown) => sum + (count as number), 0)
      } as QueueStats
    };
  }

  static async printStats() {
    const stats = await this.getStats();
    
    
    
  }

  static startMonitoring(intervalMs: number = 30000) {
    console.log(`tarting queue monitoring (every ${intervalMs/1000}s)...`);
    
    setInterval(async () => {
      try {
        await this.printStats();
      } catch (error) {
        console.error('Error monitoring queues:', error);
      }
    }, intervalMs);
  }
}
