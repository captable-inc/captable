import { NextResponse } from "next/server";
import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";

export async function GET(
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

  const agreement = await db.agreement.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
    include: {
      stakeholder: true,
      bucket: true,
    },
  });

  if (!agreement) {
    return NextResponse.json(
      { error: "Agreement not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(agreement);
}

export async function PUT(
  request: Request,
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

  const body = await request.json();

  const existing = await db.agreement.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Agreement not found" },
      { status: 404 },
    );
  }

  const agreement = await db.agreement.update({
    where: { id: params.id },
    data: {
      partyName: body.partyName ?? existing.partyName,
      partyEmail: body.partyEmail ?? existing.partyEmail,
      role: body.role ?? existing.role,
      type: body.type ?? existing.type,
      effectiveDate: body.effectiveDate
        ? new Date(body.effectiveDate)
        : existing.effectiveDate,
      startDate: body.startDate
        ? new Date(body.startDate)
        : existing.startDate,
      quantity: body.quantity != null ? parseInt(body.quantity) : existing.quantity,
      unitsPerPeriod:
        body.unitsPerPeriod != null
          ? parseInt(body.unitsPerPeriod)
          : existing.unitsPerPeriod,
      vestingPeriods:
        body.vestingPeriods != null
          ? parseInt(body.vestingPeriods)
          : existing.vestingPeriods,
      vestingCliffDays:
        body.vestingCliffDays != null
          ? parseInt(body.vestingCliffDays)
          : existing.vestingCliffDays,
      vestingPeriodMonths:
        body.vestingPeriodMonths != null
          ? parseInt(body.vestingPeriodMonths)
          : existing.vestingPeriodMonths,
      pricePerShare:
        body.pricePerShare != null
          ? parseFloat(body.pricePerShare)
          : existing.pricePerShare,
      totalAmount:
        body.totalAmount != null
          ? parseFloat(body.totalAmount)
          : existing.totalAmount,
      stakeholderId: body.stakeholderId ?? existing.stakeholderId,
      status: body.status ?? existing.status,
    },
    include: {
      stakeholder: true,
      bucket: true,
    },
  });

  return NextResponse.json(agreement);
}
