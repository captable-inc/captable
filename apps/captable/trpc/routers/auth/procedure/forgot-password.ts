import { env } from "@/env";
import { passwordResetEmailJob } from "@/jobs";
import { db, eq, users } from "@captable/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { withoutAuth } from "@/trpc/api/trpc";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordProcedure = withoutAuth
  .input(forgotPasswordSchema)
  .mutation(async ({ input }) => {
    const { email } = input;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!existingUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found. Please check your email and try again.",
      });
    }

    const resetToken = crypto.randomUUID();
    const resetLink = `${env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Emit password reset email job
    await passwordResetEmailJob.emit({ email, resetLink });

    return { success: true };
  });
