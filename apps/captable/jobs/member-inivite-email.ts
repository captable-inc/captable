import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { META } from "@/lib/constants/meta";
import { sendMail } from "@/server/mailer";
import { MemberInviteEmail, renderAsync } from "@captable/email";
import type { Job } from "pg-boss";

type MemberInvitePayloadType = {
  email: string;
  passwordResetToken: string;
  user: {
    email?: string | null | undefined;
    name?: string | null | undefined;
  };
  verificationToken: string;
  company: {
    name: string;
    id: string;
  };
};

const sendMemberInviteEmail = async (payload: MemberInvitePayloadType) => {
  const inviteLink = `${env.NEXTAUTH_URL}/verify-member?token=${payload.verificationToken}&passwordResetToken=${payload.passwordResetToken}`;

  await sendMail({
    to: [payload.email],
    subject: `You're invited to join ${payload.company.name} on ${META.title}`,
    html: await renderAsync(
      MemberInviteEmail({
        invitedBy: payload.user.name || "Someone",
        companyName: payload.company.name,
        inviteLink,
      }),
    ),
  });
};

export class SendMemberInviteEmailJob extends BaseJob<MemberInvitePayloadType> {
  readonly type = "email.member-invite";

  async work(job: Job<MemberInvitePayloadType>): Promise<void> {
    await sendMemberInviteEmail(job.data);
  }
}
