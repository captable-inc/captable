import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import { AccountVerificationEmail, renderAsync } from "@captable/email";
import type { Job } from "pg-boss";

export type AuthVerificationPayloadType = {
  email: string;
  token: string;
};

export const sendAuthVerificationEmail = async ({
  email,
  token,
}: AuthVerificationPayloadType) => {
  const verifyLink = `${env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const html = await renderAsync(
    AccountVerificationEmail({
      verifyLink,
    }),
  );

  await sendMail({
    to: [email],
    subject: "Verify your email address",
    html,
  });
};

export class AuthVerificationEmailJob extends BaseJob<AuthVerificationPayloadType> {
  readonly type = "email.auth-verify";

  async work(job: Job<AuthVerificationPayloadType>): Promise<void> {
    await sendAuthVerificationEmail(job.data);
  }
}
