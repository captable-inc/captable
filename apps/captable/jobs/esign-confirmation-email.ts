import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import { EsignConfirmationEmail, renderAsync } from "@captable/email";
import type { Job } from "pg-boss";

export type ConfirmationEmailPayloadType = {
  fileUrl: string;
  documentName: string;
  senderName: string | null;
  senderEmail: string | null;
  company: {
    name: string;
    logo?: string | null;
  };
  recipient: { name?: string | null; email: string };
};

const sendEsignConfirmationEmail = async (
  payload: ConfirmationEmailPayloadType,
) => {
  const html = await renderAsync(
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
    subject: `Document signed: ${payload.documentName}`,
    html,
    attachments: [
      {
        filename: `${payload.documentName}.pdf`,
        path: payload.fileUrl,
      },
    ],
  });
};

export class EsignConfirmationEmailJob extends BaseJob<ConfirmationEmailPayloadType> {
  readonly type = "email.esign-confirmation";

  async work(job: Job<ConfirmationEmailPayloadType>): Promise<void> {
    await sendEsignConfirmationEmail(job.data);
  }
}
