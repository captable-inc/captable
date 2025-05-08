import * as schema from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { logger, getEnv, type Env } from "@cap/lib";

export const connection = async (env: Env) => {
  const ev = getEnv({ env });
  logger.debug(`Using ${ev.NODE_ENV} database`);

  return drizzle({
    connection: {
      url: ev.NODE_ENV === "development" ? ev.DATABASE_URL : ev.HYPERDRIVE?.connectionString,
    },
    schema,
  });
};
