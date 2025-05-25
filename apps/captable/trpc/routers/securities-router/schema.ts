import {
  OptionStatusEnum,
  OptionTypeEnum,
  SecuritiesStatusEnum,
  ShareLegendsEnum,
} from "@captable/db";
import { z } from "zod";

// OPTIONS
export const ZodAddOptionMutationSchema = z.object({
  id: z.string().optional(),
  grantId: z.string(),
  notes: z.string().optional().nullable(),
  quantity: z.coerce.number().min(0),
  exercisePrice: z.coerce.number().min(0),
  type: z.enum(OptionTypeEnum.enumValues as [string, ...string[]]),
  status: z.enum(OptionStatusEnum.enumValues as [string, ...string[]]),
  cliffYears: z.coerce.number().min(0),
  vestingYears: z.coerce.number().min(0),
  issueDate: z.string().date(),
  expirationDate: z.string().date(),
  vestingStartDate: z.string().date(),
  boardApprovalDate: z.string().date(),
  rule144Date: z.string().date(),
  documents: z.array(
    z.object({
      bucketId: z.string(),
      name: z.string(),
    }),
  ),
  stakeholderId: z.string(),
  equityPlanId: z.string(),
});

export type TypeZodAddOptionMutationSchema = z.infer<
  typeof ZodAddOptionMutationSchema
>;

export const ZodDeleteOptionMutationSchema = z.object({
  optionId: z.string(),
});

export type TypeZodDeleteOptionMutationSchema = z.infer<
  typeof ZodDeleteOptionMutationSchema
>;

// SHARES
export const ZodAddShareMutationSchema = z.object({
  id: z.string().optional().nullable(),
  stakeholderId: z.string(),
  shareClassId: z.string(),
  certificateId: z.string(),
  quantity: z.coerce.number().min(0),
  pricePerShare: z.coerce.number().min(0),
  capitalContribution: z.coerce.number().min(0),
  ipContribution: z.coerce.number().min(0),
  debtCancelled: z.coerce.number().min(0),
  otherContributions: z.coerce.number().min(0),
  status: z.enum(SecuritiesStatusEnum.enumValues as [string, ...string[]]),
  cliffYears: z.coerce.number().min(0),
  vestingYears: z.coerce.number().min(0),
  companyLegends: z
    .enum(ShareLegendsEnum.enumValues as [string, ...string[]])
    .array(),
  issueDate: z.string().date(),
  rule144Date: z.string().date(),
  vestingStartDate: z.string().date(),
  boardApprovalDate: z.string().date(),
  documents: z.array(
    z.object({
      bucketId: z.string(),
      name: z.string(),
    }),
  ),
});

export type TypeZodAddShareMutationSchema = z.infer<
  typeof ZodAddShareMutationSchema
>;

export const ZodDeleteShareMutationSchema = z.object({
  shareId: z.string(),
});

export type TypeZodDeleteShareMutationSchema = z.infer<
  typeof ZodDeleteShareMutationSchema
>;
