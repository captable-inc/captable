import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import type { Job } from "pg-boss";

export type MemberInviteEmailPayloadType = {
  invitedBy: string;
  companyName: string;
  inviteLink: string;
  email: string;
};

const sendMemberInviteEmail = async (payload: MemberInviteEmailPayloadType) => {
  // Dynamic import to avoid build-time processing
  const { getMemberInviteEmail, render } = await import("@captable/email");
  const MemberInviteEmail = await getMemberInviteEmail();

  const html = await render(
    MemberInviteEmail({
      invitedBy: payload.invitedBy,
      companyName: payload.companyName,
      inviteLink: payload.inviteLink,
    }),
  );

  await sendMail({
    to: [payload.email],
    subject: `${payload.invitedBy} invited you to join ${payload.companyName}`,
    html,
  });
};

export class MemberInviteEmailJob extends BaseJob<MemberInviteEmailPayloadType> {
  readonly type = "email.member-invite";

  async work(job: Job<MemberInviteEmailPayloadType>): Promise<void> {
    await sendMemberInviteEmail(job.data);
  }
}
