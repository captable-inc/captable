CREATE INDEX "job_processing_idx" ON "cap_job_queue" USING btree ("status","scheduled_for","attempts");--> statement-breakpoint
CREATE INDEX "priority_ordering_idx" ON "cap_job_queue" USING btree ("priority" DESC NULLS LAST,"created_at");--> statement-breakpoint
CREATE INDEX "cleanup_idx" ON "cap_job_queue" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "status_idx" ON "cap_job_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "type_idx" ON "cap_job_queue" USING btree ("type");--> statement-breakpoint
CREATE INDEX "failed_jobs_idx" ON "cap_job_queue" USING btree ("status","failed_at" DESC NULLS LAST);