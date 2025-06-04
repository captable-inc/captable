/**
 * Base queue error class
 */
export abstract class QueueError extends Error {
  abstract readonly type: string;
  abstract readonly retryable: boolean;

  constructor(
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Error for jobs that should be retried with custom delay
 */
export class RetryableError extends QueueError {
  readonly type = "retryable";
  readonly retryable = true;

  constructor(
    message: string,
    public readonly retryAfter?: number, // Custom retry delay in milliseconds
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }
}

/**
 * Error for jobs that should not be retried
 */
export class PermanentError extends QueueError {
  readonly type = "permanent";
  readonly retryable = false;
}

/**
 * Error for jobs that failed due to timeout
 */
export class TimeoutError extends QueueError {
  readonly type = "timeout";
  readonly retryable = true;

  constructor(
    public readonly timeout: number,
    message = "Job execution timed out",
    context?: Record<string, unknown>,
  ) {
    super(message, { ...context, timeout });
  }
}

/**
 * Error for jobs that failed due to missing processor
 */
export class ProcessorNotFoundError extends QueueError {
  readonly type = "processor_not_found";
  readonly retryable = false;

  constructor(jobType: string, context?: Record<string, unknown>) {
    super(`No processor registered for job type: ${jobType}`, {
      ...context,
      jobType,
    });
  }
}

/**
 * Error for jobs that failed due to invalid payload
 */
export class InvalidPayloadError extends QueueError {
  readonly type = "invalid_payload";
  readonly retryable = false;

  constructor(
    message: string,
    public readonly validationErrors?: Array<{
      field: string;
      message: string;
    }>,
    context?: Record<string, unknown>,
  ) {
    super(message, { ...context, validationErrors });
  }
}

/**
 * Error for jobs that failed due to resource conflicts
 */
export class ResourceConflictError extends QueueError {
  readonly type = "resource_conflict";
  readonly retryable = true;

  constructor(
    message: string,
    public readonly resource: string,
    context?: Record<string, unknown>,
  ) {
    super(message, { ...context, resource });
  }
}

/**
 * Error for jobs that failed due to rate limiting
 */
export class RateLimitError extends QueueError {
  readonly type = "rate_limit";
  readonly retryable = true;

  constructor(
    message = "Rate limit exceeded",
    public readonly retryAfter = 60000, // Default 1 minute
    context?: Record<string, unknown>,
  ) {
    super(message, { ...context, retryAfter });
  }
}

/**
 * Type guard to check if error is a queue error
 */
export function isQueueError(error: unknown): error is QueueError {
  return error instanceof QueueError;
}

/**
 * Type guard to check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  return isQueueError(error) && error.retryable;
}

/**
 * Extract retry delay from error if available
 */
export function getRetryDelay(error: unknown): number | undefined {
  if (error instanceof RetryableError && error.retryAfter !== undefined) {
    return error.retryAfter;
  }

  if (error instanceof RateLimitError) {
    return error.retryAfter;
  }

  return undefined;
}

/**
 * Classify unknown errors into queue error categories
 */
export function classifyError(error: unknown): QueueError {
  if (isQueueError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  // Classify based on common error patterns
  if (message.includes("timeout") || message.includes("TIMEOUT")) {
    return new TimeoutError(30000, message, { originalStack: stack });
  }

  if (message.includes("rate limit") || message.includes("429")) {
    return new RateLimitError(message, 60000, { originalStack: stack });
  }

  if (message.includes("conflict") || message.includes("409")) {
    return new ResourceConflictError(message, "unknown", {
      originalStack: stack,
    });
  }

  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("Invalid")
  ) {
    return new InvalidPayloadError(message, undefined, {
      originalStack: stack,
    });
  }

  // Default to retryable error for unknown errors
  return new RetryableError(message, undefined, { originalStack: stack });
}
