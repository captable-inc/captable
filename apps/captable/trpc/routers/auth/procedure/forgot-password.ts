import { PasswordResetEmailJob } from "@/jobs/password-reset-email";
import { generatePasswordResetToken } from "@/lib/token";
import { getUserByEmail } from "@/server/user";
import { withoutAuth } from "@/trpc/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const forgotPasswordProcedure = withoutAuth
  .input(z.string().email())
  .mutation(async ({ input }) => {
    const existingUser = await getUserByEmail(input);

    if (!existingUser) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email not found!",
      });
    }

    const passwordResetToken = await generatePasswordResetToken(input);

    if (!passwordResetToken) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate password reset token",
      });
    }

    const { email, token } = passwordResetToken;

    await new PasswordResetEmailJob().emit({ email, token });

    return {
      success: true,
      message:
        "To reset your password, please click the link sent to your email.",
    };
  });
