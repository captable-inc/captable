import { checkMembership } from "@/server/auth";
import { deleteBucketFile } from "@/server/file-uploads";
import { withAuth } from "@/trpc/api/trpc";
import { z } from "zod";

export const deleteDocumentProcedure = withAuth
  .input(z.object({ documentId: z.string() }))
  .mutation(async ({ ctx: { db, session }, input }) => {
    const { companyId } = await checkMembership({ tx: db, session });

    const document = await db.document.findFirstOrThrow({
      where: {
        id: input.documentId,
        companyId,
      },
      include: { bucket: true },
    });

    // Delete from MinIO
    try {
      await deleteBucketFile(document.bucket.key);
    } catch (e) {
      console.error("Failed to delete file from storage:", e);
    }

    // Delete document shares
    await db.documentShare.deleteMany({
      where: { documentId: document.id },
    });

    // Delete the document record
    await db.document.delete({ where: { id: document.id } });

    // Delete the bucket record
    await db.bucket.delete({ where: { id: document.bucket.id } });

    return { success: true };
  });
