CREATE TYPE "public"."AccessTokenType" AS ENUM('sig', 'doc', 'api', 'upd');--> statement-breakpoint
CREATE TYPE "public"."BankAccountTypeEnum" AS ENUM('CHECKING', 'SAVINGS');--> statement-breakpoint
CREATE TYPE "public"."CancellationBehaviorEnum" AS ENUM('RETIRE', 'RETURN_TO_POOL', 'HOLD_AS_CAPITAL_STOCK', 'DEFINED_PER_PLAN_SECURITY');--> statement-breakpoint
CREATE TYPE "public"."ConversionRightsEnum" AS ENUM('CONVERTS_TO_FUTURE_ROUND', 'CONVERTS_TO_SHARE_CLASS_ID');--> statement-breakpoint
CREATE TYPE "public"."ConvertibleInterestAccrualEnum" AS ENUM('DAILY', 'MONTHLY', 'SEMI_ANNUALLY', 'ANNUALLY', 'YEARLY', 'CONTINUOUSLY');--> statement-breakpoint
CREATE TYPE "public"."ConvertibleInterestMethodEnum" AS ENUM('SIMPLE', 'COMPOUND');--> statement-breakpoint
CREATE TYPE "public"."ConvertibleInterestPaymentScheduleEnum" AS ENUM('DEFERRED', 'PAY_AT_MATURITY');--> statement-breakpoint
CREATE TYPE "public"."ConvertibleStatusEnum" AS ENUM('DRAFT', 'ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."ConvertibleTypeEnum" AS ENUM('CCD', 'OCD', 'NOTE');--> statement-breakpoint
CREATE TYPE "public"."CredentialDeviceTypeEnum" AS ENUM('SINGLE_DEVICE', 'MULTI_DEVICE');--> statement-breakpoint
CREATE TYPE "public"."EsignRecipientStatus" AS ENUM('SENT', 'SIGNED', 'PENDING');--> statement-breakpoint
CREATE TYPE "public"."FieldTypes" AS ENUM('TEXT', 'RADIO', 'EMAIL', 'DATE', 'DATETIME', 'TEXTAREA', 'CHECKBOX', 'SIGNATURE', 'SELECT');--> statement-breakpoint
CREATE TYPE "public"."MemberStatusEnum" AS ENUM('ACTIVE', 'INACTIVE', 'PENDING');--> statement-breakpoint
CREATE TYPE "public"."OptionStatusEnum" AS ENUM('DRAFT', 'ACTIVE', 'EXERCISED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."OptionTypeEnum" AS ENUM('ISO', 'NSO', 'RSU');--> statement-breakpoint
CREATE TYPE "public"."PricingPlanInterval" AS ENUM('day', 'week', 'month', 'year');--> statement-breakpoint
CREATE TYPE "public"."PricingType" AS ENUM('one_time', 'recurring');--> statement-breakpoint
CREATE TYPE "public"."Roles" AS ENUM('ADMIN', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."SafeStatusEnum" AS ENUM('DRAFT', 'ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."SafeTemplateEnum" AS ENUM('POST_MONEY_CAP', 'POST_MONEY_DISCOUNT', 'POST_MONEY_MFN', 'POST_MONEY_CAP_WITH_PRO_RATA', 'POST_MONEY_DISCOUNT_WITH_PRO_RATA', 'POST_MONEY_MFN_WITH_PRO_RATA', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."SafeTypeEnum" AS ENUM('PRE_MONEY', 'POST_MONEY');--> statement-breakpoint
CREATE TYPE "public"."SecuritiesStatusEnum" AS ENUM('ACTIVE', 'DRAFT', 'SIGNED', 'PENDING');--> statement-breakpoint
CREATE TYPE "public"."ShareLegendsEnum" AS ENUM('US_SECURITIES_ACT', 'SALE_AND_ROFR', 'TRANSFER_RESTRICTIONS');--> statement-breakpoint
CREATE TYPE "public"."SharePrefixEnum" AS ENUM('CS', 'PS');--> statement-breakpoint
CREATE TYPE "public"."ShareTypeEnum" AS ENUM('COMMON', 'PREFERRED');--> statement-breakpoint
CREATE TYPE "public"."StakeholderRelationshipEnum" AS ENUM('ADVISOR', 'BOARD_MEMBER', 'CONSULTANT', 'EMPLOYEE', 'EX_ADVISOR', 'EX_CONSULTANT', 'EX_EMPLOYEE', 'EXECUTIVE', 'FOUNDER', 'INVESTOR', 'NON_US_EMPLOYEE', 'OFFICER', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."StakeholderTypeEnum" AS ENUM('INDIVIDUAL', 'INSTITUTION');--> statement-breakpoint
CREATE TYPE "public"."SubscriptionStatus" AS ENUM('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');--> statement-breakpoint
CREATE TYPE "public"."TemplateStatus" AS ENUM('DRAFT', 'COMPLETE', 'SENT', 'WAITING', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."UpdateStatusEnum" AS ENUM('DRAFT', 'PUBLIC', 'PRIVATE');--> statement-breakpoint
CREATE TABLE "cap_accounts" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"user_id" varchar(191) NOT NULL,
	"type" varchar(191) NOT NULL,
	"provider" varchar(191) NOT NULL,
	"provider_account_id" varchar(191) NOT NULL,
	"refresh_token" varchar(191),
	"access_token" varchar(191),
	"expires_at" varchar(191),
	"token_type" varchar(191),
	"scope" varchar(191),
	"id_token" varchar(191),
	"session_state" varchar(191)
);
--> statement-breakpoint
CREATE TABLE "cap_sessions" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"session_token" varchar(191) NOT NULL,
	"user_id" varchar(191) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_users" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191),
	"email" varchar(191),
	"password" varchar(191),
	"email_verified" timestamp with time zone,
	"image" varchar(191),
	"last_signed_in" timestamp with time zone NOT NULL,
	"identity_provider" varchar(191)
);
--> statement-breakpoint
CREATE TABLE "cap_passkeys" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"credential_id" varchar(191) NOT NULL,
	"credential_public_key" varchar(191) NOT NULL,
	"counter" bigint NOT NULL,
	"credential_device_type" "CredentialDeviceTypeEnum" NOT NULL,
	"credential_backed_up" boolean NOT NULL,
	"transports" varchar(191)[] NOT NULL,
	"user_id" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_passkey_verification_tokens" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"token" varchar(191) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cap_passkey_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "cap_password_reset_tokens" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"email" varchar(191) NOT NULL,
	"token" varchar(191) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "cap_password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "cap_verification_tokens" (
	"id" integer PRIMARY KEY NOT NULL,
	"secondary_id" varchar(191) NOT NULL,
	"identifier" varchar(191) NOT NULL,
	"token" varchar(191) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" varchar(191),
	CONSTRAINT "cap_verification_tokens_secondary_id_unique" UNIQUE("secondary_id"),
	CONSTRAINT "cap_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "cap_companies" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"logo" varchar(191),
	"public_id" varchar(191) NOT NULL,
	"website" varchar(191),
	"incorporation_type" varchar(191) NOT NULL,
	"incorporation_date" timestamp with time zone NOT NULL,
	"incorporation_country" varchar(191) NOT NULL,
	"incorporation_state" varchar(191) NOT NULL,
	"street_address" varchar(191) NOT NULL,
	"city" varchar(191) NOT NULL,
	"state" varchar(191) NOT NULL,
	"zipcode" varchar(191) NOT NULL,
	"country" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "cap_companies_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "cap_bank_accounts" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"beneficiary_name" varchar(191) NOT NULL,
	"beneficiary_address" varchar(191) NOT NULL,
	"bank_name" varchar(191) NOT NULL,
	"bank_address" varchar(191) NOT NULL,
	"account_number" varchar(191) NOT NULL,
	"routing_number" varchar(191) NOT NULL,
	"account_type" "BankAccountTypeEnum" DEFAULT 'CHECKING' NOT NULL,
	"swift_code" varchar(191),
	"primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"company_id" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_custom_roles" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"permissions" varchar(191)[]
);
--> statement-breakpoint
CREATE TABLE "cap_members" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"title" varchar(191),
	"status" "MemberStatusEnum" DEFAULT 'PENDING' NOT NULL,
	"is_onboarded" boolean DEFAULT false NOT NULL,
	"role" "Roles" DEFAULT 'ADMIN',
	"work_email" varchar(191),
	"last_accessed" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"user_id" varchar(191) NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"custom_role_id" varchar(191)
);
--> statement-breakpoint
CREATE TABLE "cap_stakeholders" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"email" varchar(191) NOT NULL,
	"institution_name" varchar(191),
	"stakeholder_type" "StakeholderTypeEnum" DEFAULT 'INDIVIDUAL' NOT NULL,
	"current_relationship" "StakeholderRelationshipEnum" DEFAULT 'EMPLOYEE' NOT NULL,
	"tax_id" varchar(191),
	"street_address" varchar(191),
	"city" varchar(191),
	"state" varchar(191),
	"zipcode" varchar(191),
	"country" varchar(191) DEFAULT 'US' NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "cap_stakeholders_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cap_audits" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"summary" varchar(191),
	"action" varchar(191) NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor" jsonb NOT NULL,
	"target" jsonb[] NOT NULL,
	"context" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_share_classes" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"idx" integer NOT NULL,
	"name" varchar(191) NOT NULL,
	"class_type" "ShareTypeEnum" DEFAULT 'COMMON' NOT NULL,
	"prefix" "SharePrefixEnum" DEFAULT 'CS' NOT NULL,
	"initial_shares_authorized" bigint NOT NULL,
	"board_approval_date" timestamp with time zone NOT NULL,
	"stockholder_approval_date" timestamp with time zone NOT NULL,
	"votes_per_share" integer NOT NULL,
	"par_value" real NOT NULL,
	"price_per_share" real NOT NULL,
	"seniority" integer NOT NULL,
	"conversion_rights" "ConversionRightsEnum" DEFAULT 'CONVERTS_TO_FUTURE_ROUND' NOT NULL,
	"converts_to_share_class_id" varchar(191),
	"liquidation_preference_multiple" real NOT NULL,
	"participation_cap_multiple" real NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_equity_plans" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"board_approval_date" timestamp with time zone NOT NULL,
	"plan_effective_date" timestamp with time zone,
	"initial_shares_reserved" bigint NOT NULL,
	"default_cancellaton_behavior" "CancellationBehaviorEnum" NOT NULL,
	"comments" varchar(191),
	"company_id" varchar(191) NOT NULL,
	"share_class_id" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_buckets" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"key" varchar(191) NOT NULL,
	"mime_type" varchar(191) NOT NULL,
	"size" integer NOT NULL,
	"tags" varchar(191)[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_document_shares" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"link" varchar(191) NOT NULL,
	"public_id" varchar(191) NOT NULL,
	"link_expires_at" timestamp with time zone NOT NULL,
	"recipients" varchar(191)[] DEFAULT '{}' NOT NULL,
	"email_protected" boolean DEFAULT false NOT NULL,
	"document_id" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_documents" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"public_id" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"bucket_id" varchar(191) NOT NULL,
	"uploader_id" varchar(191),
	"company_id" varchar(191) NOT NULL,
	"share_id" varchar(191),
	"option_id" varchar(191),
	"safe_id" varchar(191),
	"convertible_note_id" varchar(191),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "cap_documents_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "cap_data_room_documents" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"data_room_id" varchar(191) NOT NULL,
	"document_id" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_data_room_recipients" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191),
	"email" varchar(191) NOT NULL,
	"data_room_id" varchar(191) NOT NULL,
	"member_id" varchar(191),
	"stakeholder_id" varchar(191),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_data_rooms" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"public_id" varchar(191) NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "cap_data_rooms_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "cap_update_recipients" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191),
	"email" varchar(191) NOT NULL,
	"update_id" varchar(191) NOT NULL,
	"member_id" varchar(191),
	"stakeholder_id" varchar(191),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_esign_recipients" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"email" varchar(191) NOT NULL,
	"name" varchar(191),
	"template_id" varchar(191) NOT NULL,
	"status" "EsignRecipientStatus" DEFAULT 'PENDING' NOT NULL,
	"member_id" varchar(191),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_template_fields" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"type" "FieldTypes" DEFAULT 'TEXT' NOT NULL,
	"default_value" varchar(191) DEFAULT '' NOT NULL,
	"read_only" boolean DEFAULT false NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"prefilled_value" varchar(191),
	"top" integer NOT NULL,
	"left" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"recipient_id" varchar(191) NOT NULL,
	"template_id" varchar(191) NOT NULL,
	"viewport_height" integer NOT NULL,
	"viewport_width" integer NOT NULL,
	"page" integer NOT NULL,
	"meta" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_templates" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"public_id" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"status" "TemplateStatus" DEFAULT 'DRAFT' NOT NULL,
	"ordered_delivery" boolean DEFAULT false NOT NULL,
	"message" varchar(191),
	"bucket_id" varchar(191) NOT NULL,
	"uploader_id" varchar(191) NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"completed_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cap_shares" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"status" "SecuritiesStatusEnum" DEFAULT 'DRAFT' NOT NULL,
	"certificate_id" varchar(191) NOT NULL,
	"quantity" integer NOT NULL,
	"price_per_share" real,
	"capital_contribution" real,
	"ip_contribution" real,
	"debt_cancelled" real,
	"other_contributions" real,
	"cliff_years" integer DEFAULT 0 NOT NULL,
	"vesting_years" integer DEFAULT 0 NOT NULL,
	"company_legends" "ShareLegendsEnum"[] DEFAULT '{}' NOT NULL,
	"issue_date" timestamp with time zone NOT NULL,
	"rule_144_date" timestamp with time zone,
	"vesting_start_date" timestamp with time zone,
	"board_approval_date" timestamp with time zone NOT NULL,
	"stakeholder_id" varchar(191) NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"share_class_id" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_options" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"grant_id" varchar(191) NOT NULL,
	"quantity" integer NOT NULL,
	"exercise_price" real NOT NULL,
	"type" "OptionTypeEnum" NOT NULL,
	"status" "OptionStatusEnum" DEFAULT 'DRAFT' NOT NULL,
	"cliff_years" integer DEFAULT 0 NOT NULL,
	"vesting_years" integer DEFAULT 0 NOT NULL,
	"issue_date" timestamp with time zone NOT NULL,
	"expiration_date" timestamp with time zone NOT NULL,
	"vesting_start_date" timestamp with time zone NOT NULL,
	"board_approval_date" timestamp with time zone NOT NULL,
	"rule_144_date" timestamp with time zone NOT NULL,
	"stakeholder_id" varchar(191) NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"equity_plan_id" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_investments" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"amount" real NOT NULL,
	"shares" bigint NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"comments" varchar(191),
	"share_class_id" varchar(191) NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"stakeholder_id" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_safes" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"public_id" varchar(191) NOT NULL,
	"type" "SafeTypeEnum" DEFAULT 'POST_MONEY' NOT NULL,
	"status" "SafeStatusEnum" DEFAULT 'DRAFT' NOT NULL,
	"capital" real NOT NULL,
	"safe_template" "SafeTemplateEnum",
	"safe_id" varchar(191),
	"valuation_cap" real,
	"discount_rate" real,
	"mfn" boolean DEFAULT false NOT NULL,
	"pro_rata" boolean DEFAULT false NOT NULL,
	"additional_terms" varchar(191),
	"stakeholder_id" varchar(191) NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"issue_date" timestamp with time zone NOT NULL,
	"board_approval_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_convertible_notes" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"public_id" varchar(191) NOT NULL,
	"status" "ConvertibleStatusEnum" DEFAULT 'DRAFT' NOT NULL,
	"type" "ConvertibleTypeEnum" DEFAULT 'NOTE' NOT NULL,
	"capital" real NOT NULL,
	"conversion_cap" real,
	"discount_rate" real,
	"mfn" boolean,
	"additional_terms" varchar(191),
	"interest_rate" real,
	"interest_method" "ConvertibleInterestMethodEnum",
	"interest_accrual" "ConvertibleInterestAccrualEnum",
	"interest_payment_schedule" "ConvertibleInterestPaymentScheduleEnum",
	"stakeholder_id" varchar(191) NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"issue_date" timestamp with time zone NOT NULL,
	"board_approval_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_esign_audits" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"template_id" varchar(191) NOT NULL,
	"recipient_id" varchar(191),
	"action" varchar(191) NOT NULL,
	"ip" varchar(191) NOT NULL,
	"user_agent" varchar(191) NOT NULL,
	"location" varchar(191) NOT NULL,
	"summary" varchar(191) NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_updates" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"public_id" varchar(191) NOT NULL,
	"title" varchar(191) NOT NULL,
	"content" jsonb NOT NULL,
	"html" varchar(191) NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"status" "UpdateStatusEnum" DEFAULT 'DRAFT' NOT NULL,
	"author_id" varchar(191) NOT NULL,
	"company_id" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "cap_updates_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "cap_billing_customers" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"company_id" varchar(191)
);
--> statement-breakpoint
CREATE TABLE "cap_billing_prices" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"product_id" varchar(191) NOT NULL,
	"active" boolean NOT NULL,
	"description" varchar(191),
	"unit_amount" bigint,
	"currency" varchar(3) NOT NULL,
	"type" "PricingType" NOT NULL,
	"interval" "PricingPlanInterval",
	"interval_count" integer,
	"trial_period_days" integer,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "cap_billing_products" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"active" boolean NOT NULL,
	"name" varchar(191) NOT NULL,
	"description" varchar(191),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "cap_billing_subscriptions" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"price_id" varchar(191) NOT NULL,
	"quantity" integer NOT NULL,
	"status" "SubscriptionStatus" NOT NULL,
	"cancel_at_period_end" boolean NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"current_period_start" timestamp with time zone DEFAULT now() NOT NULL,
	"current_period_end" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"cancel_at" timestamp with time zone,
	"canceled_at" timestamp with time zone,
	"trial_start" timestamp with time zone,
	"trial_end" timestamp with time zone,
	"metadata" jsonb,
	"customer_id" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cap_access_tokens" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"client_id" varchar(191) NOT NULL,
	"client_secret" varchar(191) NOT NULL,
	"type_enum" "AccessTokenType" DEFAULT 'api' NOT NULL,
	"user_id" varchar(191) NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
