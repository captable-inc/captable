// worker.ts
import handle from "hono-react-router-adapter/cloudflare-workers";
import server from "./api";
import * as build from "./build/server";

export default handle(build, server);
