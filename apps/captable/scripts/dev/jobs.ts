#!/usr/bin/env bun

import { logger } from "@captable/logger";
import { cleanupJobs, getStats, processJobs } from "@captable/queue";

// Import all jobs to register them
import "@/jobs";

const log = logger.child({ module: "dev-job-runner" });

async function runJobs() {
  try {
    log.info("Starting job processing...");

    // Get current stats
    const initialStats = await getStats();
    log.info(initialStats, "Initial queue stats");

    if (initialStats.pending === 0) {
      log.info("No pending jobs to process");
      return 0;
    }

    // Process jobs in batches
    let totalProcessed = 0;
    let batchCount = 0;
    const maxBatches = 10;

    while (batchCount < maxBatches) {
      const processed = await processJobs(20);
      totalProcessed += processed;
      batchCount++;

      if (processed === 0) {
        break;
      }

      log.info({ processed, batch: batchCount }, "Batch completed");

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const finalStats = await getStats();
    log.info(
      {
        totalProcessed,
        batches: batchCount,
        finalStats,
      },
      "Job processing completed",
    );

    return totalProcessed;
  } catch (error) {
    log.error({ error }, "Job processing failed");
    throw error;
  }
}

async function runJobsInWatchMode() {
  log.info("🔄 Starting job processor in watch mode...");
  log.info("Press Ctrl+C to stop");

  const POLL_INTERVAL = 5000; // Check every 5 seconds

  let isShuttingDown = false;

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    log.info("Received SIGINT, shutting down gracefully...");
    isShuttingDown = true;
  });

  process.on("SIGTERM", () => {
    log.info("Received SIGTERM, shutting down gracefully...");
    isShuttingDown = true;
  });

  while (!isShuttingDown) {
    try {
      const processed = await runJobs();

      if (processed === 0) {
        // No jobs processed, wait before checking again
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      } else {
        // Jobs were processed, check again more quickly
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      log.error({ error }, "Error in watch mode, continuing...");
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
  }

  log.info("Job processor stopped");
}

async function cleanupOldJobs() {
  try {
    log.info("Cleaning up old jobs...");
    const cleaned = await cleanupJobs(1); // Clean jobs older than 1 day in dev
    log.info({ cleaned }, "Cleanup completed");
  } catch (error) {
    log.error({ error }, "Cleanup failed");
  }
}

async function showStats() {
  try {
    const stats = await getStats();
    console.log("\n📊 Queue Statistics:");
    console.table(stats);
  } catch (error) {
    log.error({ error }, "Failed to get stats");
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || "process";
const isWatchMode = args.includes("--watch") || args.includes("-w");

switch (command) {
  case "process":
    if (isWatchMode) {
      runJobsInWatchMode();
    } else {
      runJobs().catch(() => process.exit(1));
    }
    break;
  case "cleanup":
    cleanupOldJobs();
    break;
  case "stats":
    showStats();
    break;
  default:
    console.log("Usage: bun run jobs [process|cleanup|stats] [--watch]");
    console.log("  process  - Process pending jobs (default)");
    console.log("  cleanup  - Clean up old completed jobs");
    console.log("  stats    - Show queue statistics");
    console.log("  --watch  - Run in watch mode (continuous processing)");
    process.exit(1);
}
