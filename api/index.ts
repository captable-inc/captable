import { API } from "@/api/lib/hono";
import { registerHealthRoutes } from "@/api/routes/health";

const api = API();
registerHealthRoutes(api);

export default api;
