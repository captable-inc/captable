import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import { deleteBucketFile } from "@/server/file-uploads";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Verify the request includes the correct admin secret
  const body = await request.json();
  const { confirmPhrase } = body;

  if (confirmPhrase !== "CLEAN_SLATE") {
    return NextResponse.json(
      { error: "Invalid confirmation phrase" },
      { status: 403 },
    );
  }

  // Must be authenticated
  const session = await withServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = session.user.companyId;

  try {
    // Delete files from MinIO first
    const buckets = await db.bucket.findMany();
    for (const bucket of buckets) {
      try {
        await deleteBucketFile(bucket.key);
      } catch (e) {
        console.error(`Failed to delete file ${bucket.key}:`, e);
      }
    }

    // Delete in dependency order (children first)
    await db.$transaction(async (tx) => {
      // Esign & audit
      await tx.esignAudit.deleteMany({ where: { companyId } });
      await tx.audit.deleteMany({ where: { companyId } });

      // Templates & fields
      await tx.templateField.deleteMany();
      await tx.esignRecipient.deleteMany();
      await tx.template.deleteMany({ where: { companyId } });

      // Data rooms
      await tx.dataRoomRecipient.deleteMany();
      await tx.dataRoomDocument.deleteMany();
      await tx.dataRoom.deleteMany({ where: { companyId } });

      // Document shares
      await tx.documentShare.deleteMany();

      // Documents & buckets
      await tx.document.deleteMany({ where: { companyId } });
      await tx.bucket.deleteMany();

      // Updates
      await tx.updateRecipient.deleteMany();
      await tx.update.deleteMany({ where: { companyId } });

      // Securities - Options
      await tx.option.deleteMany({ where: { companyId } });

      // Securities - Shares
      await tx.share.deleteMany({ where: { companyId } });

      // Fundraise
      await tx.safe.deleteMany({ where: { companyId } });
      await tx.convertibleNote.deleteMany({ where: { companyId } });
      await tx.investment.deleteMany({ where: { companyId } });

      // Equity plans (depends on share classes)
      await tx.equityPlan.deleteMany({ where: { companyId } });

      // Share classes
      await tx.shareClass.deleteMany({ where: { companyId } });

      // Stakeholders
      await tx.stakeholder.deleteMany({ where: { companyId } });
    });

    return NextResponse.json({
      success: true,
      message:
        "All cap table data has been cleared. Your account and company profile are preserved.",
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Cleanup failed", details: String(error) },
      { status: 500 },
    );
  }
}
