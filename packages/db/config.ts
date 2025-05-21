import type { Config } from "drizzle-kit";

export default {
  schema: "./schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  out: "./migrations",
  tablesFilter: ["cap_*"],
} satisfies Config;
