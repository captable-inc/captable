import { generatePublicId } from "@/common/id";
import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export const maxDuration = 120;

interface ImportEntry {
  name: string;
  original_name: string;
  email: string;
  units: number;
  type: "team" | "investor";
  is_continuation: boolean;
}

export async function POST(request: Request) {
  let body: {
    confirmPhrase?: string;
    data?: { team: ImportEntry[]; investors: ImportEntry[] };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.confirmPhrase !== "IMPORT_CAP_TABLE") {
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
  const allEntries = [
    ...(body.data?.team || []),
    ...(body.data?.investors || []),
  ];

  if (allEntries.length === 0) {
    return NextResponse.json({ error: "No entries" }, { status: 400 });
  }

  const stats = {
    shareClassesCreated: 0,
    stakeholdersCreated: 0,
    sharesCreated: 0,
    errors: [] as string[],
  };

  try {
    // ── 1. Create Share Classes ──────────────────────────────

    let classAId: string;
    let classBId: string;

    const existingA = await db.shareClass.findFirst({
      where: { companyId, name: "Class A" },
    });
    if (existingA) {
      classAId = existingA.id;
    } else {
      const classA = await db.shareClass.create({
        data: {
          idx: 1,
          name: "Class A",
          classType: "COMMON",
          prefix: "CS",
          initialSharesAuthorized: BigInt(1500000),
          boardApprovalDate: new Date("2022-01-01"),
          stockholderApprovalDate: new Date("2022-01-01"),
          votesPerShare: 10,
          parValue: 0.001,
          pricePerShare: 0.001,
          seniority: 1,
          conversionRights: "CONVERTS_TO_FUTURE_ROUND",
          liquidationPreferenceMultiple: 1.0,
          participationCapMultiple: 1.0,
          companyId,
        },
      });
      classAId = classA.id;
      stats.shareClassesCreated++;
    }

    const existingB = await db.shareClass.findFirst({
      where: { companyId, name: "Class B" },
    });
    if (existingB) {
      classBId = existingB.id;
    } else {
      const classB = await db.shareClass.create({
        data: {
          idx: 2,
          name: "Class B",
          classType: "COMMON",
          prefix: "CS",
          initialSharesAuthorized: BigInt(5000000),
          boardApprovalDate: new Date("2022-01-01"),
          stockholderApprovalDate: new Date("2022-01-01"),
          votesPerShare: 1,
          parValue: 0.001,
          pricePerShare: 0.001,
          seniority: 2,
          conversionRights: "CONVERTS_TO_FUTURE_ROUND",
          liquidationPreferenceMultiple: 1.0,
          participationCapMultiple: 1.0,
          companyId,
        },
      });
      classBId = classB.id;
      stats.shareClassesCreated++;
    }

    // ── 2. Build email lookup for continuation grants ────────
    // Continuation grants (e.g. "Kenneth Harper ++ start 07072025") have no email.
    // Find the email from the base entry with the same cleaned name.

    const nameToEmail = new Map<string, string>();
    for (const entry of allEntries) {
      if (entry.email) {
        nameToEmail.set(entry.name.toLowerCase(), entry.email.toLowerCase().trim());
      }
    }

    // ── 3. Stakeholder cache ─────────────────────────────────
    const stakeholderCache = new Map<string, string>(); // email -> stakeholderId

    async function getOrCreateStakeholder(
      name: string,
      email: string,
      relationship: "FOUNDER" | "CONSULTANT" | "INVESTOR",
    ): Promise<string> {
      const emailKey = email.toLowerCase().trim();
      if (stakeholderCache.has(emailKey)) {
        return stakeholderCache.get(emailKey)!;
      }

      let stakeholder = await db.stakeholder.findFirst({
        where: { email: emailKey, companyId },
      });

      if (!stakeholder) {
        stakeholder = await db.stakeholder.create({
          data: {
            name,
            email: emailKey,
            stakeholderType: "INDIVIDUAL",
            currentRelationship: relationship,
            companyId,
          },
        });
        stats.stakeholdersCreated++;
      }

      stakeholderCache.set(emailKey, stakeholder.id);
      return stakeholder.id;
    }

    // ── 4. Process each entry ────────────────────────────────
    let certCounter = 1;

    for (const entry of allEntries) {
      try {
        if (entry.units <= 0) continue;

        // Resolve email: use entry email, or look up from base name
        let email = entry.email?.trim() || "";
        if (!email) {
          email = nameToEmail.get(entry.name.toLowerCase()) || "";
        }
        if (!email) {
          // Generate placeholder
          email = `${entry.name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@placeholder.launchlegends.io`;
        }

        // Determine relationship
        const isFounder =
          entry.name === "Todd Mortenson" || entry.name === "Scott Bayless";
        let relationship: "FOUNDER" | "CONSULTANT" | "INVESTOR" = "CONSULTANT";
        if (isFounder) {
          relationship = "FOUNDER";
        } else if (entry.type === "investor") {
          relationship = "INVESTOR";
        }

        const stakeholderId = await getOrCreateStakeholder(
          entry.name,
          email,
          relationship,
        );

        // Determine share class
        const isClassA = isFounder;
        const shareClassId = isClassA ? classAId : classBId;

        // Generate certificate ID
        const prefix = entry.type === "investor" ? "INV" : "SH";
        const certId = `${prefix}-${String(certCounter).padStart(4, "0")}`;
        certCounter++;

        // Parse vesting start date from original_name if present
        let vestingStartDate: Date | null = null;
        const dateMatch = entry.original_name?.match(
          /start\s*(\d{2})(\d{2})(\d{4})/,
        );
        if (dateMatch) {
          const [, mm, dd, yyyy] = dateMatch;
          vestingStartDate = new Date(`${yyyy}-${mm}-${dd}`);
        }

        await db.share.create({
          data: {
            certificateId: certId,
            status: "ACTIVE",
            quantity: entry.units,
            pricePerShare: entry.type === "investor" ? 3.0 : 0.001,
            vestingSchedule: "VESTING_0_0_0",
            issueDate: vestingStartDate || new Date("2022-10-01"),
            vestingStartDate: vestingStartDate,
            boardApprovalDate: new Date("2022-10-01"),
            stakeholderId,
            companyId,
            shareClassId,
          },
        });
        stats.sharesCreated++;
      } catch (err) {
        stats.errors.push(
          `Error for ${entry.name} (${entry.original_name}): ${String(err)}`,
        );
      }
    }

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json(
      { error: "Import failed", details: String(error), stats },
      { status: 500 },
    );
  }
}
