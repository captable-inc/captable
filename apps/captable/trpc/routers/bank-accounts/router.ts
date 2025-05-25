import { createTRPCRouter, withAccessControl } from "@/trpc/api/trpc";
import { db, bankAccounts, eq, desc } from "@captable/db";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const bankAccountsRouter = createTRPCRouter({
  getAll: withAccessControl
    .meta({ policies: { "bank-accounts": { allow: ["read"] } } })
    .query(async ({ ctx }) => {
      const {
        membership: { companyId },
      } = ctx;

      const bankAccountsData = await db
        .select({
          id: bankAccounts.id,
          bankName: bankAccounts.bankName,
          accountNumber: bankAccounts.accountNumber,
          primary: bankAccounts.primary,
          createdAt: bankAccounts.createdAt,
        })
        .from(bankAccounts)
        .where(eq(bankAccounts.companyId, companyId))
        .orderBy(desc(bankAccounts.createdAt));

      return {
        bankAccounts: bankAccountsData,
      };
    }),

  create: withAccessControl
    .meta({ policies: { "bank-accounts": { allow: ["create"] } } })
    .mutation(async ({ ctx }) => {
      // const {
      //   db,
      //   membership: { companyId, memberId },
      // } = ctx;
      // TODO // Implement create mutation
    }),

  delete: withAccessControl
    .input(z.object({ id: z.string() }))
    .meta({ policies: { "bank-accounts": { allow: ["delete"] } } })
    .mutation(async ({ ctx, input }) => {
      // const {
      //   db,
      //   membership: { memberId, companyId },
      // } = ctx;
      // TODO // Implement delete mutation
    }),
});
