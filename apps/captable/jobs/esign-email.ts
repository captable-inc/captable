import { sendMail } from "@/server/mailer";
import { logger } from "@captable/logger";
import { BaseJob } from "@captable/queue";

const log = logger.child({ module: "esign-email-job" });

export type EsignEmailPayloadType = {
  documentName?: string;
  message?: string | null;
  recipient: {
    id: string;
    name: string | null | undefined;
    email: string;
  };
  sender?: {
    name: string | null | undefined;
    email: string | null | undefined;
  };
  company?: {
    name: string;
    logo: string | null | undefined;
  };
  signingLink: string;
};

const sendEsignEmail = async (payload: EsignEmailPayloadType) => {
  log.info(
    {
      recipientEmail: payload.recipient.email,
      documentName: payload.documentName,
      company: payload.company?.name,
    },
    "Sending esign email",
  );

  // Dynamic import to avoid build-time processing
  const { render } = await import("@captable/email");
  const { EsignEmail } = await import("@captable/email/templates");

  const html = await render(
    EsignEmail({
      signingLink: payload.signingLink,
      documentName: payload.documentName,
      message: payload.message,
      recipient: payload.recipient,
      sender: payload.sender,
      company: payload.company,
    }),
  );

  await sendMail({
    to: [payload.recipient.email],
    subject: `${payload.sender?.name} has sent you a document to sign`,
    html,
  });

  log.info(
    {
      recipientEmail: payload.recipient.email,
      documentName: payload.documentName,
      company: payload.company?.name,
    },
    "Esign email sent successfully",
  );
};

export { sendEsignEmail };

export class EsignEmailJob extends BaseJob<EsignEmailPayloadType> {
  readonly type = "email.esign-notification";
  protected readonly options = {
    maxAttempts: 3,
    retryDelay: 1500,
    priority: 2, // High priority for legal documents
  };

  async work(payload: EsignEmailPayloadType): Promise<void> {
    await sendEsignEmail(payload);
  }
}

// Create and register the job instance
const esignEmailJob = new EsignEmailJob();
esignEmailJob.register();

export { esignEmailJob };
