import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import type { Job } from "pg-boss";

export type MemberInviteEmailPayloadType = {
  email: string;
  inviteLink: string;
  companyName: string;
  invitedBy: string;
};

const sendMemberInviteEmail = async (payload: MemberInviteEmailPayloadType) => {
  // Dynamic import to avoid build-time processing
  const { MemberInviteEmail, render } = await import("@captable/email");

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
};

export { sendMemberInviteEmail };

export class MemberInviteEmailJob extends BaseJob<MemberInviteEmailPayloadType> {
  readonly type = "email.member-invite";

  async work(job: Job<MemberInviteEmailPayloadType>): Promise<void> {
    await sendMemberInviteEmail(job.data);
  }
}
