import { logger } from "@captable/logger";
import { processJobsServerless } from "@captable/queue";
import { type NextRequest, NextResponse } from "next/server";
import "@/jobs"; // Import to register all jobs

const log = logger.child({ module: "cron-jobs" });

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!expectedAuth || authHeader !== expectedAuth) {
    log.warn({ authHeader }, "Unauthorized cron job access attempt");
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Use serverless-optimized processing with built-in timeouts and batch management
    const result = await processJobsServerless({
      maxJobs: 200, // Maximum jobs to process in this run
      maxBatches: 10, // Maximum batches to prevent infinite loops
      batchSize: 20, // Jobs per batch
      timeout: 25000, // 25 second timeout (safe for Vercel)
      batchDelay: 100, // 100ms delay between batches
    });

    log.info(result, "Serverless cron job processing completed");

    return NextResponse.json({
      success: true,
      processed: result.processed,
      batches: result.batches,
      duration: result.duration,
      timeoutReached: result.timeoutReached,
      errors: result.errors,
    });
  } catch (error) {
    log.error({ error }, "Serverless cron job processing failed");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
