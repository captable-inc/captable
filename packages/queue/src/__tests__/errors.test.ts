import { describe, expect, it } from "vitest";
import {
  InvalidPayloadError,
  PermanentError,
  ProcessorNotFoundError,
  QueueError,
  RateLimitError,
  ResourceConflictError,
  RetryableError,
  TimeoutError,
  classifyError,
  getRetryDelay,
  isQueueError,
  isRetryableError,
} from "../errors";

describe("Queue Errors", () => {
  describe("RetryableError", () => {
    it("should create retryable error with default values", () => {
      const error = new RetryableError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.type).toBe("retryable");
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBeUndefined();
      expect(error.context).toBeUndefined();
    });

    it("should create retryable error with custom retry delay", () => {
      const error = new RetryableError("Test error", 5000, { userId: "123" });

      expect(error.retryAfter).toBe(5000);
      expect(error.context).toEqual({ userId: "123" });
    });
  });

  describe("PermanentError", () => {
    it("should create permanent error", () => {
      const error = new PermanentError("Permanent failure");

      expect(error.message).toBe("Permanent failure");
      expect(error.type).toBe("permanent");
      expect(error.retryable).toBe(false);
    });
  });

  describe("TimeoutError", () => {
    it("should create timeout error with default message", () => {
      const error = new TimeoutError(30000);

      expect(error.message).toBe("Job execution timed out");
      expect(error.type).toBe("timeout");
      expect(error.retryable).toBe(true);
      expect(error.timeout).toBe(30000);
    });

    it("should create timeout error with custom message", () => {
      const error = new TimeoutError(30000, "Custom timeout message");

      expect(error.message).toBe("Custom timeout message");
      expect(error.timeout).toBe(30000);
    });
  });

  describe("ProcessorNotFoundError", () => {
    it("should create processor not found error", () => {
      const error = new ProcessorNotFoundError("email-job");

      expect(error.message).toBe(
        "No processor registered for job type: email-job",
      );
      expect(error.type).toBe("processor_not_found");
      expect(error.retryable).toBe(false);
      expect(error.context).toEqual({ jobType: "email-job" });
    });
  });

  describe("InvalidPayloadError", () => {
    it("should create invalid payload error", () => {
      const validationErrors = [
        { field: "email", message: "Invalid email format" },
        { field: "name", message: "Name is required" },
      ];

      const error = new InvalidPayloadError(
        "Validation failed",
        validationErrors,
      );

      expect(error.message).toBe("Validation failed");
      expect(error.type).toBe("invalid_payload");
      expect(error.retryable).toBe(false);
      expect(error.validationErrors).toEqual(validationErrors);
    });
  });

  describe("ResourceConflictError", () => {
    it("should create resource conflict error", () => {
      const error = new ResourceConflictError("Database locked", "database");

      expect(error.message).toBe("Database locked");
      expect(error.type).toBe("resource_conflict");
      expect(error.retryable).toBe(true);
      expect(error.resource).toBe("database");
    });
  });

  describe("RateLimitError", () => {
    it("should create rate limit error with defaults", () => {
      const error = new RateLimitError();

      expect(error.message).toBe("Rate limit exceeded");
      expect(error.type).toBe("rate_limit");
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBe(60000);
    });

    it("should create rate limit error with custom values", () => {
      const error = new RateLimitError("API rate limit exceeded", 120000);

      expect(error.message).toBe("API rate limit exceeded");
      expect(error.retryAfter).toBe(120000);
    });
  });

  describe("isQueueError", () => {
    it("should identify queue errors", () => {
      expect(isQueueError(new RetryableError("test"))).toBe(true);
      expect(isQueueError(new PermanentError("test"))).toBe(true);
      expect(isQueueError(new TimeoutError(30000))).toBe(true);
      expect(isQueueError(new Error("regular error"))).toBe(false);
      expect(isQueueError("string error")).toBe(false);
      expect(isQueueError(null)).toBe(false);
    });
  });

  describe("isRetryableError", () => {
    it("should identify retryable errors", () => {
      expect(isRetryableError(new RetryableError("test"))).toBe(true);
      expect(isRetryableError(new TimeoutError(30000))).toBe(true);
      expect(isRetryableError(new ResourceConflictError("test", "db"))).toBe(
        true,
      );
      expect(isRetryableError(new RateLimitError())).toBe(true);
      expect(isRetryableError(new PermanentError("test"))).toBe(false);
      expect(isRetryableError(new ProcessorNotFoundError("test"))).toBe(false);
      expect(isRetryableError(new Error("regular error"))).toBe(false);
    });
  });

  describe("getRetryDelay", () => {
    it("should extract retry delay from retryable errors", () => {
      expect(getRetryDelay(new RetryableError("test", 5000))).toBe(5000);
      expect(getRetryDelay(new RateLimitError("test", 120000))).toBe(120000);
      expect(getRetryDelay(new RetryableError("test"))).toBeUndefined();
      expect(getRetryDelay(new PermanentError("test"))).toBeUndefined();
      expect(getRetryDelay(new Error("regular error"))).toBeUndefined();
    });
  });

  describe("classifyError", () => {
    it("should return queue errors as-is", () => {
      const queueError = new RetryableError("test");
      expect(classifyError(queueError)).toBe(queueError);
    });

    it("should classify timeout errors", () => {
      const error = new Error("Connection timeout occurred");
      const classified = classifyError(error);

      expect(classified).toBeInstanceOf(TimeoutError);
      expect(classified.message).toBe("Connection timeout occurred");
    });

    it("should classify rate limit errors", () => {
      const error = new Error("Rate limit exceeded - 429");
      const classified = classifyError(error);

      expect(classified).toBeInstanceOf(RateLimitError);
      expect(classified.message).toBe("Rate limit exceeded - 429");
    });

    it("should classify conflict errors", () => {
      const error = new Error("Resource conflict - 409");
      const classified = classifyError(error);

      expect(classified).toBeInstanceOf(ResourceConflictError);
      expect(classified.message).toBe("Resource conflict - 409");
    });

    it("should classify validation errors", () => {
      const error = new Error("Invalid input data");
      const classified = classifyError(error);

      expect(classified).toBeInstanceOf(InvalidPayloadError);
      expect(classified.message).toBe("Invalid input data");
    });

    it("should default to retryable error for unknown errors", () => {
      const error = new Error("Unknown error");
      const classified = classifyError(error);

      expect(classified).toBeInstanceOf(RetryableError);
      expect(classified.message).toBe("Unknown error");
    });

    it("should handle non-Error objects", () => {
      const classified = classifyError("String error");

      expect(classified).toBeInstanceOf(RetryableError);
      expect(classified.message).toBe("String error");
    });
  });
});
