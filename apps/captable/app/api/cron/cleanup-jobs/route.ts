import { logger } from "@captable/logger";
import { cleanupJobs } from "@captable/queue";
import { type NextRequest, NextResponse } from "next/server";

const log = logger.child({ module: "cron-cleanup" });

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const cleaned = await cleanupJobs(7); // Clean jobs older than 7 days

    log.info({ cleaned }, "Job cleanup completed");

    return NextResponse.json({
      success: true,
      cleaned,
    });
  } catch (error) {
    log.error({ error }, "Job cleanup failed");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
