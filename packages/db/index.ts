import { drizzle } from "drizzle-orm/neon-http";

const db = async () => {
  if (process.env.NODE_ENV === "development") {
    const { pg } = await import("./dev");
    return pg;
  }

  return drizzle(process.env.DATABASE_URL as string);
};

export default db;
