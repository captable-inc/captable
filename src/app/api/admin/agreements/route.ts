import { NextResponse } from "next/server";
import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import type { AgreementStatus } from "@prisma/client";

export async function GET(request: Request) {
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
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as AgreementStatus | null;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const skip = (page - 1) * limit;

  const where = {
    companyId,
    ...(status ? { status } : {}),
  };

  const [agreements, total] = await Promise.all([
    db.agreement.findMany({
      where,
      include: {
        stakeholder: { select: { id: true, name: true, email: true } },
        bucket: { select: { id: true, key: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.agreement.count({ where }),
  ]);

  return NextResponse.json({
    agreements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
