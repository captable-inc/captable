import { env } from "@/env";
import { sendAuthVerificationEmail } from "@/jobs/auth-verification-email";

import { generateVerificationToken } from "@/lib/token";
import { getVerificationTokenByEmail } from "@/server/verification-token";
import { withoutAuth } from "@/trpc/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const resendEmailProcedure = withoutAuth
  .input(z.string().email())
  .mutation(async ({ input }) => {
    const oldVerificationToken = await getVerificationTokenByEmail(input);

    if (!oldVerificationToken) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Email not found!",
      });
    }

    const verificationToken = await generateVerificationToken(input);

    if (!verificationToken) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate verification token",
      });
    }

    const verifyLink = `${env.NEXT_PUBLIC_BASE_URL}/verify-email/${verificationToken.token}`;

    await sendAuthVerificationEmail({
      email: verificationToken.identifier,
      verifyLink,
    });

    return {
      success: true,
      message:
        "To verify your account, please click the verification link sent to your email.",
    };
  });
