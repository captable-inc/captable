import { db, eq, users } from "@captable/db";

export const getUserByEmail = async (email: string) => {
  try {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  } catch {
    return null;
  }
};
