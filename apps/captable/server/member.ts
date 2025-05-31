import { createHash } from "@/lib/crypto";
import { nanoid } from "nanoid";
import type { Session } from "@captable/auth/types";
import {
  db,
  type DBTransaction,
  eq,
  and,
  inArray,
  members,
  users,
  verificationTokens,
} from "@captable/db";

export const checkVerificationToken = async (
  token: string,
  userEmail: string | null | undefined,
) => {
  // based on https://github.com/nextauthjs/next-auth/blob/46264fb42af4c3ef7137a5694875eaa1309462ea/packages/core/src/lib/actions/callback/index.ts#L200
  const invite = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.token, token),
  });

  const hasInvite = !!invite;
  const expired = invite ? invite.expires.valueOf() < Date.now() : undefined;
  const invalidInvite = !hasInvite || expired;

  if (invalidInvite) {
    throw new Error("invalid invite or invite expired");
  }

  const [email, memberId] = invite.identifier.split(":");

  if (!memberId) {
    throw new Error("member id not found");
  }

  if (!email) {
    throw new Error("user email not found");
  }

  if (userEmail !== email) {
    throw new Error("invalid email");
  }

  return { memberId, email };
};

interface generateMemberIdentifierOptions {
  email: string;
  memberId: string;
}

export const generateMemberIdentifier = ({
  email,
  memberId,
}: generateMemberIdentifierOptions) => {
  return `${email}:${memberId}`;
};

export async function generateInviteToken() {
  const ONE_DAY_IN_SECONDS = 86400;
  const expires = new Date(Date.now() + ONE_DAY_IN_SECONDS * 1000);

  const memberInviteTokenHash = await createHash(`member-${nanoid(16)}`);
  return { expires, memberInviteTokenHash };
}

interface revokeExistingInviteTokensOptions {
  memberId: string;
  email: string;
  tx?: DBTransaction;
}

export async function revokeExistingInviteTokens({
  email,
  memberId,
  tx,
}: revokeExistingInviteTokensOptions) {
  const dbClient = tx ?? db;

  const identifier = generateMemberIdentifier({
    email,
    memberId,
  });

  const verificationToken = await dbClient.query.verificationTokens.findMany({
    where: eq(verificationTokens.identifier, identifier),
  });

  await dbClient.delete(verificationTokens).where(
    inArray(
      verificationTokens.token,
      verificationToken.map((item) => item.token),
    ),
  );
}

export interface checkMembershipOptions {
  session: Session;
  tx: DBTransaction;
}

export async function checkMembership({ session, tx }: checkMembershipOptions) {
  const memberRecord = await tx.query.members.findFirst({
    where: and(
      eq(members.id, session.user.memberId),
      eq(members.companyId, session.user.companyId),
      eq(members.isOnboarded, true),
    ),
    columns: {
      id: true,
      companyId: true,
      role: true,
      customRoleId: true,
      userId: true,
    },
  });

  if (!memberRecord) {
    throw new Error("Membership not found");
  }

  // Get user data separately
  const userRecord = await tx
    .select({
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, memberRecord.userId))
    .limit(1);

  const user =
    userRecord.length > 0 ? userRecord[0] : { name: null, email: null };

  const { companyId, id: memberId, ...rest } = memberRecord;

  return {
    companyId,
    memberId,
    ...rest,
    user,
  };
}
