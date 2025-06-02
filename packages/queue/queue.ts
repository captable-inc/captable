import { db } from "@captable/db";
import { jobQueue } from "@captable/db/schema";
import type { JobQueue } from "@captable/db/schema";
import { logger } from "@captable/logger";
import { and, asc, desc, eq, lt, lte, sql } from "drizzle-orm";
import type { BulkJobInput, JobOptions, JobProcessor, JobStats } from "./types";

const log = logger.child({ module: "queue" });

// Module-level processors map
const processors = new Map<string, JobProcessor<Record<string, unknown>>>();

/**
 * Register a job processor
 */
export function register<T extends Record<string, unknown>>(
  processor: JobProcessor<T>,
) {
  processors.set(
    processor.type,
    processor as JobProcessor<Record<string, unknown>>,
  );
  log.info(`Registered job processor: ${processor.type}`);
}

/**
 * Add a single job to the queue
 */
export async function addJob<T extends Record<string, unknown>>(
  type: string,
  payload: T,
  options: JobOptions = {},
): Promise<string> {
  const {
    delay = 0,
    maxAttempts = 3,
    priority = 0,
    retryDelay = 1000,
  } = options;

  const scheduledFor = new Date(Date.now() + delay * 1000);

  const [job] = await db
    .insert(jobQueue)
    .values({
      type,
      payload,
      maxAttempts,
      priority,
      scheduledFor,
      retryDelay,
    })
    .returning();

  if (!job) {
    throw new Error("Failed to create job");
  }

  log.info(
    {
      jobId: job.id,
      type,
      scheduledFor,
      priority,
    },
    `Job queued: ${type}`,
  );

  return job.id;
}

/**
 * Add multiple jobs to the queue in bulk
 */
export async function addJobs<T extends Record<string, unknown>>(
  jobs: Array<BulkJobInput<T>>,
): Promise<string[]> {
  const jobsToInsert = jobs.map(({ type, payload, options = {} }) => {
    const {
      delay = 0,
      maxAttempts = 3,
      priority = 0,
      retryDelay = 1000,
    } = options;

    return {
      type,
      payload,
      maxAttempts,
      priority,
      scheduledFor: new Date(Date.now() + delay * 1000),
      retryDelay,
    };
  });

  const insertedJobs = await db
    .insert(jobQueue)
    .values(jobsToInsert)
    .returning();

  log.info(`Bulk queued ${insertedJobs.length} jobs`);
  return insertedJobs.map((job) => job.id);
}

/**
 * Process pending jobs
 */
export async function processJobs(limit = 10): Promise<number> {
  const startTime = Date.now();

  // Get jobs ordered by priority (desc) then created date (asc)
  const jobs = await db
    .select()
    .from(jobQueue)
    .where(
      and(
        eq(jobQueue.status, "pending"),
        lte(jobQueue.scheduledFor, new Date()),
        lt(jobQueue.attempts, jobQueue.maxAttempts),
      ),
    )
    .orderBy(desc(jobQueue.priority), asc(jobQueue.createdAt))
    .limit(limit);

  if (jobs.length === 0) {
    return 0;
  }

  log.info(`Processing ${jobs.length} jobs`);

  let processedCount = 0;

  for (const job of jobs) {
    try {
      await executeJob(job);
      processedCount++;
    } catch (error) {
      log.error(
        {
          jobId: job.id,
          type: job.type,
          error: error instanceof Error ? error.message : String(error),
        },
        `Job execution failed: ${job.type}`,
      );
    }
  }

  const duration = Date.now() - startTime;
  log.info(
    {
      processed: processedCount,
      total: jobs.length,
      duration,
    },
    `Job processing completed in ${duration}ms`,
  );

  return processedCount;
}

/**
 * Execute a single job
 */
async function executeJob(job: JobQueue): Promise<void> {
  const jobStartTime = Date.now();

  // Update job status to processing
  await db
    .update(jobQueue)
    .set({
      status: "processing",
      updatedAt: new Date(),
    })
    .where(eq(jobQueue.id, job.id));

  const processor = processors.get(job.type);
  if (!processor) {
    throw new Error(`No processor registered for job type: ${job.type}`);
  }

  try {
    await processor.process(job.payload as Record<string, unknown>);

    // Mark as completed
    await db
      .update(jobQueue)
      .set({
        status: "completed",
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobQueue.id, job.id));

    const duration = Date.now() - jobStartTime;
    log.info(
      {
        jobId: job.id,
        type: job.type,
        duration,
      },
      `Job completed: ${job.type}`,
    );
  } catch (error) {
    const newAttempts = job.attempts + 1;
    const isLastAttempt = newAttempts >= job.maxAttempts;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Calculate next retry time with exponential backoff
    const nextRetryDelay = job.retryDelay * 2 ** job.attempts;
    const nextScheduledFor = new Date(Date.now() + nextRetryDelay);

    await db
      .update(jobQueue)
      .set({
        attempts: newAttempts,
        status: isLastAttempt ? "failed" : "pending",
        error: errorMessage,
        failedAt: isLastAttempt ? new Date() : undefined,
        scheduledFor: isLastAttempt ? job.scheduledFor : nextScheduledFor,
        updatedAt: new Date(),
      })
      .where(eq(jobQueue.id, job.id));

    if (isLastAttempt) {
      log.error(
        {
          jobId: job.id,
          type: job.type,
          attempts: newAttempts,
          error: errorMessage,
        },
        `Job failed permanently: ${job.type}`,
      );
    } else {
      log.warn(
        {
          jobId: job.id,
          type: job.type,
          attempts: newAttempts,
          nextRetry: nextScheduledFor,
          error: errorMessage,
        },
        `Job failed, will retry: ${job.type}`,
      );
    }

    throw error;
  }
}

/**
 * Get job statistics
 */
export async function getStats(): Promise<JobStats> {
  const stats = await db
    .select({
      status: jobQueue.status,
      count: sql<number>`count(*)`,
    })
    .from(jobQueue)
    .groupBy(jobQueue.status);

  return stats.reduce(
    (acc, stat) => {
      acc[stat.status as keyof JobStats] = stat.count;
      return acc;
    },
    {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    } as JobStats,
  );
}

/**
 * Clean up old completed jobs
 */
export async function cleanupJobs(olderThanDays = 7): Promise<number> {
  const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  const result = await db
    .delete(jobQueue)
    .where(
      and(
        lte(jobQueue.createdAt, cutoffDate),
        eq(jobQueue.status, "completed"),
      ),
    );

  const deletedCount = result.length || 0;
  log.info(`Cleaned up ${deletedCount} old completed jobs`);
  return deletedCount;
}

/**
 * Get all processors types
 */
export function getRegisteredProcessors(): string[] {
  return Array.from(processors.keys());
}

/**
 * Clear all processors (useful for testing)
 */
export function clearProcessors(): void {
  processors.clear();
}
