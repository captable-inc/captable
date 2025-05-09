import { connection } from "@cap/db";
import * as schema from "@cap/db/schema";
import { type Env, getEnv } from "@cap/lib";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { redirect } from "react-router";

const config = async (env: Env) => {
  const ev = getEnv({ env });
  const db = await connection(ev);

  return {
    basePath: "/api/auth",
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
        organization: schema.organizations,
        member: schema.members,
        invitation: schema.invitations,
      },
    }),
    plugins: [organization()],
    emailAndPassword: {
      enabled: true,
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
        name: "starter:session",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
  } as const;
};

export const initializeAuth = async (env: Env) => {
  return betterAuth(await config(env));
};

type GetServerSideSessionProps = {
  request: Request;
  api?: boolean;
  env: Env;
};

export const getServerSideSession = async ({
  request,
  api = false,
  env,
}: GetServerSideSessionProps) => {
  const ev = getEnv({ env });
  const auth = await initializeAuth(ev);
  const headers = new Headers(request.headers);
  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    if (api) {
      throw new Error("Unauthorized");
    }

    // For regular requests, redirect to auth page
    throw redirect("/auth");
  }

  return session;
};
