import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
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

type ServerSideSessionProps = { request: Request };

export const serverSideSession = async ({
	request,
}: ServerSideSessionProps): Promise<ExtendedSession> => {
	const headers = new Headers(request.headers);
	const session = await auth.api.getSession({
		headers,
	});

	if (!session) {
		throw new Error("Unauthorized");
	}

	try {
		// Query for the most recently accessed active member
		const memberRecords = await db.query.members.findMany({
			where: and(
				eq(members.userId, session.user.id),
				eq(members.isOnboarded, true),
				sql`${members.status} = 'ACTIVE'`
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
			// Update last accessed
			await db
				.update(members)
				.set({ lastAccessed: new Date() })
				.where(eq(members.id, member.id));

			// Return extended session with member data
			return {
				...session,
				user: {
					...session.user,
					image: session.user.image ?? undefined,
					isOnboarded: member.isOnboarded,
					companyId: member.companyId,
					memberId: member.id,
					companyPublicId: member.company?.publicId ?? "",
					status: member.status,
				},
			};
		}

		// No active member found
		return {
			...session,
			user: {
				...session.user,
				image: session.user.image ?? undefined,
				isOnboarded: false,
				companyId: "",
				memberId: "",
				companyPublicId: "",
				status: "" as const,
			},
		};
	} catch (error) {
		console.error("Error fetching member data:", error);
		// Return session without member data if error occurs
		return {
			...session,
			user: {
				...session.user,
				image: session.user.image ?? undefined,
				isOnboarded: false,
				companyId: "",
				memberId: "",
				companyPublicId: "",
				status: "" as const,
			},
		};
	}
};

export const { useSession: useBaseSession, signIn, signOut } = createAuthClient({
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
