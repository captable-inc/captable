import { NextResponse } from "next/server";
import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import { generatePublicId } from "@/common/id";

export async function POST(request: Request) {
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
  const { ids } = (await request.json()) as { ids: string[] };

  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  const results: Array<{ id: string; success: boolean; error?: string }> = [];

  for (const id of ids) {
    try {
      const agreement = await db.agreement.findFirst({
        where: { id, companyId },
        include: { stakeholder: true, bucket: true },
      });

      if (!agreement) {
        results.push({ id, success: false, error: "Not found" });
        continue;
      }

      if (agreement.status === "COMMITTED") {
        results.push({ id, success: false, error: "Already committed" });
        continue;
      }

      if (agreement.status === "FLAGGED") {
        results.push({
          id,
          success: false,
          error: "Has discrepancies — resolve before committing",
        });
        continue;
      }

      await db.$transaction(async (tx) => {
        let stakeholderId = agreement.stakeholderId;

        if (!stakeholderId && agreement.partyName) {
          const newStakeholder = await tx.stakeholder.create({
            data: {
              name: agreement.partyName,
              email:
                agreement.partyEmail ??
                `${agreement.partyName.toLowerCase().replace(/\s+/g, ".")}@placeholder.com`,
              companyId,
              stakeholderType: "INDIVIDUAL",
              currentRelationship:
                agreement.type === "CONTRACTOR" ? "CONSULTANT" : "INVESTOR",
            },
          });
          stakeholderId = newStakeholder.id;
        }

        if (!stakeholderId) {
          throw new Error("No stakeholder");
        }

        const shareClass = await tx.shareClass.findFirst({
          where: { companyId, name: agreement.shareClassName ?? "Class B" },
        });

        if (!shareClass) {
          throw new Error(`Share class "${agreement.shareClassName ?? "Class B"}" not found`);
        }

        const certificateId = `AGR-${generatePublicId()}`;
        const issueDate = agreement.effectiveDate ?? new Date();

        const share = await tx.share.create({
          data: {
            companyId,
            stakeholderId,
            shareClassId: shareClass.id,
            status: "ACTIVE",
            certificateId,
            quantity: agreement.quantity ?? 0,
            pricePerShare:
              agreement.type === "INVESTOR"
                ? (agreement.pricePerShare ?? 0)
                : 0,
            capitalContribution:
              agreement.type === "INVESTOR"
                ? (agreement.totalAmount ?? 0)
                : 0,
            vestingSchedule:
              agreement.type === "CONTRACTOR"
                ? "VESTING_4_3_1"
                : "VESTING_0_0_0",
            companyLegends: [],
            issueDate,
            boardApprovalDate: issueDate,
            vestingStartDate:
              agreement.type === "CONTRACTOR"
                ? (agreement.startDate ?? issueDate)
                : undefined,
          },
        });

        await tx.document.create({
          data: {
            companyId,
            publicId: generatePublicId(),
            name: agreement.bucket.name,
            bucketId: agreement.bucketId,
            shareId: share.id,
            uploaderId: session.user.memberId,
          },
        });

        await tx.agreement.update({
          where: { id: agreement.id },
          data: {
            status: "COMMITTED",
            shareId: share.id,
            stakeholderId,
          },
        });
      });

      results.push({ id, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to commit";
      results.push({ id, success: false, error: message });
    }
  }

  return NextResponse.json({ results });
}
