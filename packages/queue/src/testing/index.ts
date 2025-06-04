import { db } from "@captable/db";
import { jobQueue } from "@captable/db/schema";
import type { JobQueue } from "@captable/db/schema";
import { eq } from "@captable/db/utils";
import {
  clearProcessors as clearCoreProcessors,
  register,
} from "../core/queue";
import type { JobProcessor } from "../types";

/**
 * Queue testing utilities
 */
export namespace QueueTestHelper {
  /**
   * Clear all jobs from the queue
   */
  export async function clearAllJobs(): Promise<void> {
    await db.delete(jobQueue);
  }

  /**
   * Clear only completed jobs
   */
  export async function clearCompletedJobs(): Promise<void> {
    await db.delete(jobQueue).where(eq(jobQueue.status, "completed"));
  }

  /**
   * Clear only failed jobs
   */
  export async function clearFailedJobs(): Promise<void> {
    await db.delete(jobQueue).where(eq(jobQueue.status, "failed"));
  }

  /**
   * Clear all processors (useful for test isolation)
   */
  export function clearProcessors(): void {
    clearCoreProcessors();
  }

  /**
   * Wait for a specific job to complete or fail
   */
  export async function waitForJobCompletion(
    jobId: string,
    timeout = 10000,
  ): Promise<JobQueue> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const job = await db
        .select()
        .from(jobQueue)
        .where(eq(jobQueue.id, jobId))
        .limit(1);

      if (job[0]?.status === "completed" || job[0]?.status === "failed") {
        return job[0];
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Job ${jobId} did not complete within ${timeout}ms`);
  }

  /**
   * Wait for all jobs of a specific type to complete
   */
  export async function waitForJobTypeCompletion(
    jobType: string,
    timeout = 10000,
  ): Promise<JobQueue[]> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const jobs = await db
        .select()
        .from(jobQueue)
        .where(eq(jobQueue.type, jobType));

      const pendingJobs = jobs.filter(
        (job) => job.status === "pending" || job.status === "processing",
      );

      if (pendingJobs.length === 0) {
        return jobs;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(
      `Jobs of type ${jobType} did not complete within ${timeout}ms`,
    );
  }

  /**
   * Wait for queue to be empty (no pending or processing jobs)
   */
  export async function waitForEmptyQueue(timeout = 10000): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const pendingJobs = await db
        .select()
        .from(jobQueue)
        .where(eq(jobQueue.status, "pending"))
        .limit(1);

      const processingJobs = await db
        .select()
        .from(jobQueue)
        .where(eq(jobQueue.status, "processing"))
        .limit(1);

      if (pendingJobs.length === 0 && processingJobs.length === 0) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Queue did not become empty within ${timeout}ms`);
  }

  /**
   * Get job by ID
   */
  export async function getJob(jobId: string): Promise<JobQueue | null> {
    const jobs = await db
      .select()
      .from(jobQueue)
      .where(eq(jobQueue.id, jobId))
      .limit(1);

    return jobs[0] || null;
  }

  /**
   * Get all jobs of a specific type
   */
  export async function getJobsByType(jobType: string): Promise<JobQueue[]> {
    return await db.select().from(jobQueue).where(eq(jobQueue.type, jobType));
  }

  /**
   * Get jobs by status
   */
  export async function getJobsByStatus(
    status: "pending" | "processing" | "completed" | "failed",
  ): Promise<JobQueue[]> {
    return await db.select().from(jobQueue).where(eq(jobQueue.status, status));
  }

  /**
   * Count jobs by status
   */
  export async function countJobsByStatus(
    status: "pending" | "processing" | "completed" | "failed",
  ): Promise<number> {
    const jobs = await getJobsByStatus(status);
    return jobs.length;
  }

  /**
   * Get total job count
   */
  export async function getTotalJobCount(): Promise<number> {
    const jobs = await db.select().from(jobQueue);
    return jobs.length;
  }

  /**
   * Create a mock processor for testing
   */
  export function mockProcessor<T extends Record<string, unknown>>(
    type: string,
    mockFn: (payload: T) => Promise<void> | void,
  ): void {
    const processor: JobProcessor<T> = {
      type,
      process: async (payload) => {
        await mockFn(payload);
      },
    };

    register(processor);
  }

  /**
   * Create a tracking processor that records all calls
   */
  export function trackingProcessor<T extends Record<string, unknown>>(
    type: string,
  ): {
    calls: Array<{ payload: T; timestamp: number }>;
    processor: () => void;
    reset: () => void;
  } {
    const calls: Array<{ payload: T; timestamp: number }> = [];

    const processor = () => {
      mockProcessor<T>(type, (payload) => {
        calls.push({ payload, timestamp: Date.now() });
      });
    };

    const reset = () => {
      calls.length = 0;
    };

    return { calls, processor, reset };
  }

  /**
   * Create a processor that always fails
   */
  export function failingProcessor(
    type: string,
    errorMessage = "Test error",
    shouldFail?: (payload: Record<string, unknown>) => boolean,
  ): void {
    mockProcessor(type, (payload) => {
      if (!shouldFail || shouldFail(payload)) {
        throw new Error(errorMessage);
      }
    });
  }

  /**
   * Create a processor that delays for testing timing
   */
  export function delayedProcessor<T extends Record<string, unknown>>(
    type: string,
    delay: number,
    actualProcessor?: (payload: T) => Promise<void> | void,
  ): void {
    mockProcessor<T>(type, async (payload) => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (actualProcessor) {
        await actualProcessor(payload);
      }
    });
  }

  /**
   * Reset the test environment
   */
  export async function resetTestEnvironment(): Promise<void> {
    await clearAllJobs();
    clearProcessors();
  }

  /**
   * Create test jobs for testing
   */
  export async function createTestJobs(
    count: number,
    type = "test-job",
  ): Promise<string[]> {
    const { addJobs } = await import("../core/queue");

    const jobs = Array.from({ length: count }, (_, i) => ({
      type,
      payload: { id: i, message: `Test job ${i}` },
    }));

    return await addJobs(jobs);
  }

  /**
   * Create test jobs with different priorities
   */
  export async function createPriorityTestJobs(): Promise<{
    high: string[];
    medium: string[];
    low: string[];
  }> {
    const { addJob } = await import("../core/queue");

    const high = await Promise.all([
      addJob("high-priority", { priority: "high" }, { priority: 10 }),
      addJob("high-priority", { priority: "high" }, { priority: 9 }),
    ]);

    const medium = await Promise.all([
      addJob("medium-priority", { priority: "medium" }, { priority: 5 }),
      addJob("medium-priority", { priority: "medium" }, { priority: 4 }),
    ]);

    const low = await Promise.all([
      addJob("low-priority", { priority: "low" }, { priority: 1 }),
      addJob("low-priority", { priority: "low" }, { priority: 0 }),
    ]);

    return { high, medium, low };
  }

  /**
   * Create delayed test jobs
   */
  export async function createDelayedTestJobs(): Promise<{
    immediate: string[];
    delayed: string[];
  }> {
    const { addJob } = await import("../core/queue");

    const immediate = await Promise.all([
      addJob("immediate", { message: "Process now" }),
      addJob("immediate", { message: "Process now 2" }),
    ]);

    const delayed = await Promise.all([
      addJob("delayed", { message: "Process later" }, { delay: 2 }), // 2 seconds
      addJob("delayed", { message: "Process much later" }, { delay: 5 }), // 5 seconds
    ]);

    return { immediate, delayed };
  }

  /**
   * Assert job status
   */
  export async function assertJobStatus(
    jobId: string,
    expectedStatus: "pending" | "processing" | "completed" | "failed",
  ): Promise<void> {
    const job = await getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    if (job.status !== expectedStatus) {
      throw new Error(
        `Expected job ${jobId} to have status ${expectedStatus}, but got ${job.status}`,
      );
    }
  }

  /**
   * Assert job count by status
   */
  export async function assertJobCount(
    expectedCount: number,
    status?: "pending" | "processing" | "completed" | "failed",
  ): Promise<void> {
    const actualCount = status
      ? await countJobsByStatus(status)
      : await getTotalJobCount();

    if (actualCount !== expectedCount) {
      const statusMsg = status ? ` with status ${status}` : "";
      throw new Error(
        `Expected ${expectedCount} jobs${statusMsg}, but got ${actualCount}`,
      );
    }
  }
}
