export interface JobOptions {
  delay?: number; // seconds
  maxAttempts?: number;
  priority?: number;
  retryDelay?: number; // milliseconds
}

export interface JobProcessor<T = Record<string, unknown>> {
  type: string;
  process: (payload: T) => Promise<void>;
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
