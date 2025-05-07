import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import type { Env } from "@captable/lib";

export const connection = async (env: Env) => {
  if (env.NODE_ENV === "development") {
    const { pg } = await import("./dev");
    return pg;
  }

  return drizzle({
    connection: {
      url: env.HYPERDRIVE.connectionString,
      ssl: env.NODE_ENV === "development",
    },
    schema,
  });
};
