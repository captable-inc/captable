import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@captable/db";
// import { config } from "dotenv";
// config({
//   path: "../../.env",
// });

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
