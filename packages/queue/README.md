# @captable/queue

A serverless-friendly job queue implementation for the Captable monorepo, designed to replace pg-boss and work seamlessly with Vercel, Netlify, and other serverless platforms.

## Features

- 🚀 **Serverless-native** - No persistent connections required
- ⚡ **High performance** - Uses database-backed queue with efficient queries
- 🔄 **Automatic retries** - Exponential backoff with configurable limits
- 📊 **Priority queues** - Process high-priority jobs first
- 🧹 **Auto cleanup** - Automatic removal of old completed jobs
- 📈 **Job statistics** - Monitor queue health and performance
- 🔐 **Type-safe** - Full TypeScript support with proper typing
- 🪵 **Comprehensive logging** - Structured logging with @captable/logger

## Installation

```bash
# The package is already installed as part of the monorepo
```

## Quick Start

### 1. Create a Job

```typescript
import { BaseJob } from "@captable/queue";
import { sendMail } from "@/server/mailer";

export type WelcomeEmailPayload = {
  email: string;
  name: string;
  companyName: string;
};

export class WelcomeEmailJob extends BaseJob<WelcomeEmailPayload> {
  readonly type = "email.welcome";
  protected readonly options = {
    maxAttempts: 3,
    retryDelay: 1000,
    priority: 1,
  };

  async work(payload: WelcomeEmailPayload): Promise<void> {
    // Your job logic here
    await sendMail({
      to: [payload.email],
      subject: `Welcome to ${payload.companyName}!`,
      html: `<h1>Welcome ${payload.name}!</h1>`,
    });
  }
}

// Create and register the job
const welcomeEmailJob = new WelcomeEmailJob();
welcomeEmailJob.register();

export { welcomeEmailJob };
```

### 2. Queue Jobs

```typescript
import { welcomeEmailJob } from "@/jobs/welcome-email";

// Emit a single job
await welcomeEmailJob.emit({
  email: "user@example.com",
  name: "John Doe",
  companyName: "Acme Corp",
});

// Emit with custom options
await welcomeEmailJob.emit(
  {
    email: "user@example.com",
    name: "John Doe", 
    companyName: "Acme Corp",
  },
  {
    delay: 60, // Wait 60 seconds before processing
    priority: 5, // High priority
    maxAttempts: 5,
  }
);

// Bulk emit
await welcomeEmailJob.bulkEmit([
  { email: "user1@example.com", name: "User 1", companyName: "Acme" },
  { email: "user2@example.com", name: "User 2", companyName: "Acme" },
]);
```

### 3. Process Jobs (Cron)

Jobs are automatically processed via Cron:

```typescript
// app/api/cron/process-jobs/route.ts
import { processJobs } from "@captable/queue";
import "@/jobs"; // Import to register all jobs

export async function GET() {
  const processed = await processJobs(20);
  return Response.json({ processed });
}
```

## API Reference

### BaseJob

Abstract base class for creating jobs.

```typescript
abstract class BaseJob<T extends Record<string, unknown>> {
  abstract readonly type: string;
  protected readonly options: JobOptions;
  
  abstract work(payload: T): Promise<void>;
  
  emit(payload: T, options?: JobOptions): Promise<string>;
  bulkEmit(payloads: T[], options?: JobOptions): Promise<string[]>;
  emitDelayed(payload: T, delayInSeconds: number, options?: JobOptions): Promise<string>;
  emitPriority(payload: T, priority: number, options?: JobOptions): Promise<string>;
  register(): void;
}
```

### Queue Functions

Utility functions for queue management.

```typescript
// Register a job processor
function register<T>(processor: JobProcessor<T>): void;

// Add jobs to queue
function addJob<T>(type: string, payload: T, options?: JobOptions): Promise<string>;
function addJobs<T>(jobs: Array<BulkJobInput<T>>): Promise<string[]>;

// Process and manage jobs
function processJobs(limit?: number): Promise<number>;
function getStats(): Promise<JobStats>;
function cleanupJobs(olderThanDays?: number): Promise<number>;

// Utility functions
function getRegisteredProcessors(): string[];
function clearProcessors(): void;
```

### JobOptions

Configuration options for jobs.

```typescript
interface JobOptions {
  delay?: number; // seconds to delay execution
  maxAttempts?: number; // maximum retry attempts
  priority?: number; // higher = more priority
  retryDelay?: number; // milliseconds between retries
}
```

### JobStats

Queue statistics.

```typescript
interface JobStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}
```

## Configuration

### Cron

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/process-jobs",
      "schedule": "* * * * *" // Every minute
    },
    {
      "path": "/api/cron/cleanup-jobs",
      "schedule": "0 2 * * *" // Daily at 2 AM
    }
  ]
}
```

### Environment Variables

```bash
CRON_SECRET=your-super-secret-cron-key
DATABASE_URL=your-database-url
```

## Database Schema

The queue uses a single table `cap_job_queue`:

```sql
CREATE TABLE cap_job_queue (
  id VARCHAR(128) PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  payload JSON NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  priority INTEGER DEFAULT 0,
  scheduled_for TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  failed_at TIMESTAMP,
  error VARCHAR(1000),
  retry_delay INTEGER DEFAULT 1000
);
```

## Job Organization

### Job Registry

Create a central registry to import all jobs:

```typescript
// jobs/index.ts
import "./welcome-email";
import "./password-reset";
import "./notifications";

export { welcomeEmailJob } from "./welcome-email";
export { passwordResetJob } from "./password-reset";
export * from "@captable/queue";
```

### Job Types

Follow consistent naming conventions:

- Email jobs: `email.welcome`, `email.password-reset`
- PDF generation: `generate.invoice`, `generate.report`
- Data processing: `process.analytics`, `process.cleanup`

## Best Practices

### 1. Job Design

- Keep jobs idempotent
- Handle errors gracefully
- Use appropriate retry limits
- Set meaningful priorities

### 2. Payload Design

```typescript
// ✅ Good: Specific, typed payload
type EmailPayload = {
  to: string;
  template: string;
  data: Record<string, unknown>;
};

// ❌ Bad: Generic, untyped payload
type GenericPayload = {
  action: string;
  params: any;
};
```

### 3. Error Handling

```typescript
async work(payload: EmailPayload): Promise<void> {
  try {
    await sendEmail(payload);
  } catch (error) {
    if (error instanceof RateLimitError) {
      // Will retry with exponential backoff
      throw error;
    }
    
    if (error instanceof PermanentError) {
      // Log and don't retry
      log.error({ error, payload }, "Permanent error");
      return; // Don't throw to avoid retries
    }
    
    throw error; // Retry for unknown errors
  }
}
```

### 4. Monitoring

```typescript
import { getStats, getRegisteredProcessors } from "@captable/queue";

// Get queue statistics
const stats = await getStats();
console.log(`Pending: ${stats.pending}, Failed: ${stats.failed}`);

// List registered processors
const processors = getRegisteredProcessors();
console.log(`Registered jobs: ${processors.join(", ")}`);
```

## Migration from pg-boss

### Before (pg-boss)

```typescript
import { BaseJob } from "@/jobs/base";
import type { Job } from "pg-boss";

export class EmailJob extends BaseJob<EmailPayload> {
  readonly type = "email.send";

  async work(job: Job<EmailPayload>): Promise<void> {
    await sendEmail(job.data);
  }
}

// Usage
await boss.send("email.send", { to: "user@example.com" });
```

### After (@captable/queue)

```typescript
import { BaseJob } from "@captable/queue";

export class EmailJob extends BaseJob<EmailPayload> {
  readonly type = "email.send";

  async work(payload: EmailPayload): Promise<void> {
    await sendEmail(payload);
  }
}

const emailJob = new EmailJob();
emailJob.register();

// Usage
await emailJob.emit({ to: "user@example.com" });
```

## Troubleshooting

### Jobs Not Processing

1. Check cron routes are deployed
2. Verify `CRON_SECRET` is set
3. Ensure jobs are imported in registry
4. Check database connectivity

### High Failure Rate

1. Review error logs
2. Adjust retry limits
3. Check external service availability
4. Validate job payloads

### Performance Issues

1. Monitor queue depth
2. Adjust processing batch size
3. Consider job priorities
4. Review database indexes

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
