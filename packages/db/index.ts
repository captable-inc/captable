import { type Env, getEnv, logger } from "@cap/lib";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export const connection = async (env: Env) => {
  const ev = getEnv({ env });
  logger.debug(`Using ${ev.NODE_ENV} database`);

  return drizzle({
    connection: {
      url:
        ev.NODE_ENV === "development"
          ? ev.DATABASE_URL
          : ev.HYPERDRIVE?.connectionString,
    },
    schema,
  });
};
