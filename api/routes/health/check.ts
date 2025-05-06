import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { z } from "zod";

const ResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// Create route definition
const route = createRoute({
  method: "get",
  path: "/api/health",
  summary: "Check health",
  description: "Check health of the API",
  tags: ["Health"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
    },
  },
});

const handler = async (c: Context) => {
  return c.json({
    success: true,
    message: "OK",
  });
};

export const check = {
  route,
  handler,
};
