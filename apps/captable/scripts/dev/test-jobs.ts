#!/usr/bin/env bun

import { logger } from "@captable/logger";

// Import all jobs to register them
import {
  authVerificationEmailJob,
  esignConfirmationEmailJob,
  esignEmailJob,
  esignPdfJob,
  getStats,
  memberInviteEmailJob,
  passwordResetEmailJob,
  shareDataRoomEmailJob,
  shareUpdateEmailJob,
} from "@/jobs";

const log = logger.child({ module: "test-jobs" });

async function testPasswordResetEmail() {
  try {
    log.info("Testing password reset email job...");

    const jobId = await passwordResetEmailJob.emit({
      email: "test@example.com",
      resetLink:
        "https://cloud.captable.inc/auth/reset-password?token=test-token",
    });

    log.info({ jobId }, "Password reset email job queued");
  } catch (error) {
    log.error({ error }, "Failed to queue password reset email job");
  }
}

async function testMemberInviteEmail() {
  try {
    log.info("Testing member invite email job...");

    const jobId = await memberInviteEmailJob.emit({
      email: "newmember@example.com",
      invitedBy: "John Doe",
      companyName: "Test Company",
      inviteLink: "https://cloud.captable.inc/invite?token=test-invite-token",
    });

    log.info({ jobId }, "Member invite email job queued");
  } catch (error) {
    log.error({ error }, "Failed to queue member invite email job");
  }
}

async function testAuthVerificationEmail() {
  try {
    log.info("Testing auth verification email job...");

    const jobId = await authVerificationEmailJob.emit({
      email: "user@example.com",
      verifyLink:
        "https://cloud.captable.inc/auth/verify?token=test-verification-token",
    });

    log.info({ jobId }, "Auth verification email job queued");
  } catch (error) {
    log.error({ error }, "Failed to queue auth verification email job");
  }
}

async function showQueueStats() {
  try {
    const stats = await getStats();
    console.log("\n📊 Queue Statistics:");
    console.table(stats);
  } catch (error) {
    log.error({ error }, "Failed to get queue stats");
  }
}

async function testAllEmailJobs() {
  log.info("🧪 Testing all email jobs...");

  await testPasswordResetEmail();
  await testMemberInviteEmail();
  await testAuthVerificationEmail();

  log.info("✅ All test jobs queued!");
  await showQueueStats();
}

// Parse command line arguments
const command = process.argv[2] || "all";

switch (command) {
  case "password-reset":
    testPasswordResetEmail().then(() => showQueueStats());
    break;
  case "member-invite":
    testMemberInviteEmail().then(() => showQueueStats());
    break;
  case "auth-verification":
    testAuthVerificationEmail().then(() => showQueueStats());
    break;
  case "stats":
    showQueueStats();
    break;
  case "all":
    testAllEmailJobs();
    break;
  default:
    console.log("Usage: bun run test-jobs [job-type]");
    console.log("Available job types:");
    console.log("  password-reset     - Test password reset email");
    console.log("  member-invite      - Test member invite email");
    console.log("  auth-verification  - Test auth verification email");
    console.log("  stats              - Show queue statistics");
    console.log("  all                - Test all email jobs (default)");
    process.exit(1);
}
