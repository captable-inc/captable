import { PricingTypeEnum } from "@captable/db";
import { z } from "zod";

export const ZodCheckoutMutationSchema = z.object({
  priceId: z.string(),
  priceType: z.enum(PricingTypeEnum.enumValues as [string, ...string[]]),
});

export type TypeZodCheckoutMutationSchema = z.infer<
  typeof ZodCheckoutMutationSchema
>;

export const ZodStripePortalMutationSchema = z.object({
  type: z.enum(["cancel", "update"]),
  subscription: z.string(),
});

export type TypeZodStripePortalMutationSchema = z.infer<
  typeof ZodStripePortalMutationSchema
>;
