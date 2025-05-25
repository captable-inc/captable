import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import { PasswordResetEmail, renderAsync } from "@captable/email";
import type { Job } from "pg-boss";

export type PasswordResetPayloadType = {
  email: string;
  token: string;
};

const sendPasswordResetEmail = async ({
  email,
  token,
}: PasswordResetPayloadType) => {
  const resetLink = `${env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const html = await renderAsync(
    PasswordResetEmail({
      resetLink,
    }),
  );

  await sendMail({
    to: [email],
    subject: "Reset your password",
    html,
  });
};

export class PasswordResetEmailJob extends BaseJob<PasswordResetPayloadType> {
  readonly type = "email.password-reset";

  async work(job: Job<PasswordResetPayloadType>): Promise<void> {
    await sendPasswordResetEmail(job.data);
  }
}
