import { NextResponse } from "next/server";
import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import { generatePublicId } from "@/common/id";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
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

  const agreement = await db.agreement.findFirst({
    where: { id: params.id, companyId },
    include: { stakeholder: true, bucket: true },
  });

  if (!agreement) {
    return NextResponse.json(
      { error: "Agreement not found" },
      { status: 404 },
    );
  }

  if (agreement.status === "COMMITTED") {
    return NextResponse.json(
      { error: "Agreement already committed" },
      { status: 400 },
    );
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // Find or create stakeholder
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
        throw new Error("No stakeholder found or could be created");
      }

      // Find the share class (look for Class B or fall back to first available)
      const shareClass = await tx.shareClass.findFirst({
        where: {
          companyId,
          name: agreement.shareClassName ?? "Class B",
        },
      });

      if (!shareClass) {
        throw new Error(
          `Share class "${agreement.shareClassName ?? "Class B"}" not found. Please create it first.`,
        );
      }

      // Create Share record
      const certificateId = `AGR-${generatePublicId()}`;
      const issueDate = agreement.effectiveDate ?? new Date();

      const shareData: Parameters<typeof tx.share.create>[0]["data"] = {
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
      };

      const share = await tx.share.create({ data: shareData });

      // Create Document record linking the bucket
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

      // Update agreement
      const updated = await tx.agreement.update({
        where: { id: agreement.id },
        data: {
          status: "COMMITTED",
          shareId: share.id,
          stakeholderId,
        },
        include: { stakeholder: true },
      });

      return { agreement: updated, share };
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to commit";
    console.error("Agreement commit error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
