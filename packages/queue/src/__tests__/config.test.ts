import { beforeEach, describe, expect, it, vi } from "vitest";
import { createConfig, defaultConfig, validateConfig } from "../config";

describe("Queue Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
    process.env.QUEUE_CONCURRENCY = undefined;
    process.env.QUEUE_POLL_INTERVAL = undefined;
    process.env.QUEUE_MAX_RETRIES = undefined;
  });

  describe("defaultConfig", () => {
    it("should have sensible defaults", () => {
      expect(defaultConfig.concurrency).toBe(3);
      expect(defaultConfig.pollInterval).toBe(1000);
      expect(defaultConfig.maxRetries).toBe(3);
      expect(defaultConfig.retryBackoff.type).toBe("exponential");
      expect(defaultConfig.retryBackoff.base).toBe(1000);
      expect(defaultConfig.retryBackoff.max).toBe(30000);
      expect(defaultConfig.retryBackoff.multiplier).toBe(2);
    });
  });

  describe("createConfig", () => {
    it("should merge with defaults", () => {
      const config = createConfig({
        concurrency: 5,
        retryBackoff: {
          type: "linear",
          base: 2000,
          max: 60000,
          multiplier: 1.5,
        },
      });

      expect(config.concurrency).toBe(5);
      expect(config.pollInterval).toBe(defaultConfig.pollInterval);
      expect(config.retryBackoff.type).toBe("linear");
      expect(config.retryBackoff.base).toBe(2000);
      expect(config.retryBackoff.max).toBe(60000);
      expect(config.retryBackoff.multiplier).toBe(1.5);
    });

    it("should deep merge nested objects", () => {
      const config = createConfig({
        monitoring: {
          enabled: false,
          metricsInterval: 30000,
          logLevel: "warn",
        },
      });

      expect(config.monitoring.enabled).toBe(false);
      expect(config.monitoring.metricsInterval).toBe(30000);
      expect(config.monitoring.logLevel).toBe("warn");
    });
  });

  describe("validateConfig", () => {
    it("should pass valid config", () => {
      expect(() => validateConfig(defaultConfig)).not.toThrow();
    });

    it("should reject invalid concurrency", () => {
      const config = createConfig({ concurrency: 0 });
      expect(() => validateConfig(config)).toThrow(
        "Concurrency must be at least 1",
      );
    });

    it("should reject invalid poll interval", () => {
      const config = createConfig({ pollInterval: 50 });
      expect(() => validateConfig(config)).toThrow(
        "Poll interval must be at least 100ms",
      );
    });

    it("should reject negative max retries", () => {
      const config = createConfig({ maxRetries: -1 });
      expect(() => validateConfig(config)).toThrow(
        "Max retries cannot be negative",
      );
    });

    it("should reject negative retry backoff base", () => {
      const config = createConfig({
        retryBackoff: {
          type: "exponential",
          base: -1,
          max: 30000,
          multiplier: 2,
        },
      });
      expect(() => validateConfig(config)).toThrow(
        "Retry backoff base cannot be negative",
      );
    });

    it("should reject invalid retry backoff max", () => {
      const config = createConfig({
        retryBackoff: {
          type: "exponential",
          base: 5000,
          max: 1000,
          multiplier: 2,
        },
      });
      expect(() => validateConfig(config)).toThrow(
        "Retry backoff max must be greater than or equal to base",
      );
    });

    it("should reject invalid graceful shutdown timeout", () => {
      const config = createConfig({
        worker: {
          gracefulShutdownTimeout: 500,
          heartbeatInterval: 60000,
          maxJobExecutionTime: 300000,
        },
      });
      expect(() => validateConfig(config)).toThrow(
        "Graceful shutdown timeout must be at least 1 second",
      );
    });
  });
});
