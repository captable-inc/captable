export interface JobOptions {
  delay?: number; // seconds
  maxAttempts?: number;
  priority?: number;
  retryDelay?: number; // milliseconds
  timeout?: number; // milliseconds
  storeResult?: boolean; // whether to store job result
  trackProgress?: boolean; // whether to track progress
}

export interface JobProcessor<T = Record<string, unknown>> {
  type: string;
  process: (payload: T) => Promise<void>;
  timeout?: number; // processor-specific timeout
  retryDelay?: number; // processor-specific retry delay
  maxAttempts?: number; // processor-specific max attempts
}

export interface JobStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface BulkJobInput<T = Record<string, unknown>> {
  type: string;
  payload: T;
  options?: JobOptions;
}

export interface DetailedJobStats extends JobStats {
  byType: Record<string, JobStats>;
  byPriority: Record<number, number>;
  retryRate: number;
  errorRate: number;
  averageProcessingTime: number;
  totalProcessed: number;
  queueDepth: number;
}

export interface JobExecutionContext {
  jobId: string;
  type: string;
  attempts: number;
  startTime: number;
  timeout?: number;
  signal?: AbortSignal;
}

export interface RetryConfig {
  type: "exponential" | "linear" | "fixed";
  base: number;
  max: number;
  multiplier: number;
}

export interface ProcessingResult {
  success: boolean;
  duration: number;
  error?: string;
  result?: unknown;
}
