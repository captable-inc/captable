import "server-only";

import {
  TRPCClientError,
  createTRPCProxyClient,
  loggerLink,
} from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { TRPCErrorResponse } from "@trpc/server/rpc";
import { cookies } from "next/headers";
import { cache } from "react";

import { env } from "@/env";
import { type AppRouter, appRouter } from "@/trpc/api/root";
import { createTRPCContext } from "@/trpc/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(() => {
  return createTRPCContext({
    headers: new Headers({
      cookie: cookies().toString(),
      "x-trpc-source": "rsc",
    }),
  });
});

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (op) =>
        env.LOGS || (op.direction === "down" && op.result instanceof Error),
    }),
    /**
     * Custom RSC link that lets us invoke procedures without using http requests. Since Server
     * Components always run on the server, we can just call the procedure as a function.
     */
    () =>
      ({ op }) =>
        observable((observer) => {
          createContext()
            .then((ctx) => {
              // Create a server-side caller using the new v11 approach
              const caller = appRouter.createCaller(ctx);

              // Navigate to the correct procedure and call it
              // Using Record<string, unknown> for dynamic procedure access in RSC context
              const procedure = op.path
                .split(".")
                .reduce((acc: Record<string, unknown>, segment) => acc[segment] as Record<string, unknown>, caller as Record<string, unknown>);
              
              // Call the procedure with proper typing
              return (procedure as unknown as (input: unknown) => Promise<unknown>)(op.input);
            })
            .then((data) => {
              observer.next({ result: { data } });
              observer.complete();
            })
            .catch((cause: TRPCErrorResponse) => {
              observer.error(TRPCClientError.from(cause));
            });
        }),
  ],
});
