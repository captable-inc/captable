import { PageLayout } from "@/components/dashboard/page-layout";
import { UploadForm } from "@/components/agreements/upload-form";
import { withServerSession } from "@/server/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Agreements",
};

const UploadAgreementsPage = async ({
  params: { publicId },
}: {
  params: { publicId: string };
}) => {
  await withServerSession();

  return (
    <div className="flex flex-col gap-y-3">
      <PageLayout
        title="Upload Agreements"
        description="Upload PDF agreements for AI-powered data extraction and review."
      />
      <div className="mx-auto w-full max-w-2xl">
        <UploadForm publicId={publicId} />
      </div>
    </div>
  );
};

export default UploadAgreementsPage;
