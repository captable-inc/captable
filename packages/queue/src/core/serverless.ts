import { logger } from "@captable/logger";
import { processJobs as coreProcessJobs, getStats } from "./queue";

const log = logger.child({ module: "serverless-queue" });

export interface ServerlessProcessingResult {
  processed: number;
  batches: number;
  duration: number;
  timeoutReached: boolean;
  errors: Array<{ batch: number; error: string }>;
}

export interface ServerlessProcessingOptions {
  maxJobs?: number;
  maxBatches?: number;
  batchSize?: number;
  timeout?: number; // Total timeout in milliseconds
  batchDelay?: number; // Delay between batches in milliseconds
}

/**
 * Process jobs in a serverless-compatible way with timeouts and batch limits
 * Perfect for use with cron jobs and serverless functions
 */
export async function processJobsServerless(
  options: ServerlessProcessingOptions = {},
): Promise<ServerlessProcessingResult> {
  const {
    maxJobs = 200,
    maxBatches = 10,
    batchSize = 20,
    timeout = 25000, // 25 seconds default (safe for most serverless)
    batchDelay = 100,
  } = options;

  const startTime = Date.now();
  let totalProcessed = 0;
  let batchCount = 0;
  const errors: Array<{ batch: number; error: string }> = [];
  let timeoutReached = false;

  log.info(
    { maxJobs, maxBatches, batchSize, timeout },
    "Starting serverless job processing",
  );

  try {
    while (batchCount < maxBatches && totalProcessed < maxJobs) {
      // Check timeout before each batch
      if (Date.now() - startTime >= timeout) {
        timeoutReached = true;
        log.warn(
          { duration: Date.now() - startTime, timeout },
          "Processing timeout reached",
        );
        break;
      }

      try {
        const processed = await coreProcessJobs(batchSize);
        totalProcessed += processed;
        batchCount++;

        log.debug(
          {
            batch: batchCount,
            processed,
            totalProcessed,
            duration: Date.now() - startTime,
          },
          "Batch processed",
        );

        // If no jobs were processed, break early
        if (processed === 0) {
          log.info("No more jobs to process");
          break;
        }

        // Add delay between batches to prevent overwhelming the system
        if (batchDelay > 0 && batchCount < maxBatches) {
          await new Promise((resolve) => setTimeout(resolve, batchDelay));
        }
      } catch (batchError) {
        const errorMessage =
          batchError instanceof Error ? batchError.message : String(batchError);
        errors.push({ batch: batchCount + 1, error: errorMessage });

        log.error(
          {
            error: batchError,
            batch: batchCount + 1,
            totalProcessed,
          },
          "Batch processing failed",
        );

        batchCount++; // Still count failed batches
      }
    }
  } catch (error) {
    log.error(
      { error, totalProcessed, batchCount },
      "Critical error in serverless processing",
    );
    throw error;
  }

  const duration = Date.now() - startTime;

  const result: ServerlessProcessingResult = {
    processed: totalProcessed,
    batches: batchCount,
    duration,
    timeoutReached,
    errors,
  };

  log.info(result, "Serverless job processing completed");

  return result;
}

/**
 * Process a single batch with timeout protection
 */
export async function processSingleBatch(
  batchSize = 20,
  timeout = 5000,
): Promise<{ processed: number; duration: number }> {
  const startTime = Date.now();

  return Promise.race([
    coreProcessJobs(batchSize).then((processed) => ({
      processed,
      duration: Date.now() - startTime,
    })),
    new Promise<{ processed: number; duration: number }>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Batch timeout after ${timeout}ms`)),
        timeout,
      ),
    ),
  ]);
}

/**
 * Health check for serverless queue processing
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  canProcess: boolean;
  timestamp: number;
  error?: string;
}> {
  try {
    const stats = await getStats();

    return {
      healthy: true,
      canProcess: stats.pending > 0,
      timestamp: Date.now(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      healthy: false,
      canProcess: false,
      timestamp: Date.now(),
      error: errorMessage,
    };
  }
}

/**
 * Get queue status optimized for serverless monitoring
 */
export async function getQueueStatus(): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalActive: number;
  requiresProcessing: boolean;
}> {
  const stats = await getStats();

  return {
    ...stats,
    totalActive: stats.pending + stats.processing,
    requiresProcessing: stats.pending > 0,
  };
}
