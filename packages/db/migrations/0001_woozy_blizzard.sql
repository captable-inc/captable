CREATE TYPE "public"."AuditAction" AS ENUM('CREATE', 'UPDATE', 'DELETE');--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "cap_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_idx" ON "cap_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_session_token_idx" ON "cap_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "cap_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "cap_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "passkeys_user_id_idx" ON "cap_passkeys" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_email_token_idx" ON "cap_password_reset_tokens" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_identifier_token_idx" ON "cap_verification_tokens" USING btree ("identifier","token");--> statement-breakpoint
CREATE INDEX "verification_tokens_user_id_idx" ON "cap_verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_public_id_unique" ON "cap_companies" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "bank_accounts_company_id_idx" ON "cap_bank_accounts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "custom_roles_company_id_idx" ON "cap_custom_roles" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "members_company_id_idx" ON "cap_members" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "members_status_idx" ON "cap_members" USING btree ("status");--> statement-breakpoint
CREATE INDEX "members_user_id_idx" ON "cap_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "members_custom_role_id_idx" ON "cap_members" USING btree ("custom_role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "members_company_id_user_id_unique" ON "cap_members" USING btree ("company_id","user_id");--> statement-breakpoint
CREATE INDEX "stakeholders_company_id_idx" ON "cap_stakeholders" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "audits_company_id_idx" ON "cap_audits" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "share_classes_company_id_idx" ON "cap_share_classes" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "share_classes_company_id_idx_unique" ON "cap_share_classes" USING btree ("company_id","idx");--> statement-breakpoint
CREATE INDEX "equity_plans_share_class_id_idx" ON "cap_equity_plans" USING btree ("share_class_id");--> statement-breakpoint
CREATE INDEX "equity_plans_company_id_idx" ON "cap_equity_plans" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "document_shares_document_id_idx" ON "cap_document_shares" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "documents_bucket_id_idx" ON "cap_documents" USING btree ("bucket_id");--> statement-breakpoint
CREATE INDEX "documents_uploader_id_idx" ON "cap_documents" USING btree ("uploader_id");--> statement-breakpoint
CREATE INDEX "documents_company_id_idx" ON "cap_documents" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "documents_share_id_idx" ON "cap_documents" USING btree ("share_id");--> statement-breakpoint
CREATE INDEX "documents_option_id_idx" ON "cap_documents" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "documents_safe_id_idx" ON "cap_documents" USING btree ("safe_id");--> statement-breakpoint
CREATE INDEX "documents_convertible_note_id_idx" ON "cap_documents" USING btree ("convertible_note_id");--> statement-breakpoint
CREATE INDEX "data_room_documents_data_room_id_idx" ON "cap_data_room_documents" USING btree ("data_room_id");--> statement-breakpoint
CREATE INDEX "data_room_documents_document_id_idx" ON "cap_data_room_documents" USING btree ("document_id");--> statement-breakpoint
CREATE UNIQUE INDEX "data_room_documents_data_room_id_document_id_unique" ON "cap_data_room_documents" USING btree ("data_room_id","document_id");--> statement-breakpoint
CREATE INDEX "data_room_recipients_id_data_room_id_idx" ON "cap_data_room_recipients" USING btree ("id","data_room_id");--> statement-breakpoint
CREATE INDEX "data_room_recipients_member_id_idx" ON "cap_data_room_recipients" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "data_room_recipients_data_room_id_idx" ON "cap_data_room_recipients" USING btree ("data_room_id");--> statement-breakpoint
CREATE INDEX "data_room_recipients_stakeholder_id_idx" ON "cap_data_room_recipients" USING btree ("stakeholder_id");--> statement-breakpoint
CREATE UNIQUE INDEX "data_room_recipients_data_room_id_email_unique" ON "cap_data_room_recipients" USING btree ("data_room_id","email");--> statement-breakpoint
CREATE INDEX "data_rooms_public_id_idx" ON "cap_data_rooms" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "data_rooms_company_id_idx" ON "cap_data_rooms" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "data_rooms_company_id_name_unique" ON "cap_data_rooms" USING btree ("company_id","name");--> statement-breakpoint
CREATE INDEX "update_recipients_id_update_id_idx" ON "cap_update_recipients" USING btree ("id","update_id");--> statement-breakpoint
CREATE INDEX "update_recipients_member_id_idx" ON "cap_update_recipients" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "update_recipients_update_id_idx" ON "cap_update_recipients" USING btree ("update_id");--> statement-breakpoint
CREATE INDEX "update_recipients_stakeholder_id_idx" ON "cap_update_recipients" USING btree ("stakeholder_id");--> statement-breakpoint
CREATE UNIQUE INDEX "update_recipients_update_id_email_unique" ON "cap_update_recipients" USING btree ("update_id","email");--> statement-breakpoint
CREATE INDEX "esign_recipients_member_id_idx" ON "cap_esign_recipients" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "esign_recipients_template_id_idx" ON "cap_esign_recipients" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "template_fields_template_id_idx" ON "cap_template_fields" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "template_fields_recipient_id_idx" ON "cap_template_fields" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "templates_bucket_id_idx" ON "cap_templates" USING btree ("bucket_id");--> statement-breakpoint
CREATE INDEX "templates_uploader_id_idx" ON "cap_templates" USING btree ("uploader_id");--> statement-breakpoint
CREATE INDEX "templates_company_id_idx" ON "cap_templates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "shares_company_id_idx" ON "cap_shares" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "shares_stakeholder_id_idx" ON "cap_shares" USING btree ("stakeholder_id");--> statement-breakpoint
CREATE INDEX "shares_share_class_id_idx" ON "cap_shares" USING btree ("share_class_id");--> statement-breakpoint
CREATE INDEX "options_company_id_idx" ON "cap_options" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "options_equity_plan_id_idx" ON "cap_options" USING btree ("equity_plan_id");--> statement-breakpoint
CREATE INDEX "options_stakeholder_id_idx" ON "cap_options" USING btree ("stakeholder_id");--> statement-breakpoint
CREATE INDEX "investments_company_id_idx" ON "cap_investments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "investments_share_class_id_idx" ON "cap_investments" USING btree ("share_class_id");--> statement-breakpoint
CREATE INDEX "investments_stakeholder_id_idx" ON "cap_investments" USING btree ("stakeholder_id");--> statement-breakpoint
CREATE INDEX "safes_company_id_idx" ON "cap_safes" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "safes_stakeholder_id_idx" ON "cap_safes" USING btree ("stakeholder_id");--> statement-breakpoint
CREATE INDEX "convertible_notes_company_id_idx" ON "cap_convertible_notes" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "convertible_notes_stakeholder_id_idx" ON "cap_convertible_notes" USING btree ("stakeholder_id");--> statement-breakpoint
CREATE INDEX "esign_audits_company_id_idx" ON "cap_esign_audits" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "esign_audits_template_id_idx" ON "cap_esign_audits" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "esign_audits_recipient_id_idx" ON "cap_esign_audits" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "updates_public_id_idx" ON "cap_updates" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "updates_author_id_idx" ON "cap_updates" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "updates_company_id_idx" ON "cap_updates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "billing_customers_company_id_idx" ON "cap_billing_customers" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "billing_prices_product_id_idx" ON "cap_billing_prices" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "billing_subscriptions_price_id_idx" ON "cap_billing_subscriptions" USING btree ("price_id");--> statement-breakpoint
CREATE INDEX "billing_subscriptions_customer_id_idx" ON "cap_billing_subscriptions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "access_tokens_user_id_idx" ON "cap_access_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "access_tokens_type_enum_client_id_idx" ON "cap_access_tokens" USING btree ("type_enum","client_id");