import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL as string,
  },
  schema,
});

export type DB = typeof db;
export type DBTransaction = PostgresJsDatabase<typeof schema>;
