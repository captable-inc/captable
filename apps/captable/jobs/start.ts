import { AuthVerificationEmailJob } from "@/jobs/auth-verification-email";
import { JobManager, boss } from "@/jobs/base";
import { EsignConfirmationEmailJob } from "@/jobs/esign-confirmation-email";
import { EsignEmailJob } from "@/jobs/esign-email";
import { EsignPdfJob } from "@/jobs/esign-pdf";
import { MemberInviteEmailJob } from "@/jobs/member-inivite-email";
import { PasswordResetEmailJob } from "@/jobs/password-reset-email";
import { ShareDataRoomEmailJob } from "@/jobs/share-data-room-email";
import { ShareUpdateEmailJob } from "@/jobs/share-update-email";

export async function startJobs() {
  const jobs = new JobManager(boss)
    .register(AuthVerificationEmailJob)
    .register(ShareUpdateEmailJob)
    .register(ShareDataRoomEmailJob)
    .register(MemberInviteEmailJob)
    .register(PasswordResetEmailJob)
    .register(EsignEmailJob)
    .register(EsignConfirmationEmailJob)
    .register(EsignPdfJob);

  await jobs.start();
}
