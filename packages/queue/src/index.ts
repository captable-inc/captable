// Core queue functionality
export {
  register,
  addJob,
  addJobs,
  processJobs,
  getStats,
  cleanupJobs,
  getRegisteredProcessors,
  clearProcessors,
} from "./core/queue";

// Serverless-compatible functions
export {
  processJobsServerless,
  processSingleBatch,
  healthCheck,
  getQueueStatus,
} from "./core/serverless";
export type {
  ServerlessProcessingResult,
  ServerlessProcessingOptions,
} from "./core/serverless";

// Base job class
export { BaseJob } from "./jobs/base-job";

// Worker functionality
export { QueueWorker, createWorker } from "./worker";
export type { WorkerOptions, WorkerStatus } from "./worker";

// Configuration
export { defaultConfig, createConfig, validateConfig } from "./config";
export type { QueueConfig } from "./config";

// Metrics and monitoring
export {
  MetricsCollector,
  initializeMetrics,
  getMetricsCollector,
} from "./metrics";
export type { QueueMetrics, JobMetric } from "./metrics";

// Error handling
export {
  QueueError,
  RetryableError,
  PermanentError,
  TimeoutError,
  ProcessorNotFoundError,
  InvalidPayloadError,
  ResourceConflictError,
  RateLimitError,
  isQueueError,
  isRetryableError,
  getRetryDelay,
  classifyError,
} from "./errors";

// Testing utilities
export { QueueTestHelper } from "./testing";

// Types
export type {
  JobOptions,
  JobProcessor,
  JobStats,
  BulkJobInput,
  DetailedJobStats,
  JobExecutionContext,
  RetryConfig,
  ProcessingResult,
} from "./types";

// Re-export database types for convenience
export type { JobQueue, NewJobQueue } from "@captable/db/schema";
