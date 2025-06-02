import { pgTable, varchar, json, integer, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { createTable } from "./table";

export const jobQueue = createTable("job_queue", {
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
});

export type JobQueue = typeof jobQueue.$inferSelect;
export type NewJobQueue = typeof jobQueue.$inferInsert; 