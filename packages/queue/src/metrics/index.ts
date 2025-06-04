import { logger } from "@captable/logger";
import type { QueueConfig } from "../config";

const log = logger.child({ module: "queue-metrics" });

export interface QueueMetrics {
  // Job processing metrics
  jobsProcessed: number;
  jobsFailed: number;
  jobsRetried: number;
  jobsTimedOut: number;

  // Performance metrics
  averageProcessingTime: number;
  medianProcessingTime: number;
  maxProcessingTime: number;
  minProcessingTime: number;

  // Queue health metrics
  queueDepth: number;
  processingRate: number; // jobs per minute
  errorRate: number; // percentage
  retryRate: number; // percentage

  // Resource metrics
  activeWorkers: number;
  memoryUsage: number;
  cpuUsage?: number;

  // Time-based metrics
  lastProcessedAt?: Date;
  uptimeSeconds: number;

  // Error breakdown by type
  errorsByType: Record<string, number>;
  processingTimesByJobType: Record<string, number[]>;
}

export interface JobMetric {
  jobId: string;
  type: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "processing" | "completed" | "failed";
  error?: string;
  attempts: number;
}

/**
 * Metrics collector for queue monitoring
 */
export class MetricsCollector {
  private metrics: QueueMetrics;
  private jobMetrics = new Map<string, JobMetric>();
  private processingTimes: number[] = [];
  private startTime: number;
  private lastCleanup = Date.now();

  constructor(private config: QueueConfig) {
    this.startTime = Date.now();
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): QueueMetrics {
    return {
      jobsProcessed: 0,
      jobsFailed: 0,
      jobsRetried: 0,
      jobsTimedOut: 0,
      averageProcessingTime: 0,
      medianProcessingTime: 0,
      maxProcessingTime: 0,
      minProcessingTime: 0,
      queueDepth: 0,
      processingRate: 0,
      errorRate: 0,
      retryRate: 0,
      activeWorkers: 0,
      memoryUsage: 0,
      uptimeSeconds: 0,
      errorsByType: {},
      processingTimesByJobType: {},
    };
  }

  /**
   * Record the start of job processing
   */
  recordJobStart(jobId: string, type: string, attempts: number): void {
    const metric: JobMetric = {
      jobId,
      type,
      startTime: Date.now(),
      status: "processing",
      attempts,
    };

    this.jobMetrics.set(jobId, metric);
    this.metrics.activeWorkers++;

    if (this.config.monitoring.logLevel === "debug") {
      log.debug({ jobId, type, attempts }, "Job processing started");
    }
  }

  /**
   * Record successful job completion
   */
  recordJobCompletion(jobId: string): void {
    const metric = this.jobMetrics.get(jobId);
    if (!metric) return;

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;
    metric.status = "completed";

    this.updateProcessingTimeMetrics(duration, metric.type);
    this.metrics.jobsProcessed++;
    this.metrics.activeWorkers = Math.max(0, this.metrics.activeWorkers - 1);
    this.metrics.lastProcessedAt = new Date();

    log.info(
      {
        jobId,
        type: metric.type,
        duration,
        attempts: metric.attempts,
      },
      "Job completed successfully",
    );

    // Clean up old metrics periodically
    this.cleanupOldMetrics();
  }

  /**
   * Record job failure
   */
  recordJobFailure(jobId: string, error: string, errorType?: string): void {
    const metric = this.jobMetrics.get(jobId);
    if (!metric) return;

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;
    metric.status = "failed";
    metric.error = error;

    this.metrics.jobsFailed++;
    this.metrics.activeWorkers = Math.max(0, this.metrics.activeWorkers - 1);

    if (errorType) {
      this.metrics.errorsByType[errorType] =
        (this.metrics.errorsByType[errorType] || 0) + 1;
    }

    log.error(
      {
        jobId,
        type: metric.type,
        duration,
        error,
        errorType,
        attempts: metric.attempts,
      },
      "Job failed",
    );

    this.cleanupOldMetrics();
  }

  /**
   * Record job retry
   */
  recordJobRetry(jobId: string): void {
    this.metrics.jobsRetried++;

    const metric = this.jobMetrics.get(jobId);
    if (metric) {
      log.warn(
        {
          jobId,
          type: metric.type,
          attempts: metric.attempts,
        },
        "Job retried",
      );
    }
  }

  /**
   * Record job timeout
   */
  recordJobTimeout(jobId: string): void {
    this.metrics.jobsTimedOut++;
    this.recordJobFailure(jobId, "Job execution timed out", "timeout");
  }

  /**
   * Update queue depth metric
   */
  updateQueueDepth(depth: number): void {
    this.metrics.queueDepth = depth;
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): QueueMetrics {
    this.updateCalculatedMetrics();
    return { ...this.metrics };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = this.initializeMetrics();
    this.jobMetrics.clear();
    this.processingTimes = [];
    this.startTime = Date.now();
    log.info("Metrics reset");
  }

  /**
   * Get metrics for specific job type
   */
  getJobTypeMetrics(jobType: string): {
    count: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
  } {
    const times = this.metrics.processingTimesByJobType[jobType] || [];

    if (times.length === 0) {
      return { count: 0, averageTime: 0, minTime: 0, maxTime: 0 };
    }

    return {
      count: times.length,
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
    };
  }

  /**
   * Get currently processing jobs
   */
  getProcessingJobs(): JobMetric[] {
    return Array.from(this.jobMetrics.values()).filter(
      (metric) => metric.status === "processing",
    );
  }

  private updateProcessingTimeMetrics(duration: number, jobType: string): void {
    this.processingTimes.push(duration);

    // Keep only last 1000 processing times for memory efficiency
    if (this.processingTimes.length > 1000) {
      this.processingTimes = this.processingTimes.slice(-1000);
    }

    // Update job type specific metrics
    if (!this.metrics.processingTimesByJobType[jobType]) {
      this.metrics.processingTimesByJobType[jobType] = [];
    }
    this.metrics.processingTimesByJobType[jobType].push(duration);

    // Keep only last 100 times per job type
    if (this.metrics.processingTimesByJobType[jobType].length > 100) {
      this.metrics.processingTimesByJobType[jobType] =
        this.metrics.processingTimesByJobType[jobType].slice(-100);
    }
  }

  private updateCalculatedMetrics(): void {
    // Update uptime
    this.metrics.uptimeSeconds = Math.floor(
      (Date.now() - this.startTime) / 1000,
    );

    // Update memory usage
    if (typeof process !== "undefined" && process.memoryUsage) {
      this.metrics.memoryUsage = process.memoryUsage().heapUsed;
    }

    // Update processing time metrics
    if (this.processingTimes.length > 0) {
      const sortedTimes = [...this.processingTimes].sort((a, b) => a - b);

      this.metrics.averageProcessingTime =
        this.processingTimes.reduce((sum, time) => sum + time, 0) /
        this.processingTimes.length;

      this.metrics.medianProcessingTime =
        sortedTimes[Math.floor(sortedTimes.length / 2)];

      this.metrics.maxProcessingTime = Math.max(...this.processingTimes);
      this.metrics.minProcessingTime = Math.min(...this.processingTimes);
    }

    // Calculate rates
    const totalJobs = this.metrics.jobsProcessed + this.metrics.jobsFailed;
    if (totalJobs > 0) {
      this.metrics.errorRate = (this.metrics.jobsFailed / totalJobs) * 100;
      this.metrics.retryRate = (this.metrics.jobsRetried / totalJobs) * 100;

      // Calculate processing rate (jobs per minute)
      const uptimeMinutes = this.metrics.uptimeSeconds / 60;
      if (uptimeMinutes > 0) {
        this.metrics.processingRate = totalJobs / uptimeMinutes;
      }
    }
  }

  private cleanupOldMetrics(): void {
    const now = Date.now();

    // Cleanup every 5 minutes
    if (now - this.lastCleanup < 5 * 60 * 1000) {
      return;
    }

    this.lastCleanup = now;

    // Remove job metrics older than 1 hour
    const oneHourAgo = now - 60 * 60 * 1000;

    for (const [jobId, metric] of this.jobMetrics.entries()) {
      if (metric.endTime && metric.endTime < oneHourAgo) {
        this.jobMetrics.delete(jobId);
      }
    }

    log.debug(
      {
        activeMetrics: this.jobMetrics.size,
        processingTimesCount: this.processingTimes.length,
      },
      "Cleaned up old metrics",
    );
  }
}

/**
 * Global metrics collector instance
 */
let globalMetricsCollector: MetricsCollector | null = null;

/**
 * Initialize metrics collector
 */
export function initializeMetrics(config: QueueConfig): MetricsCollector {
  globalMetricsCollector = new MetricsCollector(config);
  return globalMetricsCollector;
}

/**
 * Get global metrics collector
 */
export function getMetricsCollector(): MetricsCollector | null {
  return globalMetricsCollector;
}
