export interface QueueConfig {
  concurrency: number;
  pollInterval: number;
  maxRetries: number;
  cleanupInterval: number;
  retryBackoff: {
    type: "exponential" | "linear" | "fixed";
    base: number;
    max: number;
    multiplier: number;
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    logLevel: "debug" | "info" | "warn" | "error";
  };
  worker: {
    gracefulShutdownTimeout: number;
    heartbeatInterval: number;
    maxJobExecutionTime: number;
  };
  database: {
    lockTimeout: number;
    batchSize: number;
    maxConnections: number;
  };
}

export const defaultConfig: QueueConfig = {
  concurrency: Number(process.env.QUEUE_CONCURRENCY) || 3,
  pollInterval: Number(process.env.QUEUE_POLL_INTERVAL) || 1000,
  maxRetries: Number(process.env.QUEUE_MAX_RETRIES) || 3,
  cleanupInterval:
    Number(process.env.QUEUE_CLEANUP_INTERVAL) || 24 * 60 * 60 * 1000, // 24 hours
  retryBackoff: {
    type:
      (process.env.QUEUE_RETRY_TYPE as "exponential" | "linear" | "fixed") ||
      "exponential",
    base: Number(process.env.QUEUE_RETRY_BASE) || 1000,
    max: Number(process.env.QUEUE_RETRY_MAX) || 30000,
    multiplier: Number(process.env.QUEUE_RETRY_MULTIPLIER) || 2,
  },
  monitoring: {
    enabled:
      process.env.QUEUE_MONITORING_ENABLED === "true" ||
      process.env.NODE_ENV === "production",
    metricsInterval: Number(process.env.QUEUE_METRICS_INTERVAL) || 60000, // 1 minute
    logLevel:
      (process.env.QUEUE_LOG_LEVEL as "debug" | "info" | "warn" | "error") ||
      "info",
  },
  worker: {
    gracefulShutdownTimeout:
      Number(process.env.QUEUE_SHUTDOWN_TIMEOUT) || 30000, // 30 seconds
    heartbeatInterval: Number(process.env.QUEUE_HEARTBEAT_INTERVAL) || 60000, // 1 minute
    maxJobExecutionTime:
      Number(process.env.QUEUE_MAX_JOB_TIME) || 5 * 60 * 1000, // 5 minutes
  },
  database: {
    lockTimeout: Number(process.env.QUEUE_LOCK_TIMEOUT) || 5000, // 5 seconds
    batchSize: Number(process.env.QUEUE_BATCH_SIZE) || 10,
    maxConnections: Number(process.env.QUEUE_MAX_CONNECTIONS) || 10,
  },
};

/**
 * Create a queue configuration by merging with defaults
 */
export function createConfig(
  overrides: Partial<QueueConfig> = {},
): QueueConfig {
  return {
    ...defaultConfig,
    ...overrides,
    retryBackoff: {
      ...defaultConfig.retryBackoff,
      ...overrides.retryBackoff,
    },
    monitoring: {
      ...defaultConfig.monitoring,
      ...overrides.monitoring,
    },
    worker: {
      ...defaultConfig.worker,
      ...overrides.worker,
    },
    database: {
      ...defaultConfig.database,
      ...overrides.database,
    },
  };
}

/**
 * Validate queue configuration
 */
export function validateConfig(config: QueueConfig): void {
  if (config.concurrency < 1) {
    throw new Error("Concurrency must be at least 1");
  }

  if (config.pollInterval < 100) {
    throw new Error("Poll interval must be at least 100ms");
  }

  if (config.maxRetries < 0) {
    throw new Error("Max retries cannot be negative");
  }

  if (config.retryBackoff.base < 0) {
    throw new Error("Retry backoff base cannot be negative");
  }

  if (config.retryBackoff.max < config.retryBackoff.base) {
    throw new Error("Retry backoff max must be greater than or equal to base");
  }

  if (config.worker.gracefulShutdownTimeout < 1000) {
    throw new Error("Graceful shutdown timeout must be at least 1 second");
  }
}
