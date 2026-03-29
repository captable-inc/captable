import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: { confirmPhrase?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.confirmPhrase !== "CLEAN_SLATE") {
    return NextResponse.json(
      { error: "Invalid confirmation phrase" },
      { status: 403 },
    );
  }

  let session;
  try {
    session = await withServerSession();
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No company found" }, { status: 401 });
  }

  const companyId = session.user.companyId;
  const deleted: string[] = [];

  try {
    // Use raw SQL for reliable cascade-aware deletion
    // This handles all foreign key dependencies in one go

    // 1. Template-related (deepest children first)
    await db.$executeRawUnsafe(
      `DELETE FROM "TemplateField" WHERE "templateId" IN (SELECT id FROM "Template" WHERE "companyId" = $1)`,
      companyId,
    );
    deleted.push("TemplateField");

    await db.$executeRawUnsafe(
      `DELETE FROM "EsignRecipient" WHERE "templateId" IN (SELECT id FROM "Template" WHERE "companyId" = $1)`,
      companyId,
    );
    deleted.push("EsignRecipient");

    await db.$executeRawUnsafe(
      `DELETE FROM "EsignAudit" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("EsignAudit");

    await db.$executeRawUnsafe(
      `DELETE FROM "Template" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("Template");

    // 2. Audit
    await db.$executeRawUnsafe(
      `DELETE FROM "Audit" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("Audit");

    // 3. Data rooms
    await db.$executeRawUnsafe(
      `DELETE FROM "DataRoomRecipient" WHERE "dataRoomId" IN (SELECT id FROM "DataRoom" WHERE "companyId" = $1)`,
      companyId,
    );
    deleted.push("DataRoomRecipient");

    await db.$executeRawUnsafe(
      `DELETE FROM "DataRoomDocument" WHERE "dataRoomId" IN (SELECT id FROM "DataRoom" WHERE "companyId" = $1)`,
      companyId,
    );
    deleted.push("DataRoomDocument");

    await db.$executeRawUnsafe(
      `DELETE FROM "DataRoom" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("DataRoom");

    // 4. Document shares
    await db.$executeRawUnsafe(
      `DELETE FROM "DocumentShare" WHERE "documentId" IN (SELECT id FROM "Document" WHERE "companyId" = $1)`,
      companyId,
    );
    deleted.push("DocumentShare");

    // 5. Documents & buckets
    await db.$executeRawUnsafe(
      `DELETE FROM "Document" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("Document");

    await db.$executeRawUnsafe(`DELETE FROM "Bucket"`);
    deleted.push("Bucket");

    // 6. Updates
    await db.$executeRawUnsafe(
      `DELETE FROM "UpdateRecipient" WHERE "updateId" IN (SELECT id FROM "Update" WHERE "companyId" = $1)`,
      companyId,
    );
    deleted.push("UpdateRecipient");

    await db.$executeRawUnsafe(
      `DELETE FROM "Update" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("Update");

    // 7. Securities
    await db.$executeRawUnsafe(
      `DELETE FROM "Option" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("Option");

    await db.$executeRawUnsafe(
      `DELETE FROM "Share" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("Share");

    // 8. Fundraise
    await db.$executeRawUnsafe(
      `DELETE FROM "Safe" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("Safe");

    await db.$executeRawUnsafe(
      `DELETE FROM "ConvertibleNote" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("ConvertibleNote");

    await db.$executeRawUnsafe(
      `DELETE FROM "Investment" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("Investment");

    // 9. Equity plans
    await db.$executeRawUnsafe(
      `DELETE FROM "EquityPlan" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("EquityPlan");

    // 10. Share classes
    await db.$executeRawUnsafe(
      `DELETE FROM "ShareClass" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("ShareClass");

    // 11. Stakeholders
    await db.$executeRawUnsafe(
      `DELETE FROM "Stakeholder" WHERE "companyId" = $1`,
      companyId,
    );
    deleted.push("Stakeholder");

    return NextResponse.json({
      success: true,
      message: "All cap table data cleared. Account and company preserved.",
      deleted,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      {
        error: "Cleanup failed",
        details: String(error),
        completedSteps: deleted,
      },
      { status: 500 },
    );
  }
}
