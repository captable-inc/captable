# @captable/queue

A robust, database-backed job queue system built with Drizzle ORM and PostgreSQL.

## Features

- 🚀 **High Performance** - Built with Drizzle ORM for optimal database performance
- 🔄 **Retry Logic** - Exponential backoff with configurable max attempts
- 📊 **Priority Queues** - Process high-priority jobs first
- ⏰ **Delayed Jobs** - Schedule jobs for future execution
- 🔍 **Job Statistics** - Monitor queue health and performance
- 🧹 **Cleanup** - Automatic cleanup of old completed jobs
- 📝 **Structured Logging** - Comprehensive logging with Pino
- 🛡️ **Type Safety** - Full TypeScript support with proper typing

## Installation

```bash
npm install @captable/queue
```

## Package Structure

```
src/
├── core/
│   └── queue.ts         # Main queue implementation
├── jobs/
│   └── base-job.ts      # Abstract base job class
├── types/
│   └── index.ts         # Type definitions
└── index.ts             # Main exports
```

## Quick Start

### 1. Register Job Processors

```typescript
import { register } from "@captable/queue"

// Register a simple job processor
register({
  type: "send-email",
  process: async (payload: { to: string; subject: string; body: string }) => {
    // Send email logic here
    console.log(`Sending email to ${payload.to}`)
  }
})
```

### 2. Queue Jobs

```typescript
import { addJob } from "@captable/queue"

// Add a job to the queue
const jobId = await addJob("send-email", {
  to: "user@example.com",
  subject: "Welcome!",
  body: "Welcome to our platform!"
})

// Add a delayed job (execute in 1 hour)
await addJob("send-reminder", payload, {
  delay: 3600 // seconds
})

// Add a high-priority job
await addJob("urgent-notification", payload, {
  priority: 10
})
```

### 3. Process Jobs

```typescript
import { processJobs } from "@captable/queue"

// Process up to 10 jobs
const processedCount = await processJobs(10)

// Set up continuous processing
setInterval(async () => {
  await processJobs(5)
}, 1000)
```

## Using BaseJob Class

For more complex jobs, extend the `BaseJob` class:

```typescript
import { BaseJob } from "@captable/queue"

interface WelcomeEmailPayload {
  userId: string
  email: string
  name: string
}

class WelcomeEmailJob extends BaseJob<WelcomeEmailPayload> {
  readonly type = "welcome-email"
  
  protected readonly options = {
    maxAttempts: 5,
    retryDelay: 2000,
    priority: 5
  }

  async work(payload: WelcomeEmailPayload): Promise<void> {
    // Send welcome email
    await this.sendWelcomeEmail(payload)
  }

  private async sendWelcomeEmail(payload: WelcomeEmailPayload) {
    // Email sending logic
    console.log(`Sending welcome email to ${payload.email}`)
  }
}

// Register and use the job
const welcomeJob = new WelcomeEmailJob()
welcomeJob.register()

// Emit jobs
await welcomeJob.emit({
  userId: "user-123",
  email: "user@example.com", 
  name: "John Doe"
})

// Emit delayed job
await welcomeJob.emitDelayed(payload, 300) // 5 minutes delay

// Bulk emit
await welcomeJob.bulkEmit([payload1, payload2, payload3])
```

## Advanced Usage

### Job Options

```typescript
interface JobOptions {
  delay?: number        // Delay in seconds before execution
  maxAttempts?: number  // Maximum retry attempts (default: 3)
  priority?: number     // Job priority (higher = processed first)
  retryDelay?: number   // Base retry delay in milliseconds
}
```

### Bulk Operations

```typescript
import { addJobs } from "@captable/queue"

const jobs = [
  { type: "send-email", payload: { to: "user1@example.com" } },
  { type: "send-email", payload: { to: "user2@example.com" } },
  { type: "process-data", payload: { dataId: "data-123" } }
]

const jobIds = await addJobs(jobs)
```

### Monitoring

```typescript
import { getStats, cleanupJobs } from "@captable/queue"

// Get queue statistics
const stats = await getStats()
console.log(stats)
// Output: { pending: 5, processing: 2, completed: 100, failed: 3 }

// Clean up old completed jobs (older than 7 days)
const cleanedCount = await cleanupJobs(7)
```

## Error Handling

The queue automatically handles retries with exponential backoff:

```typescript
// Job fails -> retry with 1x base delay
// Job fails again -> retry with 2x base delay  
// Job fails again -> retry with 4x base delay
// Max attempts reached -> job marked as failed
```

## Database Schema

The queue uses a `job_queue` table with the following structure:

```sql
CREATE TABLE job_queue (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  retry_delay INTEGER DEFAULT 1000,
  scheduled_for TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  failed_at TIMESTAMP,
  error TEXT
);
```

## Production Considerations

### Worker Setup

```typescript
// worker.ts
import { processJobs, getStats } from "@captable/queue"
import { logger } from "@captable/logger"

async function worker() {
  const log = logger.child({ service: "queue-worker" })
  
  while (true) {
    try {
      const processed = await processJobs(10)
      
      if (processed === 0) {
        // No jobs processed, wait before next poll
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Log stats periodically
      if (Math.random() < 0.1) { // 10% chance
        const stats = await getStats()
        log.info({ stats }, "Queue statistics")
      }
    } catch (error) {
      log.error({ error }, "Worker error")
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

worker().catch(console.error)
```

### Graceful Shutdown

```typescript
process.on('SIGTERM', async () => {
  console.log('Graceful shutdown initiated...')
  // Stop accepting new jobs
  // Wait for current jobs to complete
  process.exit(0)
})
```

## API Reference

### Core Functions

- `register<T>(processor: JobProcessor<T>)` - Register a job processor
- `addJob<T>(type: string, payload: T, options?: JobOptions)` - Add single job
- `addJobs<T>(jobs: BulkJobInput<T>[])` - Add multiple jobs
- `processJobs(limit?: number)` - Process pending jobs
- `getStats()` - Get queue statistics
- `cleanupJobs(olderThanDays?: number)` - Clean up old jobs
- `getRegisteredProcessors()` - Get registered processor types
- `clearProcessors()` - Clear all processors (testing)

### BaseJob Methods

- `register()` - Register the job processor
- `work(payload: T)` - Abstract method to implement job logic
- `emit(payload: T, options?: JobOptions)` - Emit single job
- `bulkEmit(payloads: T[], options?: JobOptions)` - Emit multiple jobs
- `emitDelayed(payload: T, delayInSeconds: number, options?: JobOptions)` - Emit delayed job
- `emitPriority(payload: T, priority: number, options?: JobOptions)` - Emit priority job

## TypeScript Support

Full TypeScript support with proper generic typing:

```typescript
interface MyJobPayload {
  userId: string
  action: string
}

// Type-safe job registration
register<MyJobPayload>({
  type: "my-job",
  process: async (payload) => {
    // payload is properly typed as MyJobPayload
    console.log(payload.userId, payload.action)
  }
})

// Type-safe job emission
await addJob<MyJobPayload>("my-job", {
  userId: "123",
  action: "update"
})
```

## Contributing

This package follows the Captable monorepo patterns:

- Use TypeScript with strict typing
- Follow the established file organization
- Use Drizzle ORM for database operations
- Use Pino for structured logging
- Write comprehensive tests
- Update documentation

## License

MIT 

## Development

### Quick Development Setup


Start everything including job processing:

```bash
# From monorepo root
bun run dx
```

This starts:
- Next.js development server (port 3000)
- Database studio
- Email development server (port 3001)
- **Job processor in watch mode** (with quiet logging)

### Manual Job Management

From the `apps/captable` directory:

```bash
# Process all pending jobs once
bun run jobs

# Process jobs continuously (watch mode)
bun run jobs:dev

# Queue sample jobs for testing
bun run test-jobs

# Show queue statistics
bun run jobs stats

# Clean up old completed jobs
bun run jobs cleanup
```

### Development Scripts

Job management scripts are located in `apps/captable/scripts/dev/`:

- **`jobs.ts`** - Main job processor with watch mode
- **`test-jobs.ts`** - Queue sample jobs for testing
- **`README.md`** - Detailed documentation

### Watch Mode Features

The watch mode (`bun run jobs:dev`) includes:

- 🔇 **Quiet operation** - Only logs when jobs are found
- 💓 **Heartbeat logging** - Status every 60 seconds when idle
- 🛑 **Graceful shutdown** - Ctrl+C stops cleanly
- ⚡ **Fast processing** - 1s intervals when jobs found, 5s when idle

### Development Workflow

1. **Start full development environment:**
   ```bash
   bun run dx
   ```

2. **Queue test jobs (in another terminal):**
   ```bash
   cd apps/captable
   bun run test-jobs
   ```

3. **Monitor queue status:**
   ```bash
   bun run jobs stats
   ```

4. **Manual processing (if needed):**
   ```bash
   bun run jobs
   ```

### Testing Individual Job Types

```bash
# Test specific email jobs
bun run test-jobs password-reset
bun run test-jobs member-invite  
bun run test-jobs auth-verification

# Test all jobs at once
bun run test-jobs all
```

### Production vs Development

| Environment | Trigger | Frequency | Logging |
|-------------|---------|-----------|----------|
| **Development** | Watch mode | Every 5s | Quiet + heartbeat |
| **Production** |Cron | Every minute | Event-driven |

### Available Job Types

Current job implementations:

- `email.password-reset` - Password reset emails
- `email.member-invite` - Member invitation emails  
- `email.auth-verify` - Account verification emails
- `email.share-update` - Share update notifications
- `email.share-data-room` - Data room sharing emails
- `email.esign` - E-signature request emails
- `email.esign-confirmation` - E-signature confirmation emails
- `generate.esign-pdf` - PDF generation for e-signatures

See `apps/captable/jobs/` for complete implementations.
