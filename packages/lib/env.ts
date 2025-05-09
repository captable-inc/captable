import type { Env } from "./env.d";

export const getEnv = ({
  env,
}: {
  env?: Partial<Env>;
} = {}): Env => {
  // If env is provided, use it merged with process.env
  // Otherwise just use process.env, cast to the required type
  return {
    ...process.env,
    ...env,
  } as unknown as Env;
};
