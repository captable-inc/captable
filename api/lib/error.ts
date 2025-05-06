import type { Context } from "hono";
import { ZodError } from "zod";

interface ErrorResponse {
  message: string;
  error?: unknown;
  issues?: unknown[];
}

export const handleError = (err: Error, c: Context) => {
  console.error(`[Error] ${err.name}:`, err);

  const response: ErrorResponse = {
    message: err.message || "Internal Server Error",
  };

  // Add stack trace in development
  if (c.env?.NODE_ENV === "development") {
    response.error = err.stack;
  }

  if (err instanceof ZodError) {
    return handleZodValidationError(err, c);
  }

  return c.json(response, 500);
};

// Helper function for direct ZodError handling
const handleZodValidationError = (err: ZodError, c: Context) => {
  const response: ErrorResponse = {
    message: "Validation Error",
    issues: err.errors.map((e) => ({
      path: e.path,
      message: e.message,
      code: e.code,
    })),
  };

  return c.json(response, 400);
};

// OpenAPI validation hook
export const handleZodError = (
  result: { success: boolean; error?: ZodError },
  c: Context,
) => {
  if (!result.success && result.error) {
    return handleZodValidationError(result.error, c);
  }
};
