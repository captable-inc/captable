import type { API } from "@/api/lib/hono";
import { check } from "./check";

export const registerHealthRoutes = (api: API) => {
  api.openapi(check.route, check.handler);
};
