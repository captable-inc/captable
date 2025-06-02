import { logger } from "@captable/logger";
import { Queue } from "@captable/queue";
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
    const startTime = Date.now();

    // Process jobs in batches
    let totalProcessed = 0;
    let batchCount = 0;
    const maxBatches = 10; // Prevent infinite loops

    while (batchCount < maxBatches) {
      const processed = await Queue.process(20); // Process 20 jobs per batch
      totalProcessed += processed;
      batchCount++;

      if (processed === 0) {
        break; // No more jobs to process
      }

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const duration = Date.now() - startTime;

    log.info(
      {
        totalProcessed,
        batches: batchCount,
        duration,
      },
      "Cron job processing completed",
    );

    return NextResponse.json({
      success: true,
      processed: totalProcessed,
      batches: batchCount,
      duration,
    });
  } catch (error) {
    log.error({ error }, "Cron job processing failed");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
