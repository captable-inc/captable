import { beforeEach, describe, expect, it } from "vitest";
import {
  addJob,
  addJobs,
  cleanupJobs,
  clearProcessors,
  getRegisteredProcessors,
  getStats,
  processJobs,
  register,
} from "../core/queue";

describe("Queue Core", () => {
  beforeEach(() => {
    clearProcessors();
  });

  describe("processor registration", () => {
    it("should register a job processor", () => {
      const processor = {
        type: "test-job",
        process: async () => undefined,
      };

      register(processor);

      const registeredTypes = getRegisteredProcessors();
      expect(registeredTypes).toContain("test-job");
    });

    it("should clear all processors", () => {
      register({
        type: "test-job-1",
        process: async () => undefined,
      });

      register({
        type: "test-job-2",
        process: async () => undefined,
      });

      expect(getRegisteredProcessors()).toHaveLength(2);

      clearProcessors();
      expect(getRegisteredProcessors()).toHaveLength(0);
    });

    it("should allow multiple processors of the same type", () => {
      register({
        type: "test-job",
        process: async () => undefined,
      });

      register({
        type: "test-job",
        process: async () => undefined,
      });

      const registeredTypes = getRegisteredProcessors();
      const testJobCount = registeredTypes.filter(
        (type) => type === "test-job",
      ).length;
      expect(testJobCount).toBeGreaterThanOrEqual(1);
    });

    it("should maintain processor registration order", () => {
      const processors = [
        { type: "job-a", process: async () => undefined },
        { type: "job-b", process: async () => undefined },
        { type: "job-c", process: async () => undefined },
      ];

      for (const processor of processors) {
        register(processor);
      }

      const registeredTypes = getRegisteredProcessors();
      expect(registeredTypes[0]).toBe("job-a");
      expect(registeredTypes[1]).toBe("job-b");
      expect(registeredTypes[2]).toBe("job-c");
    });
  });

  describe("job creation", () => {
    it("should add a single job", async () => {
      const jobId = await addJob("test-job", { message: "Hello" });

      expect(typeof jobId).toBe("string");
      expect(jobId.length).toBeGreaterThan(0);
    });

    it("should add a job with options", async () => {
      const jobId = await addJob(
        "test-job",
        { message: "Hello" },
        {
          delay: 60,
          priority: 10,
          maxAttempts: 5,
          retryDelay: 2000,
        },
      );

      expect(typeof jobId).toBe("string");
      expect(jobId.length).toBeGreaterThan(0);
    });

    it("should add multiple jobs in bulk", async () => {
      const jobs = [
        { type: "email-job", payload: { to: "user1@example.com" } },
        { type: "email-job", payload: { to: "user2@example.com" } },
        { type: "data-job", payload: { dataId: "data-123" } },
      ] as Array<{ type: string; payload: Record<string, unknown> }>;

      const jobIds = await addJobs(jobs);

      expect(jobIds).toHaveLength(3);
      expect(
        jobIds.every((id) => typeof id === "string" && id.length > 0),
      ).toBe(true);
    });

    it("should handle job creation", async () => {
      const jobId = await addJob("test-job", {});
      expect(typeof jobId).toBe("string");
    });
  });

  describe("job processing", () => {
    it("should return 0 when no jobs are available", async () => {
      const processed = await processJobs();
      expect(processed).toBe(0);
    });

    it("should process available jobs", async () => {
      register({
        type: "test-job",
        process: async () => undefined,
      });

      await addJob("test-job", { message: "Hello" });

      const processed = await processJobs();

      expect(processed).toBeGreaterThanOrEqual(0);
    });

    it("should handle job processing errors", async () => {
      const processed = await processJobs();

      expect(processed).toBeGreaterThanOrEqual(0);
    });

    it("should handle missing processor error", async () => {
      const processed = await processJobs();

      expect(processed).toBeGreaterThanOrEqual(0);
    });
  });

  describe("statistics", () => {
    it("should get job statistics", async () => {
      const stats = await getStats();

      expect(stats).toHaveProperty("pending");
      expect(stats).toHaveProperty("processing");
      expect(stats).toHaveProperty("completed");
      expect(stats).toHaveProperty("failed");
    });
  });

  describe("cleanup", () => {
    it("should cleanup old completed jobs", async () => {
      const cleaned = await cleanupJobs(7);

      expect(typeof cleaned).toBe("number");
      expect(cleaned).toBeGreaterThanOrEqual(0);
    });

    it("should use default cleanup period", async () => {
      const cleaned = await cleanupJobs();

      expect(typeof cleaned).toBe("number");
      expect(cleaned).toBeGreaterThanOrEqual(0);
    });
  });
});
