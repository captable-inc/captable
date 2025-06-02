import { BaseJob } from "@captable/queue";
import { sendMail } from "@/server/mailer";
import { logger } from "@captable/logger";

const log = logger.child({ module: "password-reset-email-job" });

export type PasswordResetEmailPayloadType = {
  email: string;
  resetLink: string;
};

const sendPasswordResetEmail = async (
  payload: PasswordResetEmailPayloadType,
) => {
  log.info({ email: payload.email }, "Sending password reset email");
  
  // Dynamic import to avoid build-time processing
  const { render } = await import("@captable/email");
  const { PasswordResetEmail } = await import("@captable/email/templates");

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

  log.info({ email: payload.email }, "Password reset email sent successfully");
};

export { sendPasswordResetEmail };

export class PasswordResetEmailJob extends BaseJob<PasswordResetEmailPayloadType> {
  readonly type = "email.password-reset";
  protected readonly options = {
    maxAttempts: 5, // Email is critical
    retryDelay: 2000,
    priority: 1, // High priority
  };

  async work(payload: PasswordResetEmailPayloadType): Promise<void> {
    await sendPasswordResetEmail(payload);
  }
}

// Create and register the job instance
const passwordResetEmailJob = new PasswordResetEmailJob();
passwordResetEmailJob.register();

export { passwordResetEmailJob };
