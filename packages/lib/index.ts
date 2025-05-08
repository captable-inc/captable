export * from "./env.d";
export * from "./logger";
export * from "./env";
import { LoaderFunctionArgs } from "react-router";

export const getEnv = (context: LoaderFunctionArgs["context"]) => {
  if (!context?.env) {
    throw new Error("Environment variables not available in context");
  }
  return context.env;
};
