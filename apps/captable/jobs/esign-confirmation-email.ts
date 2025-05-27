import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import type { Job } from "pg-boss";

export type EsignConfirmationEmailPayloadType = {
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
  payload: EsignConfirmationEmailPayloadType,
) => {
  // Dynamic import to avoid build-time processing
  const { EsignConfirmationEmail, render } = await import("@captable/email");

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
    subject: `Document signed: ${payload.documentName}`,
    html,
  });
};

export class EsignConfirmationEmailJob extends BaseJob<EsignConfirmationEmailPayloadType> {
  readonly type = "email.esign-confirmation";

  async work(job: Job<EsignConfirmationEmailPayloadType>): Promise<void> {
    await sendEsignConfirmationEmail(job.data);
  }
}
