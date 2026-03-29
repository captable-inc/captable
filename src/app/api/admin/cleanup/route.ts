import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json();
  const { confirmPhrase } = body;

  if (confirmPhrase !== "CLEAN_SLATE") {
    return NextResponse.json(
      { error: "Invalid confirmation phrase" },
      { status: 403 },
    );
  }

  const session = await withServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = session.user.companyId;

  try {
    // Delete in dependency order (children first)
    // Skip MinIO file cleanup to avoid timeout — orphaned files are harmless

    // Esign & audit
    await db.esignAudit.deleteMany({ where: { companyId } });
    await db.audit.deleteMany({ where: { companyId } });

    // Templates & fields
    await db.templateField.deleteMany();
    await db.esignRecipient.deleteMany();
    await db.template.deleteMany({ where: { companyId } });

    // Data rooms
    await db.dataRoomRecipient.deleteMany();
    await db.dataRoomDocument.deleteMany();
    await db.dataRoom.deleteMany({ where: { companyId } });

    // Document shares
    await db.documentShare.deleteMany();

    // Documents & buckets
    await db.document.deleteMany({ where: { companyId } });
    await db.bucket.deleteMany();

    // Updates
    await db.updateRecipient.deleteMany();
    await db.update.deleteMany({ where: { companyId } });

    // Securities - Options
    await db.option.deleteMany({ where: { companyId } });

    // Securities - Shares
    await db.share.deleteMany({ where: { companyId } });

    // Fundraise
    await db.safe.deleteMany({ where: { companyId } });
    await db.convertibleNote.deleteMany({ where: { companyId } });
    await db.investment.deleteMany({ where: { companyId } });

    // Equity plans
    await db.equityPlan.deleteMany({ where: { companyId } });

    // Share classes
    await db.shareClass.deleteMany({ where: { companyId } });

    // Stakeholders
    await db.stakeholder.deleteMany({ where: { companyId } });

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
