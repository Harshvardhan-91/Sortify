import dotenv from "dotenv";
import aiProcessor from "./workers/ai-processor.js";
import { QueueMonitor } from "./monitor.js";

// Load environment variables
dotenv.config();

// Export functions for use by backend
export {
  addAIProcessingJob,
  addCleanupJob,
  aiQueue,
  cleanupQueue,
} from "./queue.js";
export { QueueMonitor } from "./monitor.js";
export { visionConfig } from "./config/vision-config.js";

// Start queue monitoring (every 30 seconds)
QueueMonitor.startMonitoring(30000);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down gracefully...");
  await aiProcessor.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down gracefully...");
  await aiProcessor.close();
  process.exit(0);
});

// Show initial stats
setTimeout(async () => {
  console.log("\nQueue Statistics:");
  await QueueMonitor.printStats();
}, 5000);
