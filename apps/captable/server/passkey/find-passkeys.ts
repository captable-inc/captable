import { db, eq, passkeys } from "@captable/db";

export interface FindPasskeysOptions {
  userId: string;
}

export const findPasskeys = async ({ userId }: FindPasskeysOptions) => {
  const data = await db.query.passkeys.findMany({
    where: eq(passkeys.userId, userId),
    with: {
      user: true,
    },
  });

  return { data };
};
