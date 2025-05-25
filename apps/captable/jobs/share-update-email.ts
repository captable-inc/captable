import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import { ShareUpdateEmail, renderAsync } from "@captable/email";
import type { Job } from "pg-boss";

export type UpdateSharePayloadType = {
  update: {
    title: string;
  };
  link: string;
  companyName: string;
  senderName: string;
  email: string;
  recipientName?: string | null | undefined;
  senderEmail?: string | null | undefined;
};

const sendShareUpdateEmail = async (payload: UpdateSharePayloadType) => {
  await sendMail({
    to: [payload.email],
    subject: `${payload.senderName} shared an update with you`,
    html: await renderAsync(
      ShareUpdateEmail({
        senderName: payload.senderName,
        recipientName: payload.recipientName,
        companyName: payload.companyName,
        updateTitle: payload.update.title,
        link: payload.link,
      }),
    ),
  });
};

export class ShareUpdateEmailJob extends BaseJob<UpdateSharePayloadType> {
  readonly type = "email.share-update";

  async work(job: Job<UpdateSharePayloadType>): Promise<void> {
    await sendShareUpdateEmail(job.data);
  }
}
