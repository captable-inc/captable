import { NextResponse } from "next/server";
import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import { customId } from "@/common/id";
import { extractTextFromPdf } from "@/server/pdf-extract";
import { extractAgreementData } from "@/server/agreement-ai";
import { matchStakeholder } from "@/server/agreement-match";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";
import path from "node:path";
import slugify from "@sindresorhus/slugify";

export const maxDuration = 120;

const S3Internal = new S3Client({
  region: env.UPLOAD_REGION,
  endpoint: "http://minio:9000",
  forcePathStyle: true,
  credentials:
    env.UPLOAD_ACCESS_KEY_ID && env.UPLOAD_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.UPLOAD_ACCESS_KEY_ID,
          secretAccessKey: env.UPLOAD_SECRET_ACCESS_KEY,
        }
      : undefined,
});

const privateBucket = env.UPLOAD_BUCKET_PRIVATE;

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

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 },
      );
    }

    const results = [];

    for (const file of files) {
      if (file.type !== "application/pdf") {
        results.push({
          filename: file.name,
          error: "Only PDF files are accepted",
        });
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const { name, ext } = path.parse(file.name);
      const key = `${companyId}/agreements/${customId(12)}-${slugify(name)}${ext}`;

      // Upload to MinIO
      await S3Internal.send(
        new PutObjectCommand({
          Bucket: privateBucket,
          Key: key,
          Body: buffer,
          ContentType: "application/pdf",
        }),
      );

      // Create Bucket record
      const bucket = await db.bucket.create({
        data: {
          name: file.name,
          key,
          mimeType: "application/pdf",
          size: buffer.length,
          tags: ["agreement"],
        },
      });

      // Extract text from PDF
      let rawText = "";
      try {
        rawText = await extractTextFromPdf(buffer);
      } catch (err) {
        results.push({
          filename: file.name,
          error: "Failed to extract text from PDF",
        });
        continue;
      }

      // AI extraction
      const { data: extracted, raw: aiResponse, error: aiError } =
        await extractAgreementData(rawText);

      // Auto-match stakeholder
      let stakeholderId: string | null = null;
      let matchConfidence = 0;
      let discrepancies: string[] = [];

      if (extracted?.party_name) {
        const match = await matchStakeholder(
          extracted.party_name,
          extracted.party_email ?? null,
          companyId,
        );
        if (match.stakeholder) {
          stakeholderId = match.stakeholder.id;
          matchConfidence = match.confidence;
        }
      }

      if (aiError) {
        discrepancies.push(aiError);
      }

      // Determine status
      const status =
        discrepancies.length > 0 || !extracted
          ? "FLAGGED"
          : "PENDING_REVIEW";

      // Create Agreement record
      const agreement = await db.agreement.create({
        data: {
          type: extracted?.type === "INVESTOR" ? "INVESTOR" : "CONTRACTOR",
          status: status as "FLAGGED" | "PENDING_REVIEW",
          partyName: extracted?.party_name ?? null,
          partyEmail: extracted?.party_email ?? null,
          role: extracted?.role ?? null,
          effectiveDate: extracted?.effective_date
            ? new Date(extracted.effective_date)
            : null,
          startDate: extracted?.start_date
            ? new Date(extracted.start_date)
            : null,
          quantity: extracted?.quantity ?? null,
          unitsPerPeriod: extracted?.units_per_period ?? null,
          vestingPeriods: extracted?.vesting_periods ?? null,
          shareClassName: extracted?.share_class ?? "Class B",
          pricePerShare: extracted?.price_per_share ?? null,
          totalAmount: extracted?.total_amount ?? null,
          vestingCliffDays: extracted?.vesting_cliff_days ?? 90,
          vestingPeriodMonths: extracted?.vesting_period_months ?? 24,
          rawText,
          aiResponse,
          matchConfidence,
          discrepancies:
            discrepancies.length > 0 ? JSON.stringify(discrepancies) : null,
          stakeholderId,
          bucketId: bucket.id,
          companyId,
        },
        include: {
          stakeholder: true,
        },
      });

      results.push({
        id: agreement.id,
        filename: file.name,
        type: agreement.type,
        status: agreement.status,
        partyName: agreement.partyName,
        stakeholder: agreement.stakeholder?.name ?? null,
        matchConfidence: agreement.matchConfidence,
      });
    }

    return NextResponse.json({ agreements: results });
  } catch (err) {
    console.error("Agreement upload error:", err);
    return NextResponse.json(
      { error: "Failed to process agreements" },
      { status: 500 },
    );
  }
}
