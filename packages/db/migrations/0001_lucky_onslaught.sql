CREATE TABLE "invitations" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"inviterId" varchar(128) NOT NULL,
	"organizationId" varchar(128) NOT NULL,
	"role" varchar(255) NOT NULL,
	"status" varchar(255) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"organizationId" varchar(128) NOT NULL,
	"userId" varchar(128) NOT NULL,
	"role" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"logo" varchar(255),
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "activeOrganizationId" varchar(128);