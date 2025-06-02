import { sendMail } from "@/server/mailer";
import { logger } from "@captable/logger";
import { BaseJob } from "@captable/queue";

const log = logger.child({ module: "esign-confirmation-email-job" });

export type EsignConfirmationEmailPayloadType = {
  documentName: string;
  senderName: string | null;
  senderEmail: string | null;
  company: {
    name: string;
    logo?: string | null;
  };
  recipient: {
    name?: string | null;
    email: string;
  };
};

const sendEsignConfirmationEmail = async (
  payload: EsignConfirmationEmailPayloadType,
) => {
  log.info(
    {
      email: payload.recipient.email,
      document: payload.documentName,
      company: payload.company.name,
    },
    "Sending esign confirmation email",
  );

  // Dynamic import to avoid build-time processing
  const { render } = await import("@captable/email");
  const { EsignConfirmationEmail } = await import("@captable/email/templates");

  const html = await render(
    EsignConfirmationEmail({
      documentName: payload.documentName,
      recipient: payload.recipient,
      senderName: payload.senderName,
      senderEmail: payload.senderEmail,
      company: payload.company,
    }),
  );

  await sendMail({
    to: [payload.recipient.email],
    subject: `Document signed confirmation - ${payload.documentName}`,
    html,
  });

  log.info(
    {
      email: payload.recipient.email,
      document: payload.documentName,
      company: payload.company.name,
    },
    "Esign confirmation email sent successfully",
  );
};

export { sendEsignConfirmationEmail };

export class EsignConfirmationEmailJob extends BaseJob<EsignConfirmationEmailPayloadType> {
  readonly type = "email.esign-confirmation";
  protected readonly options = {
    maxAttempts: 3,
    retryDelay: 1000,
    priority: 1, // Normal priority for confirmations
  };

  async work(payload: EsignConfirmationEmailPayloadType): Promise<void> {
    await sendEsignConfirmationEmail(payload);
  }
}

// Create and register the job instance
const esignConfirmationEmailJob = new EsignConfirmationEmailJob();
esignConfirmationEmailJob.register();

export { esignConfirmationEmailJob };
