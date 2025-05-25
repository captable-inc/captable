import bcrypt from "bcryptjs";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, type DBTransaction } from "@captable/db";
import {
  members,
  users,
  passkeyVerificationTokens,
  passkeys,
  companies,
} from "@captable/db";
import {
  type DefaultSession,
  type NextAuthOptions,
  type Session,
  getServerSession,
} from "next-auth";
import { eq, and, sql } from "@captable/db";

import { env } from "@/env";
import { getAuthenticatorOptions } from "@/lib/authenticator";
import {
  type TAuthenticationResponseJSONSchema,
  ZAuthenticationResponseJSONSchema,
} from "@/lib/types";

import type { MemberStatusEnum } from "@captable/db";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/types";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { cache } from "react";
import { getUserByEmail, getUserById } from "./user";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const JWT_SECRET = new TextEncoder().encode(env.NEXTAUTH_SECRET);

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isOnboarded: boolean;
      companyId: string;
      memberId: string;
      companyPublicId: string;
      status: MemberStatusEnum | "";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    companyId: string;
    memberId: string;
    isOnboarded: boolean;
    companyPublicId: string;
    status: MemberStatusEnum | "";
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  events: {
    async linkAccount({ user }) {
      await db
        .update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.id, user.id));
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id);
      if (!existingUser?.emailVerified) return false;

      return true;
    },
    session({ session, token }) {
      session.user.isOnboarded = token.isOnboarded;
      session.user.companyId = token.companyId;
      session.user.memberId = token.memberId;
      session.user.companyPublicId = token.companyPublicId;
      session.user.status = token.status;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.picture ?? "";

      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },

    async jwt({ token, trigger }) {
      if (trigger && token.sub) {
        try {
          // Cast to string to fix type issue
          const userIdStr = token.sub as string;

          // Using raw SQL for enum comparison to fix type issues
          const memberStatus = sql`'ACTIVE'`;

          const memberRecords = await db.query.members.findMany({
            where: and(
              eq(members.userId, userIdStr),
              eq(members.isOnboarded, true),
              sql`${members.status} = ${memberStatus}`,
            ),
            orderBy: (members, { desc }) => [desc(members.lastAccessed)],
            limit: 1,
            with: {
              user: true,
              company: true,
            },
          });

          const member = memberRecords[0];

          if (member) {
            // Use type assertion for safe access
            token.status = member.status;
            token.name = member.user?.name ?? null;
            token.memberId = member.id;
            token.companyId = member.companyId;
            token.isOnboarded = member.isOnboarded;
            token.companyPublicId = member.company?.publicId ?? "";
            token.picture = member.user?.image ?? null;
          } else {
            token.status = "";
            token.companyId = "";
            token.memberId = "";
            token.isOnboarded = false;
            token.companyPublicId = "";
          }
        } catch (error) {
          console.error("Error in jwt callback:", error);
        }
      }
      return token;
    },
  },

  adapter: DrizzleAdapter(db),
  secret: env.NEXTAUTH_SECRET ?? "secret",
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials) {
          const { email, password } = credentials;
          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),

    CredentialsProvider({
      id: "webauthn",
      name: "Keypass",
      credentials: {
        csrfToken: { label: "csrfToken", type: "csrfToken" },
      },
      async authorize(credentials, req) {
        const csrfToken = credentials?.csrfToken;

        if (typeof csrfToken !== "string" || csrfToken.length === 0) {
          throw new Error("Invalid csrfToken");
        }

        let requestBodyCrediential: TAuthenticationResponseJSONSchema | null =
          null;

        try {
          //eslint-disable-next-line  @typescript-eslint/no-unsafe-argument
          const parsedBodyCredential = JSON.parse(req.body?.credential);
          requestBodyCrediential =
            ZAuthenticationResponseJSONSchema.parse(parsedBodyCredential);
        } catch {
          throw new Error("Invalid request");
        }

        // Delete and retrieve the verification token in one step
        const deletedRows = await db
          .delete(passkeyVerificationTokens)
          .where(eq(passkeyVerificationTokens.id, csrfToken))
          .returning();

        const challengeToken = deletedRows.length > 0 ? deletedRows[0] : null;

        if (!challengeToken) {
          return null;
        }

        if (challengeToken.expiresAt < new Date()) {
          throw new Error("Challenge token has expired.");
        }

        // Get the credential ID as a string
        const credentialIdString = requestBodyCrediential.id;

        // Find the passkey
        const passkeyRecord = await db.query.passkeys.findFirst({
          where: eq(passkeys.credentialId, credentialIdString),
        });

        if (!passkeyRecord) {
          throw new Error("Passkey not found");
        }

        // Get the user separately
        const userRecord = await db.query.users.findFirst({
          where: eq(users.id, passkeyRecord.userId),
        });

        if (!userRecord) {
          throw new Error("User not found");
        }

        const { rpId, origin } = getAuthenticatorOptions();

        // Create proper Uint8Array from string
        const credentialIdArray = new TextEncoder().encode(credentialIdString);
        const publicKeyArray = new TextEncoder().encode(
          passkeyRecord.credentialPublicKey,
        );

        // The simplewebauthn library's typings don't match what it expects at runtime
        // We need to cast to any here to avoid type errors
        const verification = await verifyAuthenticationResponse({
          response: requestBodyCrediential,
          expectedChallenge: challengeToken.token,
          expectedOrigin: origin,
          expectedRPID: rpId,
          authenticator: {
            credentialID: credentialIdString,
            credentialPublicKey: publicKeyArray,
            counter: Number(passkeyRecord.counter),
            transports:
              passkeyRecord.transports as AuthenticatorTransportFuture[],
          }, // Using the correct property name as per SimpleWebAuthn documentation
        }).catch(() => null);

        // @TODO (Add audits for verification.verified event)

        await db
          .update(passkeys)
          .set({
            lastUsedAt: new Date(),
            counter: verification?.authenticationInfo.newCounter,
          })
          .where(eq(passkeys.id, passkeyRecord.id));

        return {
          id: userRecord.id,
          email: userRecord.email,
          name: userRecord.name,
          emailVerified: userRecord.emailVerified?.toISOString() ?? null,
        };
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID as string,
      clientSecret: GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  pages: {
    signIn: "/login",
    signOut: "/login",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */

export const getServerAuthSession = () => getServerSession(authOptions);

export const getServerComponentAuthSession = cache(() =>
  getServerAuthSession(),
);

export const withServerSession = async () => {
  const session = await getServerAuthSession();

  if (!session) {
    throw new Error("session not found");
  }

  return session;
};

export const withServerComponentSession = cache(async () => {
  const session = await getServerComponentAuthSession();

  if (!session) {
    throw new Error("session not found");
  }

  return session;
});

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
