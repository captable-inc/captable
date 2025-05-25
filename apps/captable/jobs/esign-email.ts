import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { db, esignRecipients, templates, eq } from "@captable/db";
import { sendMail } from "@/server/mailer";
import { EsignEmail, renderAsync } from "@captable/email";
import type { Job } from "pg-boss";

export interface EsignEmailPayloadType {
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
}

export type ExtendedEsignPayloadType = EsignEmailPayloadType & {
  token: string;
};

const sendEsignEmail = async (payload: ExtendedEsignPayloadType) => {
  const { token, ...rest } = payload;
  const signingLink = `${env.NEXTAUTH_URL}/esign/${token}`;

  const html = await renderAsync(
    EsignEmail({
      signingLink,
      documentName: rest.documentName,
      message: rest.message,
      recipient: rest.recipient,
      sender: rest.sender,
      company: rest.company,
    }),
  );

  await sendMail({
    to: [payload.recipient.email],
    subject: `${payload.sender?.name} has sent you a document to sign`,
    html,
  });
};

export class EsignNotificationEmailJob extends BaseJob<ExtendedEsignPayloadType> {
  readonly type = "email.esign-notification";

  async work(job: Job<ExtendedEsignPayloadType>): Promise<void> {
    await db.transaction(async (tx) => {
      const [recipient] = await tx
        .update(esignRecipients)
        .set({ status: "SENT" })
        .where(eq(esignRecipients.id, job.data.recipient.id))
        .returning();

      if (!recipient) {
        throw new Error(`Recipient with id ${job.data.recipient.id} not found`);
      }

      await tx
        .update(templates)
        .set({ status: "SENT" })
        .where(eq(templates.id, recipient.templateId));
    });

    await sendEsignEmail(job.data);
  }
}
