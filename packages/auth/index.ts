import db from "@captable/db";
import * as schema from "@captable/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { redirect } from "react-router";

const config = async () => {
  return {
    basePath: "/api/auth",
    database: drizzleAdapter(await db(), {
      provider: "pg",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
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

export const auth = betterAuth(await config());

type getServerSideSessionProps = {
  request: Request;
  api?: boolean;
};

export const getServerSideSession = async ({
  request,
  api = false,
}: getServerSideSessionProps) => {
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
