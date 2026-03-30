import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: { confirmPhrase?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.confirmPhrase !== "FIX_KENNETH") {
    return NextResponse.json({ error: "Invalid confirmation" }, { status: 403 });
  }

  let session;
  try {
    session = await withServerSession();
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "No company" }, { status: 401 });
  }

  const companyId = session.user.companyId;

  try {
    // Get all the key stakeholders
    const todd = await db.stakeholder.findFirst({
      where: { email: "toddm@fastmail.com", companyId },
    });
    const scott = await db.stakeholder.findFirst({
      where: { email: "scott.bayless@gmail.com", companyId },
    });
    const kenneth = await db.stakeholder.findFirst({
      where: { email: "aytchco@gmail.com", companyId },
    });

    if (!todd || !scott || !kenneth) {
      return NextResponse.json({
        error: "Could not find all three founders",
        found: { todd: !!todd, scott: !!scott, kenneth: !!kenneth },
      }, { status: 400 });
    }

    const classA = await db.shareClass.findFirst({
      where: { companyId, name: "Class A" },
    });
    const classC = await db.shareClass.findFirst({
      where: { companyId, name: "Class C" },
    });

    if (!classA || !classC) {
      return NextResponse.json({ error: "Missing share classes" }, { status: 400 });
    }

    // Step 1: Get total of ALL shares that are NOT Todd, Scott, or Kenneth's Class C
    // This is the "dilutable pool" - Class B shares from everyone (including Kenneth's Class B)
    const founderIds = [todd.id, scott.id];

    // Get Kenneth's Class C share to exclude it
    const kennethClassCShare = await db.share.findFirst({
      where: { stakeholderId: kenneth.id, shareClassId: classC.id, companyId },
    });

    // Sum ALL shares
    const allSharesAgg = await db.share.aggregate({
      where: { companyId },
      _sum: { quantity: true },
    });

    // Sum Todd's Class A shares
    const toddAShares = await db.share.aggregate({
      where: { stakeholderId: todd.id, shareClassId: classA.id, companyId },
      _sum: { quantity: true },
    });

    // Sum Scott's Class A shares  
    const scottAShares = await db.share.aggregate({
      where: { stakeholderId: scott.id, shareClassId: classA.id, companyId },
      _sum: { quantity: true },
    });

    // Sum Kenneth's Class C shares
    const kennethCShares = await db.share.aggregate({
      where: { stakeholderId: kenneth.id, shareClassId: classC.id, companyId },
      _sum: { quantity: true },
    });

    // The "base pool" is everything except the undilutable holders' special shares
    const currentTotal = allSharesAgg._sum.quantity ?? 0;
    const currentToddA = toddAShares._sum.quantity ?? 0;
    const currentScottA = scottAShares._sum.quantity ?? 0;
    const currentKennethC = kennethCShares._sum.quantity ?? 0;

    const basePool = currentTotal - currentToddA - currentScottA - currentKennethC;

    // Now calculate what each undilutable holder needs:
    // Todd = 23%, Scott = 23%, Kenneth = 10%, basePool = 44%
    // Total = basePool / 0.44
    // Todd shares = Total * 0.23
    // Scott shares = Total * 0.23
    // Kenneth C shares = Total * 0.10

    const grandTotal = Math.round(basePool / 0.44);
    const founderShares = Math.round(grandTotal * 0.23);
    const kennethShares = Math.round(grandTotal * 0.10);

    // Update Todd's Class A
    const toddShare = await db.share.findFirst({
      where: { stakeholderId: todd.id, shareClassId: classA.id, companyId },
    });
    if (toddShare) {
      await db.share.update({
        where: { id: toddShare.id },
        data: { quantity: founderShares },
      });
    }

    // Update Scott's Class A
    const scottShare = await db.share.findFirst({
      where: { stakeholderId: scott.id, shareClassId: classA.id, companyId },
    });
    if (scottShare) {
      await db.share.update({
        where: { id: scottShare.id },
        data: { quantity: founderShares },
      });
    }

    // Update Kenneth's Class C
    if (kennethClassCShare) {
      await db.share.update({
        where: { id: kennethClassCShare.id },
        data: { quantity: kennethShares },
      });
    }

    // Verify
    const verifyTotal = basePool + founderShares * 2 + kennethShares;

    return NextResponse.json({
      success: true,
      summary: {
        basePool,
        grandTotal: verifyTotal,
        toddShares: founderShares,
        toddPct: `${((founderShares / verifyTotal) * 100).toFixed(2)}%`,
        scottShares: founderShares,
        scottPct: `${((founderShares / verifyTotal) * 100).toFixed(2)}%`,
        kennethCShares: kennethShares,
        kennethPct: `${((kennethShares / verifyTotal) * 100).toFixed(2)}%`,
        othersPool: basePool,
        othersPct: `${((basePool / verifyTotal) * 100).toFixed(2)}%`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed", details: String(error) },
      { status: 500 },
    );
  }
}
