import { Audit } from "@/server/audit";
import { withAccessControl } from "@/trpc/api/trpc";
import { db, stakeholders } from "@captable/db";
import { ZodAddStakeholderArrayMutationSchema } from "../schema";

export const addStakeholdersProcedure = withAccessControl
  .input(ZodAddStakeholderArrayMutationSchema)
  .meta({ policies: { stakeholder: { allow: ["create"] } } })
  .mutation(
    async ({
      ctx: { membership, userAgent, requestIp, session },
      input,
    }) => {
      try {
        const { user } = session;
        await db.transaction(async (tx) => {
          // insert companyId in every input
          const inputDataWithCompanyId = input.map((stakeholder) => ({
            ...stakeholder,
            companyId: membership.companyId,
            stakeholderType: stakeholder.stakeholderType as "INDIVIDUAL" | "INSTITUTION",
            currentRelationship: stakeholder.currentRelationship as "ADVISOR" | "BOARD_MEMBER" | "CONSULTANT" | "EMPLOYEE" | "EX_ADVISOR" | "EX_CONSULTANT" | "EX_EMPLOYEE" | "FOUNDER" | "INVESTOR" | "OTHER",
            updatedAt: new Date(),
          }));

          const insertedStakeholders = await tx
            .insert(stakeholders)
            .values(inputDataWithCompanyId)
            .returning({ id: stakeholders.id, name: stakeholders.name });

          // Create audit entries for each inserted stakeholder
          const auditPromises = insertedStakeholders.map((stakeholder) =>
            Audit.create(
              {
                action: "stakeholder.added",
                companyId: user.companyId,
                actor: { type: "user", id: user.id },
                context: {
                  userAgent,
                  requestIp: requestIp || "",
                },
                target: [{ type: "stakeholder", id: stakeholder.id }],
                summary: `${user.name} added stakeholder ${stakeholder.name} for the company ID ${membership.companyId}`,
              },
              tx,
            )
          );
          
          await Promise.all(auditPromises);
        });

        return {
          success: true,
          message: "Stakeholders added successfully!",
        };
      } catch (_error) {
        return {
          success: false,
          message: "Oops, something went wrong. Please try again later.",
        };
      }
    },
  );
