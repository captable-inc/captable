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
    // Delete ALL cap table data across ALL companies (not just current)
    // This ensures seed data from other demo companies is also removed

    // 1. Template-related (deepest children first)
    await db.$executeRawUnsafe(`DELETE FROM "TemplateField"`);
    deleted.push("TemplateField");

    await db.$executeRawUnsafe(`DELETE FROM "EsignRecipient"`);
    deleted.push("EsignRecipient");

    await db.$executeRawUnsafe(`DELETE FROM "EsignAudit"`);
    deleted.push("EsignAudit");

    await db.$executeRawUnsafe(`DELETE FROM "Template"`);
    deleted.push("Template");

    // 2. Audit
    await db.$executeRawUnsafe(`DELETE FROM "Audit"`);
    deleted.push("Audit");

    // 3. Data rooms
    await db.$executeRawUnsafe(`DELETE FROM "DataRoomRecipient"`);
    deleted.push("DataRoomRecipient");

    await db.$executeRawUnsafe(`DELETE FROM "DataRoomDocument"`);
    deleted.push("DataRoomDocument");

    await db.$executeRawUnsafe(`DELETE FROM "DataRoom"`);
    deleted.push("DataRoom");

    // 4. Document shares
    await db.$executeRawUnsafe(`DELETE FROM "DocumentShare"`);
    deleted.push("DocumentShare");

    // 5. Documents & buckets
    await db.$executeRawUnsafe(`DELETE FROM "Document"`);
    deleted.push("Document");

    await db.$executeRawUnsafe(`DELETE FROM "Bucket"`);
    deleted.push("Bucket");

    // 6. Updates
    await db.$executeRawUnsafe(`DELETE FROM "UpdateRecipient"`);
    deleted.push("UpdateRecipient");

    await db.$executeRawUnsafe(`DELETE FROM "Update"`);
    deleted.push("Update");

    // 7. Securities
    await db.$executeRawUnsafe(`DELETE FROM "Option"`);
    deleted.push("Option");

    await db.$executeRawUnsafe(`DELETE FROM "Share"`);
    deleted.push("Share");

    // 8. Fundraise
    await db.$executeRawUnsafe(`DELETE FROM "Safe"`);
    deleted.push("Safe");

    await db.$executeRawUnsafe(`DELETE FROM "ConvertibleNote"`);
    deleted.push("ConvertibleNote");

    await db.$executeRawUnsafe(`DELETE FROM "Investment"`);
    deleted.push("Investment");

    // 9. Equity plans
    await db.$executeRawUnsafe(`DELETE FROM "EquityPlan"`);
    deleted.push("EquityPlan");

    // 10. Share classes
    await db.$executeRawUnsafe(`DELETE FROM "ShareClass"`);
    deleted.push("ShareClass");

    // 11. Stakeholders
    await db.$executeRawUnsafe(`DELETE FROM "Stakeholder"`);
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
