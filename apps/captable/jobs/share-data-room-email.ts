import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import { ShareDataRoomEmail, renderAsync } from "@captable/email";
import type { Job } from "pg-boss";

export type DataRoomEmailPayloadType = {
  link: string;
  dataRoom: string;
  email: string;
  senderName: string;
  companyName: string;
  recipientName?: string | null | undefined;
  senderEmail?: string | null | undefined;
};

const sendShareDataRoomEmail = async (payload: DataRoomEmailPayloadType) => {
  await sendMail({
    to: [payload.email],
    subject: `${payload.senderName} shared a data room with you`,
    html: await renderAsync(
      ShareDataRoomEmail({
        senderName: payload.senderName,
        recipientName: payload.recipientName,
        companyName: payload.companyName,
        dataRoom: payload.dataRoom,
        link: payload.link,
      }),
    ),
  });
};

export class ShareDataRoomEmailJob extends BaseJob<DataRoomEmailPayloadType> {
  readonly type = "email.share-data-room";

  async work(job: Job<DataRoomEmailPayloadType>): Promise<void> {
    await sendShareDataRoomEmail(job.data);
  }
}
