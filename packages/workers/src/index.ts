import dotenv from 'dotenv';
import aiProcessor from './workers/ai-processor.js';
import { QueueMonitor } from './monitor.js';

// Load environment variables
dotenv.config();

console.log('🚀 Starting Sortify AI Worker...');
console.log('📋 Worker will process AI jobs from Redis queue');
console.log(`🔌 Redis URL: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);

// Start queue monitoring (every 30 seconds)
QueueMonitor.startMonitoring(30000);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await aiProcessor.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await aiProcessor.close();
  process.exit(0);
});

console.log('✅ AI Worker started successfully!');
console.log('👀 Watching for new files to process...');

// Show initial stats
setTimeout(async () => {
  await QueueMonitor.printStats();
}, 5000);
