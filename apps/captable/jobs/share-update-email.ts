import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import type { Job } from "pg-boss";

export type ShareUpdateEmailPayloadType = {
  to: string;
  senderName: string;
  recipientName: string | null;
  companyName: string;
  updateTitle: string;
  link: string;
};

const sendShareUpdateEmail = async (payload: ShareUpdateEmailPayloadType) => {
  // Dynamic import to avoid build-time processing
  const { render } = await import("@captable/email");
  const { ShareUpdateEmail } = await import("@captable/email/templates");

  const html = await render(
    ShareUpdateEmail({
      senderName: payload.senderName,
      recipientName: payload.recipientName,
      companyName: payload.companyName,
      updateTitle: payload.updateTitle,
      link: payload.link,
    }),
  );

  await sendMail({
    to: [payload.to],
    subject: `${payload.senderName} shared an update with you`,
    html,
  });
};

export class ShareUpdateEmailJob extends BaseJob<ShareUpdateEmailPayloadType> {
  readonly type = "email.share-update";

  async work(job: Job<ShareUpdateEmailPayloadType>): Promise<void> {
    await sendShareUpdateEmail(job.data);
  }
}
