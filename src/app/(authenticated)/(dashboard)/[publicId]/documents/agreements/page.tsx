import { PageLayout } from "@/components/dashboard/page-layout";
import { AgreementTable } from "@/components/agreements/agreement-table";
import { Button } from "@/components/ui/button";
import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import { RiAddFill, RiUploadCloud2Line } from "@remixicon/react";
import type { Metadata } from "next";
import Link from "next/link";
import EmptyState from "@/components/common/empty-state";

export const metadata: Metadata = {
  title: "Agreements",
};

const AgreementsPage = async ({
  params: { publicId },
}: {
  params: { publicId: string };
}) => {
  const session = await withServerSession();
  const companyId = session.user.companyId;

  const agreements = await db.agreement.findMany({
    where: { companyId },
    include: {
      stakeholder: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (agreements.length === 0) {
    return (
      <EmptyState
        icon={<RiUploadCloud2Line />}
        title="No agreements yet"
        subtitle="Upload PDF agreements to extract data and commit to the cap table."
      >
        <Link href={`/${publicId}/documents/agreements/upload`}>
          <Button>
            <RiAddFill className="mr-2 h-5 w-5" />
            Upload Agreements
          </Button>
        </Link>
      </EmptyState>
    );
  }

  // Serialize dates for client component
  const serialized = agreements.map((a) => ({
    ...a,
    effectiveDate: a.effectiveDate?.toISOString() ?? null,
    startDate: a.startDate?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-y-3">
      <PageLayout
        title="Agreements"
        description="Review and commit extracted agreement data to the cap table."
        action={
          <Link href={`/${publicId}/documents/agreements/upload`}>
            <Button>
              <RiAddFill className="mr-2 h-5 w-5" />
              Upload
            </Button>
          </Link>
        }
      />
      <AgreementTable agreements={serialized} publicId={publicId} />
    </div>
  );
};

export default AgreementsPage;
