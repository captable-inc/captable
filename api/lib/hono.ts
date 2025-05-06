import { handleError, handleZodError } from "@/api/lib/error";
import { auth } from "@captable/auth";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import type { Bindings } from "hono/types";

const PUBLIC_ROUTES = ["/favicon", "/search", "/schema", "/docs"];

export function API() {
  const api = new OpenAPIHono<{
    Bindings: Bindings;
    Variables: {
      user: typeof auth.$Infer.Session.user | null;
      session: typeof auth.$Infer.Session.session | null;
    };
  }>({
    defaultHook: handleZodError,
  }).basePath("/");

  api.onError(handleError);

  // Only show schema in development
  // api.use("/schema", async (c, next) => {
  // 	if (c.env.NODE_ENV !== "development") {
  // 		return c.text("Not Found", 404);
  // 	}
  // 	return next();
  // });

  // Only show docs in development
  // api.use("/docs", async (c, next) => {
  // 	if (c.env.NODE_ENV !== "development") {
  // 		return c.text("Not Found", 404);
  // 	}
  // 	return next();
  // });

  api.doc("/api/schema", (c) => ({
    openapi: "3.1.0",
    info: {
      version: "v1",
      title: "Captable API",
      description: "Captable API",
    },
    servers: [{ url: process.env.BETTER_AUTH_URL as string }],
  }));

  api.get(
    "/api/docs",
    apiReference({
      url: "/api/schema",
    }),
  );

  api.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
  });

  // api.use("/api/*", async (c, next) => {
  //   // Skip for public routes
  //   if (PUBLIC_ROUTES.some((route) => c.req.path.startsWith(route))) {
  //     return next();
  //   }

  //   const token = "123";
  //   if (!token) throw new Error("ACCESS_TOKEN is required");
  //   return bearerAuth({ token })(c, next);
  // });

  api.use("*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return next();
  });

  api.on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  });

  return api;
}

export type API = ReturnType<typeof API>;
