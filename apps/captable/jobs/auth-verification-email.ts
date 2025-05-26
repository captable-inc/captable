import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import { renderAsync } from "@captable/email";
import type { Job } from "pg-boss";

export type AuthVerificationPayloadType = {
  email: string;
  token: string;
};

const sendAuthVerificationEmail = async ({
  email,
  token,
}: AuthVerificationPayloadType) => {
  const verifyLink = `${env.NEXTAUTH_URL}/verify-email/${token}`;

  // Dynamic import to avoid build-time processing
  const { AccountVerificationEmail } = await import("@captable/email");

  const html = await renderAsync(
    AccountVerificationEmail({
      verifyLink,
    }),
  );

  await sendMail({
    to: [email],
    subject: "Verify your email",
    html,
  });
};

export { sendAuthVerificationEmail };

export class AuthVerificationEmailJob extends BaseJob<AuthVerificationPayloadType> {
  readonly type = "email.auth-verify";

  async work(job: Job<AuthVerificationPayloadType>): Promise<void> {
    await sendAuthVerificationEmail(job.data);
  }
}
