import { pgEnum } from "drizzle-orm/pg-core";

export const CredentialDeviceTypeEnum = pgEnum("CredentialDeviceTypeEnum", [
  "SINGLE_DEVICE",
  "MULTI_DEVICE",
]);
export type CredentialDeviceTypeEnum =
  (typeof CredentialDeviceTypeEnum.enumValues)[number];

export const BankAccountTypeEnum = pgEnum("BankAccountTypeEnum", [
  "CHECKING",
  "SAVINGS",
]);
export type BankAccountTypeEnum =
  (typeof BankAccountTypeEnum.enumValues)[number];

export const MemberStatusEnum = pgEnum("MemberStatusEnum", [
  "ACTIVE",
  "INACTIVE",
  "PENDING",
]);
export type MemberStatusEnum = (typeof MemberStatusEnum.enumValues)[number];

export const RolesEnum = pgEnum("Roles", ["ADMIN", "CUSTOM"]);
export type RoleEnum = (typeof RolesEnum.enumValues)[number];

export const StakeholderTypeEnum = pgEnum("StakeholderTypeEnum", [
  "INDIVIDUAL",
  "INSTITUTION",
]);
export type StakeholderTypeEnum =
  (typeof StakeholderTypeEnum.enumValues)[number];

export const StakeholderRelationshipEnum = pgEnum(
  "StakeholderRelationshipEnum",
  [
    "ADVISOR",
    "BOARD_MEMBER",
    "CONSULTANT",
    "EMPLOYEE",
    "EX_ADVISOR",
    "EX_CONSULTANT",
    "EX_EMPLOYEE",
    "EXECUTIVE",
    "FOUNDER",
    "INVESTOR",
    "NON_US_EMPLOYEE",
    "OFFICER",
    "OTHER",
  ],
);
export type StakeholderRelationshipEnum =
  (typeof StakeholderRelationshipEnum.enumValues)[number];

export const ShareTypeEnum = pgEnum("ShareTypeEnum", ["COMMON", "PREFERRED"]);
export type ShareTypeEnum = (typeof ShareTypeEnum.enumValues)[number];

export const SharePrefixEnum = pgEnum("SharePrefixEnum", ["CS", "PS"]);
export type SharePrefixEnum = (typeof SharePrefixEnum.enumValues)[number];

export const ConversionRightsEnum = pgEnum("ConversionRightsEnum", [
  "CONVERTS_TO_FUTURE_ROUND",
  "CONVERTS_TO_SHARE_CLASS_ID",
]);
export type ConversionRightsEnum =
  (typeof ConversionRightsEnum.enumValues)[number];

export const CancellationBehaviorEnum = pgEnum("CancellationBehaviorEnum", [
  "RETIRE",
  "RETURN_TO_POOL",
  "HOLD_AS_CAPITAL_STOCK",
  "DEFINED_PER_PLAN_SECURITY",
]);
export type CancellationBehaviorEnum =
  (typeof CancellationBehaviorEnum.enumValues)[number];

export const FieldTypesEnum = pgEnum("FieldTypes", [
  "TEXT",
  "RADIO",
  "EMAIL",
  "DATE",
  "DATETIME",
  "TEXTAREA",
  "CHECKBOX",
  "SIGNATURE",
  "SELECT",
]);
export type FieldTypesEnum = (typeof FieldTypesEnum.enumValues)[number];

export const TemplateStatusEnum = pgEnum("TemplateStatus", [
  "DRAFT",
  "COMPLETE",
  "SENT",
  "WAITING",
  "CANCELLED",
]);
export type TemplateStatusEnum = (typeof TemplateStatusEnum.enumValues)[number];

export const EsignRecipientStatusEnum = pgEnum("EsignRecipientStatus", [
  "SENT",
  "SIGNED",
  "PENDING",
]);
export type EsignRecipientStatusEnum =
  (typeof EsignRecipientStatusEnum.enumValues)[number];

export const SecuritiesStatusEnum = pgEnum("SecuritiesStatusEnum", [
  "ACTIVE",
  "DRAFT",
  "SIGNED",
  "PENDING",
]);
export type SecuritiesStatusEnum =
  (typeof SecuritiesStatusEnum.enumValues)[number];

export const ShareLegendsEnum = pgEnum("ShareLegendsEnum", [
  "US_SECURITIES_ACT",
  "SALE_AND_ROFR",
  "TRANSFER_RESTRICTIONS",
]);
export type ShareLegendsEnum = (typeof ShareLegendsEnum.enumValues)[number];

export const OptionTypeEnum = pgEnum("OptionTypeEnum", ["ISO", "NSO", "RSU"]);
export type OptionTypeEnum = (typeof OptionTypeEnum.enumValues)[number];

export const OptionStatusEnum = pgEnum("OptionStatusEnum", [
  "DRAFT",
  "ACTIVE",
  "EXERCISED",
  "EXPIRED",
  "CANCELLED",
]);
export type OptionStatusEnum = (typeof OptionStatusEnum.enumValues)[number];

export const SafeTypeEnum = pgEnum("SafeTypeEnum", ["PRE_MONEY", "POST_MONEY"]);
export type SafeTypeEnum = (typeof SafeTypeEnum.enumValues)[number];

export const SafeStatusEnum = pgEnum("SafeStatusEnum", [
  "DRAFT",
  "ACTIVE",
  "PENDING",
  "EXPIRED",
  "CANCELLED",
]);
export type SafeStatusEnum = (typeof SafeStatusEnum.enumValues)[number];

export const SafeTemplateEnum = pgEnum("SafeTemplateEnum", [
  "POST_MONEY_CAP",
  "POST_MONEY_DISCOUNT",
  "POST_MONEY_MFN",
  "POST_MONEY_CAP_WITH_PRO_RATA",
  "POST_MONEY_DISCOUNT_WITH_PRO_RATA",
  "POST_MONEY_MFN_WITH_PRO_RATA",
  "CUSTOM",
]);
export type SafeTemplateEnum = (typeof SafeTemplateEnum.enumValues)[number];

export const ConvertibleStatusEnum = pgEnum("ConvertibleStatusEnum", [
  "DRAFT",
  "ACTIVE",
  "PENDING",
  "EXPIRED",
  "CANCELLED",
]);
export type ConvertibleStatusEnum =
  (typeof ConvertibleStatusEnum.enumValues)[number];

export const ConvertibleTypeEnum = pgEnum("ConvertibleTypeEnum", [
  "CCD",
  "OCD",
  "NOTE",
]);
export type ConvertibleTypeEnum =
  (typeof ConvertibleTypeEnum.enumValues)[number];

export const ConvertibleInterestAccrualEnum = pgEnum(
  "ConvertibleInterestAccrualEnum",
  ["DAILY", "MONTHLY", "SEMI_ANNUALLY", "ANNUALLY", "YEARLY", "CONTINUOUSLY"],
);
export type ConvertibleInterestAccrualEnum =
  (typeof ConvertibleInterestAccrualEnum.enumValues)[number];

export const ConvertibleInterestMethodEnum = pgEnum(
  "ConvertibleInterestMethodEnum",
  ["SIMPLE", "COMPOUND"],
);
export type ConvertibleInterestMethodEnum =
  (typeof ConvertibleInterestMethodEnum.enumValues)[number];

export const ConvertibleInterestPaymentScheduleEnum = pgEnum(
  "ConvertibleInterestPaymentScheduleEnum",
  ["DEFERRED", "PAY_AT_MATURITY"],
);
export type ConvertibleInterestPaymentScheduleEnum =
  (typeof ConvertibleInterestPaymentScheduleEnum.enumValues)[number];

export const UpdateStatusEnum = pgEnum("UpdateStatusEnum", [
  "DRAFT",
  "PUBLIC",
  "PRIVATE",
]);
export type UpdateStatusEnum = (typeof UpdateStatusEnum.enumValues)[number];

export const PricingTypeEnum = pgEnum("PricingType", ["one_time", "recurring"]);
export type PricingTypeEnum = (typeof PricingTypeEnum.enumValues)[number];

export const PricingPlanIntervalEnum = pgEnum("PricingPlanInterval", [
  "day",
  "week",
  "month",
  "year",
]);
export type PricingPlanIntervalEnum =
  (typeof PricingPlanIntervalEnum.enumValues)[number];

export const SubscriptionStatusEnum = pgEnum("SubscriptionStatus", [
  "trialing",
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "unpaid",
  "paused",
]);
export type SubscriptionStatusEnum =
  (typeof SubscriptionStatusEnum.enumValues)[number];

export const AccessTokenTypeEnum = pgEnum("AccessTokenType", [
  "sig",
  "doc",
  "api",
  "upd",
]);
export type AccessTokenTypeEnum =
  (typeof AccessTokenTypeEnum.enumValues)[number];

export const AuditActionEnum = pgEnum("AuditAction", [
  "CREATE",
  "UPDATE",
  "DELETE",
]);
export type AuditActionEnum = (typeof AuditActionEnum.enumValues)[number];
