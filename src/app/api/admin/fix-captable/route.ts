import { generatePublicId } from "@/common/id";
import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export const maxDuration = 120;

interface InvestorPricing {
  name: string;
  email: string;
  units: number;
  pricePerShare: number;
  capitalContribution: number;
}

export async function POST(request: Request) {
  let body: {
    confirmPhrase?: string;
    investorPricing?: InvestorPricing[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.confirmPhrase !== "FIX_CAP_TABLE") {
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
  const stats = {
    investorSharesUpdated: 0,
    classCCreated: false,
    kennethSharesCreated: false,
    errors: [] as string[],
  };

  try {
    // ── 1. Fix investor capital contributions & price per share ──

    const investorPricing = body.investorPricing || [];

    for (const inv of investorPricing) {
      try {
        // Find the stakeholder by email
        const email = inv.email?.toLowerCase().trim();
        if (!email) continue;

        const stakeholder = await db.stakeholder.findFirst({
          where: { email, companyId },
        });
        if (!stakeholder) {
          stats.errors.push(`Stakeholder not found: ${inv.name} (${email})`);
          continue;
        }

        // Find their investor share (INV- certificate prefix, or match by quantity)
        const shares = await db.share.findMany({
          where: {
            stakeholderId: stakeholder.id,
            companyId,
            quantity: inv.units,
          },
        });

        for (const share of shares) {
          await db.share.update({
            where: { id: share.id },
            data: {
              pricePerShare: inv.pricePerShare,
              capitalContribution: inv.capitalContribution,
            },
          });
          stats.investorSharesUpdated++;
        }
      } catch (err) {
        stats.errors.push(`Error updating ${inv.name}: ${String(err)}`);
      }
    }

    // ── 2. Create Class C share class ──

    let classCId: string;
    const existingC = await db.shareClass.findFirst({
      where: { companyId, name: "Class C" },
    });

    if (existingC) {
      classCId = existingC.id;
    } else {
      // Get the next idx
      const maxIdx = await db.shareClass.aggregate({
        where: { companyId },
        _max: { idx: true },
      });
      const nextIdx = (maxIdx._max.idx ?? 0) + 1;

      const classC = await db.shareClass.create({
        data: {
          idx: nextIdx,
          name: "Class C",
          classType: "COMMON",
          prefix: "CS",
          initialSharesAuthorized: BigInt(1000000),
          boardApprovalDate: new Date("2026-01-01"),
          stockholderApprovalDate: new Date("2026-01-01"),
          votesPerShare: 1,
          parValue: 0.001,
          pricePerShare: 0.001,
          seniority: 3,
          conversionRights: "CONVERTS_TO_FUTURE_ROUND",
          liquidationPreferenceMultiple: 1.0,
          participationCapMultiple: 1.0,
          companyId,
        },
      });
      classCId = classC.id;
      stats.classCCreated = true;
    }

    // ── 3. Calculate Kenneth's 10% undilutable shares ──
    // Total shares currently issued (all classes)
    const totalSharesAgg = await db.share.aggregate({
      where: { companyId },
      _sum: { quantity: true },
    });
    const currentTotalShares = totalSharesAgg._sum.quantity ?? 0;

    // Kenneth needs 10% of the TOTAL (including his new shares)
    // If current = X, and Kenneth gets Y, then Y / (X + Y) = 0.10
    // Y = 0.10 * (X + Y) => Y = 0.10X + 0.10Y => 0.90Y = 0.10X => Y = X/9
    const kennethShares = Math.round(currentTotalShares / 9);

    // Find or create Kenneth's stakeholder
    let kenneth = await db.stakeholder.findFirst({
      where: {
        email: "aytchco@gmail.com",
        companyId,
      },
    });

    if (!kenneth) {
      kenneth = await db.stakeholder.create({
        data: {
          name: "Kenneth Harper",
          email: "aytchco@gmail.com",
          stakeholderType: "INDIVIDUAL",
          currentRelationship: "CONSULTANT",
          companyId,
        },
      });
    }

    // Check if Kenneth already has Class C shares
    const existingClassCShares = await db.share.findFirst({
      where: {
        stakeholderId: kenneth.id,
        shareClassId: classCId,
        companyId,
      },
    });

    if (!existingClassCShares) {
      await db.share.create({
        data: {
          certificateId: "SH-C-0001",
          status: "ACTIVE",
          quantity: kennethShares,
          pricePerShare: 0.001,
          vestingSchedule: "VESTING_0_0_0",
          issueDate: new Date("2026-01-01"),
          boardApprovalDate: new Date("2026-01-01"),
          stakeholderId: kenneth.id,
          companyId,
          shareClassId: classCId,
        },
      });
      stats.kennethSharesCreated = true;
    }

    // ── 4. Recalculate Todd & Scott's Class A shares for 23% each ──
    // After adding Kenneth's shares, recalculate total
    const newTotalAgg = await db.share.aggregate({
      where: { companyId },
      _sum: { quantity: true },
    });
    const newTotal = newTotalAgg._sum.quantity ?? 0;

    // Todd and Scott each need 23% of the grand total (including their shares)
    // If T = Todd's shares, and Rest = everything except Todd and Scott
    // T / Total = 0.23, and Total = Rest + T + S (where T = S)
    // So Total = Rest + 2T, and T = 0.23 * Total = 0.23 * (Rest + 2T)
    // T = 0.23*Rest + 0.46*T => 0.54*T = 0.23*Rest => T = 0.23*Rest/0.54

    // Get current non-Todd/Scott total
    const toddStakeholder = await db.stakeholder.findFirst({
      where: { email: "toddm@fastmail.com", companyId },
    });
    const scottStakeholder = await db.stakeholder.findFirst({
      where: { email: "scott.bayless@gmail.com", companyId },
    });

    const classA = await db.shareClass.findFirst({
      where: { companyId, name: "Class A" },
    });

    if (toddStakeholder && scottStakeholder && classA) {
      // Sum all shares NOT belonging to Todd or Scott
      const othersAgg = await db.share.aggregate({
        where: {
          companyId,
          stakeholderId: {
            notIn: [toddStakeholder.id, scottStakeholder.id],
          },
        },
        _sum: { quantity: true },
      });
      const othersTotal = othersAgg._sum.quantity ?? 0;

      // Each founder needs 23%: T / (othersTotal + 2T) = 0.23
      // T = 0.23 * othersTotal / (1 - 2*0.23) = 0.23 * othersTotal / 0.54
      const founderShares = Math.round((0.23 * othersTotal) / 0.54);

      // Update Todd's Class A shares
      const toddShare = await db.share.findFirst({
        where: {
          stakeholderId: toddStakeholder.id,
          shareClassId: classA.id,
          companyId,
        },
      });
      if (toddShare) {
        await db.share.update({
          where: { id: toddShare.id },
          data: { quantity: founderShares },
        });
      }

      // Update Scott's Class A shares
      const scottShare = await db.share.findFirst({
        where: {
          stakeholderId: scottStakeholder.id,
          shareClassId: classA.id,
          companyId,
        },
      });
      if (scottShare) {
        await db.share.update({
          where: { id: scottShare.id },
          data: { quantity: founderShares },
        });
      }

      // Verify final percentages
      const finalTotal = othersTotal + founderShares * 2;
      const toddPct = ((founderShares / finalTotal) * 100).toFixed(2);
      const scottPct = ((founderShares / finalTotal) * 100).toFixed(2);

      return NextResponse.json({
        success: true,
        stats,
        summary: {
          totalRaised: investorPricing.reduce(
            (sum, i) => sum + i.capitalContribution,
            0,
          ),
          kennethClassCShares: kennethShares,
          founderSharesEach: founderShares,
          toddPct: `${toddPct}%`,
          scottPct: `${scottPct}%`,
          kennethPct: `${((kennethShares / (othersTotal + founderShares * 2)) * 100).toFixed(2)}%`,
          totalShares: othersTotal + founderShares * 2,
        },
      });
    }

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed", details: String(error), stats },
      { status: 500 },
    );
  }
}
