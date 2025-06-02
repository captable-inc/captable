import { env } from "@/env";
import { sendMail } from "@/server/mailer";
import { logger } from "@captable/logger";
import { BaseJob } from "@captable/queue";

const log = logger.child({ module: "share-data-room-email-job" });

export type ShareDataRoomEmailPayloadType = {
  dataRoomId: string;
  dataRoomName: string;
  recipientName: string | null;
  link: string;
  email: string;
  companyName: string;
  senderName: string;
};

const sendShareDataRoomEmail = async (
  payload: ShareDataRoomEmailPayloadType,
) => {
  log.info(
    {
      email: payload.email,
      dataRoomId: payload.dataRoomId,
      company: payload.companyName,
    },
    "Sending share data room email",
  );

  const { render } = await import("@captable/email");
  const { ShareDataRoomEmail } = await import("@captable/email/templates");

  const html = await render(
    ShareDataRoomEmail({
      senderName: payload.senderName,
      recipientName: payload.recipientName,
      companyName: payload.companyName,
      dataRoom: payload.dataRoomName,
      link: payload.link,
    }),
  );

  await sendMail({
    to: [payload.email],
    subject: `${payload.senderName} shared a data room with you`,
    html,
  });

  log.info(
    {
      email: payload.email,
      dataRoomId: payload.dataRoomId,
      company: payload.companyName,
    },
    "Share data room email sent successfully",
  );
};

export { sendShareDataRoomEmail };

export class ShareDataRoomEmailJob extends BaseJob<ShareDataRoomEmailPayloadType> {
  readonly type = "email.share-data-room";
  protected readonly options = {
    maxAttempts: 3,
    retryDelay: 1000,
    priority: 2, // High priority for data room access
  };

  async work(payload: ShareDataRoomEmailPayloadType): Promise<void> {
    await sendShareDataRoomEmail(payload);
  }
}

// Create and register the job instance
const shareDataRoomEmailJob = new ShareDataRoomEmailJob();
shareDataRoomEmailJob.register();

export { shareDataRoomEmailJob };
