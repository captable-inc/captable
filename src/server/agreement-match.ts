import { db } from "@/server/db";
import type { Stakeholder } from "@prisma/client";

interface MatchResult {
  stakeholder: Stakeholder | null;
  confidence: number;
  method: "email" | "name" | "none";
}

function normalizeStr(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function stringSimilarity(a: string, b: string): number {
  const na = normalizeStr(a);
  const nb = normalizeStr(b);

  if (na === nb) return 1.0;
  if (na.includes(nb) || nb.includes(na)) return 0.85;

  // Simple word overlap similarity
  const wordsA = na.split(" ");
  const wordsB = nb.split(" ");
  const intersection = wordsA.filter((w) => wordsB.includes(w));
  const union = new Set([...wordsA, ...wordsB]);

  if (union.size === 0) return 0;
  return intersection.length / union.size;
}

export async function matchStakeholder(
  name: string,
  email: string | null,
  companyId: string,
): Promise<MatchResult> {
  // Try exact email match first
  if (email) {
    const byEmail = await db.stakeholder.findFirst({
      where: { email, companyId },
    });
    if (byEmail) {
      return { stakeholder: byEmail, confidence: 1.0, method: "email" };
    }
  }

  // Try name matching
  const stakeholders = await db.stakeholder.findMany({
    where: { companyId },
  });

  let bestMatch: Stakeholder | null = null;
  let bestScore = 0;

  for (const s of stakeholders) {
    const score = stringSimilarity(name, s.name);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = s;
    }
  }

  if (bestMatch && bestScore >= 0.7) {
    return { stakeholder: bestMatch, confidence: bestScore, method: "name" };
  }

  return { stakeholder: null, confidence: 0, method: "none" };
}
