import EsignEmail from "@/emails/EsignEmail";
import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { db, esignRecipients, templates, eq } from "@captable/db";
import { sendMail } from "@/server/mailer";
import { renderAsync } from "@react-email/components";
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

interface AdditionalPayloadType {
  email: string;
  token: string;
}

export type ExtendedEsignPayloadType = EsignEmailPayloadType &
  AdditionalPayloadType;

export const sendEsignEmail = async (payload: ExtendedEsignPayloadType) => {
  const { email, token, sender, ...rest } = payload;
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const html = await renderAsync(
    EsignEmail({
      signingLink: `${baseUrl}/esign/${token}`,
      sender,
      ...rest,
    }),
  );
  await sendMail({
    to: email,
    ...(sender?.email && { replyTo: sender.email }),
    subject: "eSign Document Request",
    html,
    headers: {
      "X-From-Name": sender?.name || "Captable",
    },
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
