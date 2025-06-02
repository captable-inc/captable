import {
  type EsignGetTemplateType,
  completeEsignDocuments,
  generateEsignPdf,
  uploadEsignDocuments,
} from "@/server/esign";
import { getPresignedGetUrl } from "@/server/file-uploads";
import { db } from "@captable/db";
import { logger } from "@captable/logger";
import { BaseJob } from "@captable/queue";
import { esignConfirmationEmailJob } from "./esign-confirmation-email";

const log = logger.child({ module: "esign-pdf-job" });

export type EsignPdfPayloadType = {
  fields: EsignGetTemplateType["fields"];
  company: {
    name: string;
    logo?: string | null | undefined;
  };
  data: Record<string, string>;
  templateId: string;
  requestIp: string;
  userAgent: string;
  audits: {
    id: string;
    summary: string;
    action: string;
    occurredAt: Date;
  }[];
  bucketKey: string;
  templateName: string;
  companyId: string;
  recipients: { email: string; name?: string | null }[];
  sender: { email: string; name?: string | null };
};

export class EsignPdfJob extends BaseJob<EsignPdfPayloadType> {
  readonly type = "generate.esign-pdf";
  protected readonly options = {
    maxAttempts: 2, // PDF generation is heavy, limit retries
    retryDelay: 5000, // Longer delay for PDF processing
    priority: 3, // High priority for document processing
  };

  async work(payload: EsignPdfPayloadType): Promise<void> {
    const {
      bucketKey,
      data,
      audits,
      fields,
      companyId,
      templateName,
      requestIp,
      userAgent,
      sender,
      templateId,
      recipients,
      company,
    } = payload;

    log.info(
      {
        templateId,
        templateName,
        companyId,
        recipientCount: recipients.length,
      },
      "Starting esign PDF generation",
    );

    try {
      const modifiedPdfBytes = await generateEsignPdf({
        bucketKey,
        data,
        fields,
        audits,
        templateName,
      });

      log.info(
        {
          templateId,
          templateName,
          pdfSize: modifiedPdfBytes.length,
        },
        "PDF generated successfully",
      );

      const { fileUrl: _fileUrl, ...bucketData } = await uploadEsignDocuments({
        buffer: Buffer.from(modifiedPdfBytes),
        companyId,
        templateName,
      });

      log.info(
        {
          templateId,
          bucketKey: bucketData.key,
        },
        "PDF uploaded to storage",
      );

      await db.transaction(async (tx) => {
        await completeEsignDocuments({
          bucketData: bucketData,
          companyId,
          db: tx,
          requestIp,
          templateId,
          templateName,
          uploaderName: sender.name || "Captable",
          userAgent,
        });
      });

      log.info(
        {
          templateId,
          templateName,
        },
        "Esign documents completed in database",
      );

      const _file = await getPresignedGetUrl(bucketData.key);

      // Send confirmation emails to all recipients
      const emailPromises = recipients.map((recipient) =>
        esignConfirmationEmailJob.emit({
          documentName: templateName,
          recipient,
          company,
          senderName: sender.name || "Captable",
          senderEmail: sender.email as string,
        }),
      );

      await Promise.all(emailPromises);

      log.info(
        {
          templateId,
          templateName,
          recipientCount: recipients.length,
        },
        "Esign PDF job completed successfully",
      );
    } catch (error) {
      log.error(
        {
          templateId,
          templateName,
          error: error instanceof Error ? error.message : String(error),
        },
        "Esign PDF job failed",
      );
      throw error;
    }
  }
}

// Create and register the job instance
const esignPdfJob = new EsignPdfJob();
esignPdfJob.register();

export { esignPdfJob };
