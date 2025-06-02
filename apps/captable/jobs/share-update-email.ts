import { BaseJob } from "@captable/queue";
import { sendMail } from "@/server/mailer";
import { logger } from "@captable/logger";

const log = logger.child({ module: "share-update-email-job" });

export type ShareUpdateEmailPayloadType = {
  to: string;
  senderName: string;
  recipientName: string | null;
  companyName: string;
  updateTitle: string;
  link: string;
};

const sendShareUpdateEmail = async (payload: ShareUpdateEmailPayloadType) => {
  log.info({ 
    to: payload.to,
    company: payload.companyName,
    update: payload.updateTitle 
  }, "Sending share update email");
  
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

  log.info({ 
    to: payload.to,
    company: payload.companyName,
    update: payload.updateTitle 
  }, "Share update email sent successfully");
};

export { sendShareUpdateEmail };

export class ShareUpdateEmailJob extends BaseJob<ShareUpdateEmailPayloadType> {
  readonly type = "email.share-update";
  protected readonly options = {
    maxAttempts: 3,
    retryDelay: 1000,
    priority: 1,
  };

  async work(payload: ShareUpdateEmailPayloadType): Promise<void> {
    await sendShareUpdateEmail(payload);
  }
}

// Create and register the job instance
const shareUpdateEmailJob = new ShareUpdateEmailJob();
shareUpdateEmailJob.register();

export { shareUpdateEmailJob };
