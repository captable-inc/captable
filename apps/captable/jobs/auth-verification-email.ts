import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import type { Job } from "pg-boss";

export type AuthVerificationEmailPayloadType = {
  email: string;
  verifyLink: string;
};

const sendAuthVerificationEmail = async (payload: AuthVerificationEmailPayloadType) => {
  // Dynamic import to avoid build-time processing
  const { getAccountVerificationEmail, render } = await import("@captable/email");
  const AccountVerificationEmail = await getAccountVerificationEmail();

  const html = await render(
    AccountVerificationEmail({
      verifyLink: payload.verifyLink,
    }),
  );

  await sendMail({
    to: [payload.email],
    subject: "Verify your account",
    html,
  });
};

export { sendAuthVerificationEmail };

export class AuthVerificationEmailJob extends BaseJob<AuthVerificationEmailPayloadType> {
  readonly type = "email.auth-verify";

  async work(job: Job<AuthVerificationEmailPayloadType>): Promise<void> {
    await sendAuthVerificationEmail(job.data);
  }
}
