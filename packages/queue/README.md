# @captable/queue

A robust, production-ready job queue system built with TypeScript, featuring advanced error handling, metrics collection, worker management, and comprehensive testing utilities.

## 🚀 Features

### Core Functionality
- **Type-safe job processing** with TypeScript support
- **Bulk job operations** for efficient batch processing
- **Priority-based job scheduling** with configurable delays
- **Automatic retry logic** with exponential, linear, or fixed backoff strategies
- **Job cleanup** for maintaining database hygiene

### Advanced Error Handling
- **Custom error types** for different failure scenarios
- **Intelligent error classification** with automatic retry decisions
- **Timeout handling** with configurable limits
- **Rate limiting** support with automatic backoff
- **Validation error** handling for malformed payloads

### Monitoring & Metrics
- **Real-time metrics collection** for job processing statistics
- **Performance tracking** with processing time analytics
- **Error rate monitoring** with categorized error types
- **Queue depth monitoring** for capacity planning
- **Health checks** for worker status monitoring

### Worker Management
- **Concurrent job processing** with configurable worker pools
- **Graceful shutdown** with job completion waiting
- **Health monitoring** with automatic recovery
- **Resource usage tracking** for performance optimization
- **Signal handling** for clean process termination

### Testing Utilities
- **Mock processors** for unit testing
- **Job tracking** for test assertions
- **Queue state management** for test isolation
- **Async job waiting** utilities for integration tests
- **Test data generation** for load testing

## 🚀 Deployment Patterns

The queue system supports both **long-running processes** and **serverless** deployments:

### Long-Running Workers (Traditional)

Perfect for dedicated servers, containers, and traditional hosting:

```typescript
import { createWorker } from "@captable/queue";

// Continuous worker with persistent polling
const worker = await createWorker(config, {
  autoStart: true,
  instanceId: "worker-1"
});

// Full lifecycle management
await worker.start();
await worker.stop(30000); // Graceful shutdown
```

**Best for:** Dedicated servers, Docker containers, Fly.io workers, high-throughput scenarios

### Serverless Processing (Cron/Event-Driven)

Perfect for Vercel, Netlify, Cloudflare Workers, Fly.io HTTP handlers, and cron jobs:

```typescript
import { processJobsServerless } from "@captable/queue";

// Single execution with timeout protection
const result = await processJobsServerless({
  maxJobs: 200,
  maxBatches: 10,
  batchSize: 20,
  timeout: 25000, // See provider-specific limits below
});

console.log(`Processed ${result.processed} jobs in ${result.duration}ms`);
```

**Best for:** Vercel/Netlify deployments, cost optimization, cron-triggered processing

### Serverless Provider Configurations

Different serverless providers have varying timeout limits. Configure accordingly:

#### Vercel
```typescript
const result = await processJobsServerless({
  timeout: 25000,    // 25s max for cron jobs (15s for Hobby, 5min for Pro+ API routes)
  maxBatches: 10,
  batchSize: 20,
});
```

#### Cloudflare Workers
```typescript
const result = await processJobsServerless({
  timeout: 30000,    // 30s max CPU time for Workers
  maxBatches: 15,
  batchSize: 25,
});
```

#### Netlify Functions
```typescript
const result = await processJobsServerless({
  timeout: 10000,    // 10s max for Functions, 15min for Background Functions
  maxBatches: 5,
  batchSize: 15,
});
```

#### AWS Lambda (via SST/Serverless)
```typescript
const result = await processJobsServerless({
  timeout: 900000,   // 15min max (varies by tier)
  maxBatches: 50,
  batchSize: 50,
});
```

#### Fly.io
```typescript
// For HTTP request handlers (cron jobs, API routes)
const result = await processJobsServerless({
  timeout: 300000,   // 5min max for HTTP requests
  maxBatches: 25,
  batchSize: 30,
});

// For long-running worker processes (recommended)
const worker = await createWorker(config, {
  autoStart: true,
  instanceId: "fly-worker-1"
});
// No timeout limits - can process jobs continuously
```

#### Quick Reference Table

| Provider | Max Timeout | Recommended Timeout | Recommended Batch Size | Notes |
|----------|-------------|---------------------|------------------------|-------|
| **Vercel** | 300s (Pro+) | 25s | 20 | 15s for Hobby, 25s for cron |
| **Cloudflare Workers** | 30s (CPU time) | 30s | 25 | Standard Workers limit |
| **Netlify Functions** | 10s | 10s | 15 | 15min for Background Functions |
| **AWS Lambda** | 900s | 300s | 50 | Varies by configuration |
| **Fly.io** | 300s (HTTP) / ∞ (Workers) | 300s / ∞ | 30 | HTTP requests + long-running workers |
| **Railway** | 300s | 120s | 30 | Platform-dependent |
| **Render** | 600s | 300s | 40 | Based on service tier |

> **💡 Tip:** Always set your timeout 2-3 seconds lower than the provider's limit to account for cold starts and network overhead. Note that Fly.io supports both serverless HTTP handlers (with timeouts) and long-running worker processes (without timeouts) - choose based on your workload.

### Cron Route Example

```typescript
// app/api/cron/process-jobs/route.ts
import { processJobsServerless } from "@captable/queue";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Auto-detect provider and set appropriate timeout
  const getProviderConfig = () => {
    if (process.env.VERCEL) {
      return { timeout: 25000, batchSize: 20 }; // Vercel
    }
    if (process.env.CF_PAGES) {
      return { timeout: 30000, batchSize: 25 }; // Cloudflare
    }
    if (process.env.NETLIFY) {
      return { timeout: 10000, batchSize: 15 }; // Netlify
    }
    if (process.env.FLY_APP_NAME) {
      return { timeout: 300000, batchSize: 30 }; // Fly.io
    }
    return { timeout: 25000, batchSize: 20 }; // Default
  };

  const config = getProviderConfig();
  const result = await processJobsServerless(config);

  return NextResponse.json({
    success: true,
    processed: result.processed,
    duration: result.duration,
    provider: process.env.VERCEL ? "vercel" : 
              process.env.CF_PAGES ? "cloudflare" : 
              process.env.NETLIFY ? "netlify" : 
              process.env.FLY_APP_NAME ? "fly.io" : "unknown",
  });
}
```

### Serverless Health Monitoring

```typescript
import { healthCheck, getQueueStatus } from "@captable/queue";

// Health check endpoint
export async function GET() {
  const health = await healthCheck();
  return Response.json(health, { 
    status: health.healthy ? 200 : 503 
  });
}

// Queue status endpoint
export async function GET() {
  const status = await getQueueStatus();
  return Response.json(status);
}
```

## 📦 Installation

```bash
npm install @captable/queue
```

## 🔧 Basic Usage

### Setting up a Job Processor

```typescript
import { register, addJob } from "@captable/queue";

// Define your job processor
register({
  type: "send-email",
  process: async (payload: { to: string; subject: string; body: string }) => {
    // Your email sending logic here
    await sendEmail(payload.to, payload.subject, payload.body);
  },
  timeout: 30000, // 30 seconds
  maxAttempts: 3,
  retryDelay: 5000, // 5 seconds
});

// Add a job to the queue
const jobId = await addJob("send-email", {
  to: "user@example.com",
  subject: "Welcome!",
  body: "Welcome to our platform!",
});
```

### Bulk Job Processing

```typescript
import { addJobs } from "@captable/queue";

const jobs = [
  { type: "send-email", payload: { to: "user1@example.com", subject: "Hello", body: "..." } },
  { type: "send-email", payload: { to: "user2@example.com", subject: "Hello", body: "..." } },
  { type: "process-data", payload: { dataId: "data-123" } },
];

const jobIds = await addJobs(jobs);
console.log(`Created ${jobIds.length} jobs`);
```

### Advanced Job Options

```typescript
await addJob("important-task", payload, {
  priority: 10,        // Higher priority jobs are processed first
  delay: 3600,         // Delay execution by 1 hour (in seconds)
  maxAttempts: 5,      // Override default retry attempts
  retryDelay: 10000,   // Custom retry delay in milliseconds
  timeout: 60000,      // Job timeout in milliseconds
});
```

## ⚙️ Configuration

### Creating Custom Configuration

```typescript
import { createConfig, validateConfig } from "@captable/queue";

const config = createConfig({
  concurrency: 5,
  pollInterval: 2000,
  maxRetries: 5,
  retryBackoff: {
    type: "exponential",
    base: 2000,
    max: 60000,
    multiplier: 2,
  },
  monitoring: {
    enabled: true,
    metricsInterval: 30000,
    logLevel: "info",
  },
  worker: {
    gracefulShutdownTimeout: 30000,
    heartbeatInterval: 60000,
    maxJobExecutionTime: 300000,
  },
});

// Validate configuration
validateConfig(config);
```

### Environment Variables

The queue system supports configuration via environment variables:

```bash
QUEUE_CONCURRENCY=3
QUEUE_POLL_INTERVAL=1000
QUEUE_MAX_RETRIES=3
QUEUE_CLEANUP_INTERVAL=3600000
QUEUE_LOG_LEVEL=info
```

## 👷 Worker Management

### Creating and Managing Workers

```typescript
import { createWorker, QueueWorker } from "@captable/queue";

// Create a worker with custom configuration
const worker = createWorker({
  config: myConfig,
  autoStart: true,
  instanceId: "worker-1",
});

// Manual worker management
const worker = new QueueWorker({
  config: myConfig,
  autoStart: false,
});

await worker.start();

// Graceful shutdown
await worker.stop(30000); // 30 second timeout

// Force stop
worker.forceStop();

// Check worker health
if (worker.isHealthy()) {
  console.log("Worker is healthy");
}

// Get worker status
const status = worker.getStatus();
console.log(`Worker ${status.instanceId} is ${status.status}`);
```

## 📊 Metrics and Monitoring

### Collecting Metrics

```typescript
import { initializeMetrics, getMetricsCollector } from "@captable/queue";

// Initialize metrics collection
const metricsCollector = initializeMetrics(config);

// Get current metrics
const metrics = metricsCollector.getMetrics();
console.log(`Processed: ${metrics.jobsProcessed}`);
console.log(`Failed: ${metrics.jobsFailed}`);
console.log(`Error Rate: ${metrics.errorRate}%`);
console.log(`Average Processing Time: ${metrics.averageProcessingTime}ms`);

// Get job type specific metrics
const emailMetrics = metricsCollector.getJobTypeMetrics("send-email");
console.log(`Email jobs: ${emailMetrics.count}, avg time: ${emailMetrics.averageTime}ms`);

// Reset metrics
metricsCollector.reset();
```

### Health Monitoring

```typescript
// Check queue statistics
const stats = await getStats();
console.log(`Pending: ${stats.pending}, Completed: ${stats.completed}`);

// Monitor processing jobs
const processingJobs = metricsCollector.getProcessingJobs();
processingJobs.forEach(job => {
  console.log(`Job ${job.jobId} (${job.type}) running for ${Date.now() - job.startTime}ms`);
});
```

## 🚨 Error Handling

### Custom Error Types

```typescript
import {
  RetryableError,
  PermanentError,
  TimeoutError,
  RateLimitError,
  InvalidPayloadError,
} from "@captable/queue";

register({
  type: "api-call",
  process: async (payload) => {
    try {
      await makeApiCall(payload);
    } catch (error) {
      if (error.status === 429) {
        // Rate limited - retry after delay
        throw new RateLimitError("API rate limit exceeded", 60000);
      }
      
      if (error.status === 400) {
        // Bad request - don't retry
        throw new PermanentError("Invalid API request");
      }
      
      if (error.code === "TIMEOUT") {
        // Timeout - retry with custom delay
        throw new RetryableError("API timeout", 30000);
      }
      
      // Unknown error - let the system decide
      throw error;
    }
  },
});
```

### Error Classification

The system automatically classifies unknown errors:

```typescript
import { classifyError } from "@captable/queue";

try {
  await riskyOperation();
} catch (error) {
  const queueError = classifyError(error);
  
  if (queueError.retryable) {
    console.log("Error is retryable");
  } else {
    console.log("Error is permanent");
  }
}
```

## 🧪 Testing

### Test Utilities

```typescript
import { QueueTestHelper } from "@captable/queue/testing";

describe("Job Processing", () => {
  beforeEach(async () => {
    // Clear all jobs and processors
    await QueueTestHelper.resetTestEnvironment();
  });

  it("should process email jobs", async () => {
    // Create a tracking processor
    const tracker = QueueTestHelper.trackingProcessor("send-email");
    tracker.processor();

    // Add test jobs
    const jobIds = await QueueTestHelper.createTestJobs(3, "send-email");

    // Wait for jobs to complete
    for (const jobId of jobIds) {
      await QueueTestHelper.waitForJobCompletion(jobId, 5000);
    }

    // Assert results
    expect(tracker.calls).toHaveLength(3);
    await QueueTestHelper.assertJobCount(3, "completed");
  });

  it("should handle job failures", async () => {
    // Create a failing processor
    QueueTestHelper.failingProcessor("failing-job", "Test error");

    const jobId = await addJob("failing-job", { test: true });
    
    // Wait and assert failure
    await QueueTestHelper.waitForJobCompletion(jobId, 5000);
    await QueueTestHelper.assertJobStatus(jobId, "failed");
  });
});
```

### Mock Processors

```typescript
// Simple mock
QueueTestHelper.mockProcessor("test-job", async (payload) => {
  console.log("Processing:", payload);
});

// Delayed processor
QueueTestHelper.delayedProcessor("slow-job", 2000, async (payload) => {
  // This will be delayed by 2 seconds
  console.log("Slow processing:", payload);
});

// Conditional failing processor
QueueTestHelper.failingProcessor("conditional-job", "Failed", (payload) => {
  return payload.shouldFail === true;
});
```

## 🔧 Advanced Usage

### Custom Retry Strategies

```typescript
const config = createConfig({
  retryBackoff: {
    type: "exponential", // or "linear" or "fixed"
    base: 1000,          // Base delay in ms
    max: 30000,          // Maximum delay in ms
    multiplier: 2,       // Exponential multiplier
  },
});
```

### Job Cleanup

```typescript
import { cleanupJobs } from "@captable/queue";

// Clean up completed jobs older than 7 days
const cleanedCount = await cleanupJobs(7);
console.log(`Cleaned up ${cleanedCount} old jobs`);

// Clean up with custom retention period (30 days)
await cleanupJobs(30);
```

### Processing Jobs Manually

```typescript
import { processJobs } from "@captable/queue";

// Process up to 10 jobs
const processedCount = await processJobs(10);
console.log(`Processed ${processedCount} jobs`);
```

## 📈 Performance Considerations

### Concurrency Settings

- **Low concurrency (1-3)**: Better for CPU-intensive jobs
- **Medium concurrency (3-10)**: Good for mixed workloads
- **High concurrency (10+)**: Best for I/O-intensive jobs

### Memory Management

- Use job cleanup to prevent database bloat
- Monitor metrics to identify memory leaks
- Configure appropriate batch sizes for bulk operations

### Database Optimization

- Ensure proper indexing on job status and scheduled_for columns
- Use connection pooling for high-throughput scenarios
- Consider partitioning for very large job tables

## 🔒 Production Deployment

### Health Checks

```typescript
// Kubernetes health check endpoint
app.get("/health/queue", (req, res) => {
  const worker = getWorkerInstance();
  const metrics = getMetricsCollector()?.getMetrics();
  
  if (worker.isHealthy() && metrics.errorRate < 10) {
    res.status(200).json({ status: "healthy", metrics });
  } else {
    res.status(503).json({ status: "unhealthy", metrics });
  }
});
```

### Graceful Shutdown

```typescript
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  await worker.stop(30000); // 30 second timeout
  process.exit(0);
});
```

### Monitoring Integration

```typescript
// Prometheus metrics
const metrics = metricsCollector.getMetrics();
prometheusRegistry.gauge("queue_jobs_processed_total").set(metrics.jobsProcessed);
prometheusRegistry.gauge("queue_error_rate").set(metrics.errorRate);
prometheusRegistry.gauge("queue_depth").set(metrics.queueDepth);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

[MIT](./LICENSE)


## 🔗 Related Packages

- `@captable/db` - Database layer with Drizzle ORM
- `@captable/logger` - Structured logging with Pino
- `@captable/config` - Shared configuration utilities
