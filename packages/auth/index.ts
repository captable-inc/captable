import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db, schema, members, companies, eq, and, sql } from "@captable/db";
import { createAuthClient } from "better-auth/react";
import type { MemberStatusEnum } from "@captable/db";

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
		},
	},

	session: {
		cookieCache: {
			enabled: false,
		},
	},

	advanced: {
		cookiePrefix: "captable",
	},

	plugins: [nextCookies()],
});

// Extended session type
export interface ExtendedSession {
	user: {
		id: string;
		name: string;
		email: string;
		image?: string;
		emailVerified: boolean;
		createdAt: Date;
		updatedAt: Date;
		isOnboarded: boolean;
		companyId: string;
		memberId: string;
		companyPublicId: string;
		status: MemberStatusEnum | "";
	};
	session: {
		id: string;
		expiresAt: Date;
		token: string;
		ipAddress?: string | null;
		userAgent?: string | null;
		userId: string;
		activeOrganizationId?: string | null;
	};
}

export const { useSession: useBaseSession, signIn, signOut, signUp } = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BASE_URL as string,
});

// Custom hook for client-side session with member data
export const useSession = () => {
	const { data: baseSession, ...rest } = useBaseSession();
	
	// This will return the base session from Better Auth
	// For full extended session with member data, use serverSideSession on the server
	return {
		data: baseSession as ExtendedSession | null,
		...rest,
	};
};

export type Session = ExtendedSession;

// Re-export client for convenience
export { authClient } from "./client";

// Re-export server actions
export { 
	serverSideSession,
	signInEmailAction,
	signUpEmailAction,
	signOutAction 
} from "./server";
