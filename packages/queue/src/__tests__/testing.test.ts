import { beforeEach, describe, expect, it } from "vitest";
import { QueueTestHelper } from "../testing";

describe("QueueTestHelper", () => {
  beforeEach(() => {
    // Setup for each test
  });

  describe("helper utilities", () => {
    it("should create tracking processor", () => {
      const tracker = QueueTestHelper.trackingProcessor("test-job");

      expect(tracker.calls).toEqual([]);
      expect(typeof tracker.processor).toBe("function");
      expect(typeof tracker.reset).toBe("function");

      // Test reset functionality
      tracker.calls.push({ payload: { test: true }, timestamp: Date.now() });
      tracker.reset();
      expect(tracker.calls).toHaveLength(0);
    });

    it("should setup tracking processor", () => {
      const tracker = QueueTestHelper.trackingProcessor("test-job");

      // The processor function is a setup function that registers the tracker
      tracker.processor();

      // Verify the processor was set up
      expect(tracker.calls).toEqual([]);
    });

    it("should reset tracking processor calls", () => {
      const tracker = QueueTestHelper.trackingProcessor("test-job");

      // Add some mock data to calls
      tracker.calls.push({ payload: { test: "data" }, timestamp: Date.now() });
      expect(tracker.calls).toHaveLength(1);

      tracker.reset();
      expect(tracker.calls).toHaveLength(0);

      // Add more data after reset
      tracker.calls.push({ payload: { test: "data2" }, timestamp: Date.now() });
      expect(tracker.calls).toHaveLength(1);
      expect(tracker.calls[0].payload).toEqual({ test: "data2" });
    });
  });

  describe("test environment", () => {
    it("should provide test environment utilities", () => {
      // Test that the QueueTestHelper module exports the expected functions
      expect(typeof QueueTestHelper.clearAllJobs).toBe("function");
      expect(typeof QueueTestHelper.clearCompletedJobs).toBe("function");
      expect(typeof QueueTestHelper.clearFailedJobs).toBe("function");
      expect(typeof QueueTestHelper.clearProcessors).toBe("function");
      expect(typeof QueueTestHelper.resetTestEnvironment).toBe("function");
    });

    it("should provide job creation utilities", () => {
      expect(typeof QueueTestHelper.createTestJobs).toBe("function");
      expect(typeof QueueTestHelper.createPriorityTestJobs).toBe("function");
      expect(typeof QueueTestHelper.createDelayedTestJobs).toBe("function");
    });

    it("should provide assertion utilities", () => {
      expect(typeof QueueTestHelper.assertJobStatus).toBe("function");
      expect(typeof QueueTestHelper.assertJobCount).toBe("function");
    });

    it("should provide processor mocking utilities", () => {
      expect(typeof QueueTestHelper.mockProcessor).toBe("function");
      expect(typeof QueueTestHelper.trackingProcessor).toBe("function");
      expect(typeof QueueTestHelper.failingProcessor).toBe("function");
      expect(typeof QueueTestHelper.delayedProcessor).toBe("function");
    });
  });
});
