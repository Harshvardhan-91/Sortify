import dotenv from 'dotenv';
import aiProcessor from './workers/ai-processor.js';
import { QueueMonitor } from './monitor.js';

// Load environment variables
dotenv.config();


// Start queue monitoring (every 30 seconds)
QueueMonitor.startMonitoring(30000);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await aiProcessor.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await aiProcessor.close();
  process.exit(0);
});


// Show initial stats
setTimeout(async () => {
  await QueueMonitor.printStats();
}, 5000);
