import { ServerlessQueue } from "./queue";
import type { JobOptions } from "./types";
import { logger } from "@captable/logger";

const log = logger.child({ module: "base-job" });

export abstract class BaseJob<T extends Record<string, unknown>> {
  abstract readonly type: string;
  protected readonly options: JobOptions = {
    maxAttempts: 3,
    retryDelay: 1000,
    priority: 0,
  };

  /**
   * Register this job with the queue
   * Call this method after instantiating the job
   */
  register(): void {
    ServerlessQueue.register({
      type: this.type,
      process: this.work.bind(this),
    });

    log.info(`Registered job: ${this.type}`);
  }

  /**
   * Process the job payload
   */
  abstract work(payload: T): Promise<void>;

  /**
   * Emit a single job
   */
  emit(payload: T, options?: JobOptions): Promise<string> {
    return ServerlessQueue.add(this.type, payload, {
      ...this.options,
      ...options,
    });
  }

  /**
   * Emit multiple jobs in bulk
   */
  bulkEmit(payloads: T[], options?: JobOptions): Promise<string[]> {
    const jobs = payloads.map((payload) => ({
      type: this.type,
      payload,
      options: { ...this.options, ...options },
    }));

    return ServerlessQueue.addBulk(jobs);
  }

  /**
   * Emit a job with delay
   */
  emitDelayed(payload: T, delayInSeconds: number, options?: JobOptions): Promise<string> {
    return this.emit(payload, {
      ...options,
      delay: delayInSeconds,
    });
  }

  /**
   * Emit a high priority job
   */
  emitPriority(payload: T, priority: number, options?: JobOptions): Promise<string> {
    return this.emit(payload, {
      ...options,
      priority,
    });
  }
} 