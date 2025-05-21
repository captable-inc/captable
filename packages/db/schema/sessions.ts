import { index, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { createTable } from "./index";

export const sessions = createTable(
  "sessions",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    sessionToken: varchar("session_token", { length: 191 }).notNull(),
    userId: varchar("user_id", { length: 191 }).notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => {
    return [
      uniqueIndex("sessions_session_token_idx").on(table.sessionToken),
      index("sessions_user_id_idx").on(table.userId),
    ];
  },
);

export const sessionSelectSchema = createSelectSchema(sessions);
