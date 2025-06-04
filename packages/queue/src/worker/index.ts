import { logger } from "@captable/logger";
import type { QueueConfig } from "../config";
import { processJobs } from "../core/queue";
import {
  type MetricsCollector,
  getMetricsCollector,
  initializeMetrics,
} from "../metrics";

const log = logger.child({ module: "queue-worker" });

export interface WorkerOptions {
  config: QueueConfig;
  autoStart?: boolean;
  instanceId?: string;
}

export interface WorkerStatus {
  status: "idle" | "running" | "stopping" | "stopped" | "error";
  instanceId: string;
  startedAt?: Date;
  stoppedAt?: Date;
  lastProcessedAt?: Date;
  processedJobs: number;
  errorCount: number;
  isHealthy: boolean;
}

/**
 * Queue worker class for processing jobs with advanced features
 */
export class QueueWorker {
  private config: QueueConfig;
  private isRunning = false;
  private isStopping = false;
  private abortController = new AbortController();
  private metricsCollector: MetricsCollector;
  private instanceId: string;
  private startedAt?: Date;
  private stoppedAt?: Date;
  private lastProcessedAt?: Date;
  private processedJobs = 0;
  private errorCount = 0;
  private consecutiveErrors = 0;
  private maxConsecutiveErrors = 5;
  private lastHeartbeat = Date.now();
  private heartbeatInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(options: WorkerOptions) {
    this.config = options.config;
    this.instanceId =
      options.instanceId ||
      `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.metricsCollector =
      getMetricsCollector() || initializeMetrics(this.config);

    if (options.autoStart) {
      this.start().catch((error) => {
        log.error(
          { error, instanceId: this.instanceId },
          "Failed to auto-start worker",
        );
      });
    }
  }

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      log.warn({ instanceId: this.instanceId }, "Worker is already running");
      return;
    }

    this.isRunning = true;
    this.isStopping = false;
    this.startedAt = new Date();
    this.stoppedAt = undefined;
    this.abortController = new AbortController();
    this.consecutiveErrors = 0;
    this.errorCount = 0;
    this.processedJobs = 0;

    log.info(
      {
        instanceId: this.instanceId,
        config: {
          concurrency: this.config.concurrency,
          pollInterval: this.config.pollInterval,
          maxRetries: this.config.maxRetries,
        },
      },
      "Queue worker starting...",
    );

    // Setup graceful shutdown handlers
    this.setupShutdownHandlers();

    // Start monitoring intervals
    this.startMonitoring();

    // Start the main processing loop
    this.processLoop().catch((error) => {
      log.error({ error, instanceId: this.instanceId }, "Worker loop failed");
      this.handleFatalError(error);
    });
  }

  /**
   * Stop the worker gracefully
   */
  async stop(
    timeout = this.config.worker.gracefulShutdownTimeout,
  ): Promise<void> {
    if (!this.isRunning || this.isStopping) {
      return;
    }

    this.isStopping = true;
    log.info(
      { instanceId: this.instanceId, timeout },
      "Graceful shutdown initiated...",
    );

    // Stop accepting new jobs
    this.abortController.abort();

    // Clear intervals
    this.stopMonitoring();

    // Wait for current jobs to complete or timeout
    const shutdownPromise = this.waitForJobsToComplete();
    const timeoutPromise = new Promise<void>((resolve) =>
      setTimeout(resolve, timeout),
    );

    try {
      await Promise.race([shutdownPromise, timeoutPromise]);
    } catch (error) {
      log.error(
        { error, instanceId: this.instanceId },
        "Error during graceful shutdown",
      );
    }

    this.isRunning = false;
    this.stoppedAt = new Date();

    log.info(
      {
        instanceId: this.instanceId,
        processedJobs: this.processedJobs,
        errorCount: this.errorCount,
        uptime: this.getUptimeSeconds(),
      },
      "Queue worker stopped",
    );
  }

  /**
   * Force stop the worker immediately
   */
  forceStop(): void {
    this.isRunning = false;
    this.isStopping = true;
    this.stoppedAt = new Date();
    this.abortController.abort();
    this.stopMonitoring();

    log.warn({ instanceId: this.instanceId }, "Worker force stopped");
  }

  /**
   * Get worker status
   */
  getStatus(): WorkerStatus {
    return {
      status: this.getWorkerStatus(),
      instanceId: this.instanceId,
      startedAt: this.startedAt,
      stoppedAt: this.stoppedAt,
      lastProcessedAt: this.lastProcessedAt,
      processedJobs: this.processedJobs,
      errorCount: this.errorCount,
      isHealthy: this.isHealthy(),
    };
  }

  /**
   * Check if worker is healthy
   */
  isHealthy(): boolean {
    if (!this.isRunning) return false;

    // Check if we have too many consecutive errors
    if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
      return false;
    }

    // Check if heartbeat is recent (within 2x heartbeat interval)
    const heartbeatThreshold = this.config.worker.heartbeatInterval * 2;
    if (Date.now() - this.lastHeartbeat > heartbeatThreshold) {
      return false;
    }

    return true;
  }

  /**
   * Get worker uptime in seconds
   */
  getUptimeSeconds(): number {
    if (!this.startedAt) return 0;
    const endTime = this.stoppedAt || new Date();
    return Math.floor((endTime.getTime() - this.startedAt.getTime()) / 1000);
  }

  private async processLoop(): Promise<void> {
    while (this.isRunning && !this.abortController.signal.aborted) {
      try {
        const processed = await processJobs(this.config.database.batchSize);

        if (processed > 0) {
          this.processedJobs += processed;
          this.lastProcessedAt = new Date();
          this.consecutiveErrors = 0; // Reset error count on success

          // Process immediately if we processed jobs (there might be more)
          continue;
        }

        // No jobs processed, wait before next poll
        await this.sleep(this.config.pollInterval);
      } catch (error) {
        this.errorCount++;
        this.consecutiveErrors++;

        log.error(
          {
            error,
            instanceId: this.instanceId,
            consecutiveErrors: this.consecutiveErrors,
            errorCount: this.errorCount,
          },
          "Worker processing error",
        );

        // Check if we should stop due to too many consecutive errors
        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
          log.error(
            {
              instanceId: this.instanceId,
              consecutiveErrors: this.consecutiveErrors,
            },
            "Too many consecutive errors, stopping worker",
          );

          await this.stop();
          break;
        }

        // Back off on error
        await this.sleep(Math.min(5000 * this.consecutiveErrors, 30000));
      }
    }
  }

  private setupShutdownHandlers(): void {
    const handleShutdown = (signal: string) => {
      log.info(
        { signal, instanceId: this.instanceId },
        "Received shutdown signal",
      );
      this.stop().catch((error) => {
        log.error(
          { error, signal, instanceId: this.instanceId },
          "Error during shutdown",
        );
        process.exit(1);
      });
    };

    process.once("SIGTERM", () => handleShutdown("SIGTERM"));
    process.once("SIGINT", () => handleShutdown("SIGINT"));
    process.once("SIGUSR2", () => handleShutdown("SIGUSR2")); // For nodemon
  }

  private startMonitoring(): void {
    // Heartbeat monitoring
    this.heartbeatInterval = setInterval(() => {
      this.lastHeartbeat = Date.now();

      if (
        this.config.monitoring.logLevel === "debug" ||
        this.processedJobs === 0
      ) {
        const metrics = this.metricsCollector.getMetrics();
        log.info(
          {
            instanceId: this.instanceId,
            status: this.getWorkerStatus(),
            uptime: this.getUptimeSeconds(),
            processedJobs: this.processedJobs,
            queueDepth: metrics.queueDepth,
            activeWorkers: metrics.activeWorkers,
            memoryUsage: Math.round(metrics.memoryUsage / 1024 / 1024), // MB
          },
          "Worker heartbeat",
        );
      }
    }, this.config.worker.heartbeatInterval);

    // Metrics collection
    if (this.config.monitoring.enabled) {
      this.metricsInterval = setInterval(() => {
        const metrics = this.metricsCollector.getMetrics();
        log.info(
          {
            instanceId: this.instanceId,
            metrics: {
              queueDepth: metrics.queueDepth,
              processingRate: Math.round(metrics.processingRate * 100) / 100,
              errorRate: Math.round(metrics.errorRate * 100) / 100,
              averageProcessingTime: Math.round(metrics.averageProcessingTime),
              activeWorkers: metrics.activeWorkers,
            },
          },
          "Queue metrics",
        );
      }, this.config.monitoring.metricsInterval);
    }

    // Periodic cleanup (if enabled)
    if (this.config.cleanupInterval > 0) {
      this.cleanupInterval = setInterval(async () => {
        try {
          const { cleanupJobs } = await import("../core/queue");
          const cleaned = await cleanupJobs(7); // 7 days
          if (cleaned > 0) {
            log.info(
              { instanceId: this.instanceId, cleaned },
              "Cleaned up old jobs",
            );
          }
        } catch (error) {
          log.error(
            { error, instanceId: this.instanceId },
            "Failed to cleanup jobs",
          );
        }
      }, this.config.cleanupInterval);
    }
  }

  private stopMonitoring(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  private async waitForJobsToComplete(): Promise<void> {
    const processingJobs = this.metricsCollector.getProcessingJobs();

    if (processingJobs.length === 0) {
      return;
    }

    log.info(
      {
        instanceId: this.instanceId,
        processingJobs: processingJobs.length,
      },
      "Waiting for jobs to complete...",
    );

    // Poll for job completion
    while (processingJobs.length > 0 && !this.abortController.signal.aborted) {
      await this.sleep(1000);

      const currentProcessing = this.metricsCollector.getProcessingJobs();
      if (currentProcessing.length === 0) {
        break;
      }
    }
  }

  private getWorkerStatus(): WorkerStatus["status"] {
    if (this.isStopping) return "stopping";
    if (!this.isRunning) return "stopped";
    if (!this.isHealthy()) return "error";
    if (this.processedJobs === 0 && this.getUptimeSeconds() > 10) return "idle";
    return "running";
  }

  private handleFatalError(error: unknown): void {
    log.error(
      {
        error,
        instanceId: this.instanceId,
        processedJobs: this.processedJobs,
        errorCount: this.errorCount,
      },
      "Fatal worker error",
    );

    this.forceStop();
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(resolve, ms);

      // Allow interruption via abort signal
      this.abortController.signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timeout);
          resolve();
        },
        { once: true },
      );
    });
  }
}

/**
 * Create and start a queue worker with default configuration
 */
export async function createWorker(
  config: QueueConfig,
  options: Omit<WorkerOptions, "config"> = {},
): Promise<QueueWorker> {
  const worker = new QueueWorker({ ...options, config });

  if (options.autoStart !== false) {
    await worker.start();
  }

  return worker;
}
