import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Database instance and types
export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL as string,
  },
  schema,
});

export type DB = typeof db;
export type DBTransaction = PostgresJsDatabase<typeof schema>;

// Export the schema object for better-auth and other integrations
export { schema };

// Re-export all schema entities (tables, types, enums, etc.)
// This automatically includes any new tables added to schema files
export * from "./schema";

// Re-export all database utilities and Drizzle ORM operators
export * from "./utils";

// Re-export drizzle config for external usage
export { default as drizzleConfig } from "./config";
