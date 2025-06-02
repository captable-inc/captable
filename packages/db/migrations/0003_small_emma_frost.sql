CREATE TABLE "cap_job_queue" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"type" varchar(100) NOT NULL,
	"payload" json NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"scheduled_for" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"failed_at" timestamp,
	"error" varchar(1000),
	"retry_delay" integer DEFAULT 1000 NOT NULL
);
