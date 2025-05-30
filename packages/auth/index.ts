import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@captable/db";
import { createAuthClient } from "better-auth/react";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			...schema,
			user: schema.betterAuthUsers,
			session: schema.betterAuthSessions,
			account: schema.betterAuthAccounts,
			verification: schema.betterAuthVerifications,
		},
	}),

	emailAndPassword: {
		enabled: true,
	},

	socialProviders: {
		google: {
			enabled: true,
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			accountLinking: {
				enabled: true,
				trusted: true,
			},
		},
	},

	account: {
		accountLinking: {
			enabled: true,
		},
	},
	session: {
		cookieCache: {
			enabled: false,
		},
		cookie: {
			name: "session",
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
		},
	},
	advanced: {
		cookiePrefix: "captable",
	},
});

type ServerSideSessionProps = { request: Request };

export const serverSideSession = async ({
  request,
}: ServerSideSessionProps) => {
  const headers = new Headers(request.headers);
  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
};

export const { useSession, signIn, signOut } = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BASE_URL as string,
});

export type Session = Awaited<ReturnType<typeof serverSideSession>>;
