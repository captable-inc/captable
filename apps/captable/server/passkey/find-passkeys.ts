import { db } from "@captable/db";
import { eq } from "@captable/db/utils";
import { passkeys } from "@captable/db/schema";

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
