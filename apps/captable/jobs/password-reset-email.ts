import { env } from "@/env";
import { BaseJob } from "@/jobs/base";
import { sendMail } from "@/server/mailer";
import type { Job } from "pg-boss";

export type PasswordResetEmailPayloadType = {
  email: string;
  resetLink: string;
};

const sendPasswordResetEmail = async (payload: PasswordResetEmailPayloadType) => {
  // Dynamic import to avoid build-time processing
  const { PasswordResetEmail, render } = await import("@captable/email");

  const html = await render(
    PasswordResetEmail({
      resetLink: payload.resetLink,
    }),
  );

  await sendMail({
    to: [payload.email],
    subject: "Reset your password",
    html,
  });
};

export { sendPasswordResetEmail };

export class PasswordResetEmailJob extends BaseJob<PasswordResetEmailPayloadType> {
  readonly type = "email.password-reset";

  async work(job: Job<PasswordResetEmailPayloadType>): Promise<void> {
    await sendPasswordResetEmail(job.data);
  }
}
