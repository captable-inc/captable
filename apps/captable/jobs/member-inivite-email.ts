import { sendMail } from "@/server/mailer";
import { logger } from "@captable/logger";
import { BaseJob } from "@captable/queue";

const log = logger.child({ module: "member-invite-email-job" });

export type MemberInviteEmailPayloadType = {
  email: string;
  inviteLink: string;
  companyName: string;
  invitedBy: string;
};

const sendMemberInviteEmail = async (payload: MemberInviteEmailPayloadType) => {
  log.info(
    {
      email: payload.email,
      company: payload.companyName,
    },
    "Sending member invite email",
  );

  // Dynamic import to avoid build-time processing
  const { render } = await import("@captable/email");
  const { MemberInviteEmail } = await import("@captable/email/templates");

  const html = await render(
    MemberInviteEmail({
      inviteLink: payload.inviteLink,
      companyName: payload.companyName,
      invitedBy: payload.invitedBy,
    }),
  );

  await sendMail({
    to: [payload.email],
    subject: `You're invited to join ${payload.companyName}`,
    html,
  });

  log.info(
    {
      email: payload.email,
      company: payload.companyName,
    },
    "Member invite email sent successfully",
  );
};

export { sendMemberInviteEmail };

export class MemberInviteEmailJob extends BaseJob<MemberInviteEmailPayloadType> {
  readonly type = "email.member-invite";
  protected readonly options = {
    maxAttempts: 3,
    retryDelay: 1500,
    priority: 2, // Higher priority for invites
  };

  async work(payload: MemberInviteEmailPayloadType): Promise<void> {
    await sendMemberInviteEmail(payload);
  }
}

// Create and register the job instance
const memberInviteEmailJob = new MemberInviteEmailJob();
memberInviteEmailJob.register();

export { memberInviteEmailJob };
