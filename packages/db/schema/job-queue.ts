import { createId } from "@paralleldrive/cuid2";
import {
  index,
  integer,
  json,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createTable } from "./table";

export const jobQueue = createTable(
  "job_queue",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    type: varchar("type", { length: 100 }).notNull(),
    payload: json("payload").notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    priority: integer("priority").default(0).notNull(),
    scheduledFor: timestamp("scheduled_for").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
    failedAt: timestamp("failed_at"),
    error: varchar("error", { length: 1000 }),
    retryDelay: integer("retry_delay").default(1000).notNull(),
  },
  (table) => ({
    // Primary index for job processing - covers the main WHERE clause
    // Used in: WHERE status = 'pending' AND scheduled_for <= NOW() AND attempts < max_attempts
    jobProcessingIdx: index("job_processing_idx").on(
      table.status,
      table.scheduledFor,
      table.attempts,
    ),

    // Index for priority ordering - optimizes ORDER BY priority DESC, created_at ASC
    priorityOrderingIdx: index("priority_ordering_idx").on(
      table.priority.desc(),
      table.createdAt.asc(),
    ),

    // Index for cleanup operations - covers cleanup WHERE clause
    // Used in: WHERE created_at <= cutoff AND status = 'completed'
    cleanupIdx: index("cleanup_idx").on(table.status, table.createdAt),

    // Index for status filtering and stats queries
    // Used in: GROUP BY status and general status filtering
    statusIdx: index("status_idx").on(table.status),

    // Index for job type filtering - useful for monitoring specific job types
    typeIdx: index("type_idx").on(table.type),

    // Composite index for failed job analysis
    // Used for: WHERE status = 'failed' ORDER BY failed_at DESC
    failedJobsIdx: index("failed_jobs_idx").on(
      table.status,
      table.failedAt.desc(),
    ),
  }),
);

export type JobQueue = typeof jobQueue.$inferSelect;
export type NewJobQueue = typeof jobQueue.$inferInsert;
