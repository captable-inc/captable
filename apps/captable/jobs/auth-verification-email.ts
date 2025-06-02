import { BaseJob } from "@captable/queue";
import { sendMail } from "@/server/mailer";
import { logger } from "@captable/logger";

const log = logger.child({ module: "auth-verification-email-job" });

export type AuthVerificationEmailPayloadType = {
  email: string;
  verifyLink: string;
};

const sendAuthVerificationEmail = async (
  payload: AuthVerificationEmailPayloadType,
) => {
  log.info({ email: payload.email }, "Sending auth verification email");
  
  // Dynamic import to avoid build-time processing
  const { render } = await import("@captable/email");
  const { AccountVerificationEmail } = await import(
    "@captable/email/templates"
  );

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

  log.info({ email: payload.email }, "Auth verification email sent successfully");
};

export { sendAuthVerificationEmail };

export class AuthVerificationEmailJob extends BaseJob<AuthVerificationEmailPayloadType> {
  readonly type = "email.auth-verify";
  protected readonly options = {
    maxAttempts: 5, // Critical for account verification
    retryDelay: 1000,
    priority: 3, // High priority
  };

  async work(payload: AuthVerificationEmailPayloadType): Promise<void> {
    await sendAuthVerificationEmail(payload);
  }
}

// Create and register the job instance
const authVerificationEmailJob = new AuthVerificationEmailJob();
authVerificationEmailJob.register();

export { authVerificationEmailJob };
