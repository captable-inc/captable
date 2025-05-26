import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import { render, ShareDataRoomEmail } from "@captable/email";
import type { Job } from "pg-boss";

export type ShareDataRoomEmailPayloadType = {
  to: string;
  dataRoom: string;
  companyName: string;
  senderName: string;
  link: string;
  recipientName?: string | null;
};

const sendShareDataRoomEmail = async ({
  to,
  dataRoom,
  companyName,
  senderName,
  link,
  recipientName,
}: ShareDataRoomEmailPayloadType) => {
  const html = await render(
    ShareDataRoomEmail({
      dataRoom,
      companyName,
      senderName,
      link,
      recipientName,
    }),
  );

  await sendMail({
    to: [to],
    subject: `${senderName} shared a data room with you`,
    html,
  });
};

export class ShareDataRoomEmailJob extends BaseJob<ShareDataRoomEmailPayloadType> {
  readonly type = "email.share-data-room";

  async work(job: Job<ShareDataRoomEmailPayloadType>): Promise<void> {
    await sendShareDataRoomEmail(job.data);
  }
}
