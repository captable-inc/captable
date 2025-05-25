import { generatePublicId } from "@/lib/common/id";
import { Audit } from "@/server/audit";
import { withAuth } from "@/trpc/api/trpc";
import { db, updates } from "@captable/db";
import { UpdateMutationSchema } from "../schema";

export const cloneUpdateProcedure = withAuth
  .input(UpdateMutationSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const authorId = ctx.session.user.memberId;
      const companyId = ctx.session.user.companyId;
      const userId = ctx.session.user.id;
      const userName = ctx.session.user.name;
      const { userAgent, requestIp } = ctx;
      const publicId = generatePublicId();
      const { title, content, html } = input;

      if (title.length === 0 || content.length === 0) {
        return {
          success: false,
          message: "Title and content cannot be empty.",
        };
      }
      await db.transaction(async (tx) => {
        const [update] = await tx
          .insert(updates)
          .values({
            html,
            title: `Copy of - ${title}`,
            content,
            publicId,
            companyId,
            authorId,
            updatedAt: new Date(),
          })
          .returning({
            id: updates.id,
          });

        if (!update) {
          throw new Error("Failed to create update");
        }

        await Audit.create(
          {
            action: "update.cloned",
            companyId: companyId,
            actor: { type: "user", id: userId },
            context: {
              userAgent,
              requestIp: requestIp || "",
            },
            target: [{ type: "update", id: update.id }],
            summary: `${userName} Cloned the Update ${title} for the company with id ${companyId}`,
          },
          tx,
        );
      });

      return {
        publicId,
        success: true,
        message: "Successfully cloned an update.",
      };
    } catch (error) {
      console.error("Error cloning an update:", error);
      return {
        success: false,
        message: "Oops, something went wrong. Please try again later.",
      };
    }
  });
