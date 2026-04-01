import { AgreementReview } from "@/components/agreements/agreement-review";
import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import { getPresignedGetUrl } from "@/server/file-uploads";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Review Agreement",
};

const AgreementDetailPage = async ({
  params: { publicId, agreementId },
}: {
  params: { publicId: string; agreementId: string };
}) => {
  const session = await withServerSession();
  const companyId = session.user.companyId;

  const agreement = await db.agreement.findFirst({
    where: { id: agreementId, companyId },
    include: {
      stakeholder: { select: { id: true, name: true, email: true } },
      bucket: { select: { id: true, key: true, name: true } },
    },
  });

  if (!agreement) {
    notFound();
  }

  // Get presigned URL for the PDF
  const { url: pdfUrl } = await getPresignedGetUrl(agreement.bucket.key);

  // Serialize dates for client component
  const serialized = {
    ...agreement,
    effectiveDate: agreement.effectiveDate?.toISOString() ?? null,
    startDate: agreement.startDate?.toISOString() ?? null,
    createdAt: agreement.createdAt.toISOString(),
    updatedAt: agreement.updatedAt.toISOString(),
  };

  return (
    <AgreementReview
      agreement={serialized}
      pdfUrl={pdfUrl}
      publicId={publicId}
    />
  );
};

export default AgreementDetailPage;
