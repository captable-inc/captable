// Import all job files to register them
import "./password-reset-email";
import "./member-inivite-email";
import "./auth-verification-email";
import "./share-update-email";
import "./share-data-room-email";
import "./esign-email";
import "./esign-confirmation-email";
import "./esign-pdf";

// Re-export job instances for direct usage
export { passwordResetEmailJob } from "./password-reset-email";
export { memberInviteEmailJob } from "./member-inivite-email";
export { authVerificationEmailJob } from "./auth-verification-email";
export { shareUpdateEmailJob } from "./share-update-email";
export { shareDataRoomEmailJob } from "./share-data-room-email";
export { esignEmailJob } from "./esign-email";
export { esignConfirmationEmailJob } from "./esign-confirmation-email";
export { esignPdfJob } from "./esign-pdf";

// Re-export queue functions for direct usage
export {
  addJob,
  addJobs,
  processJobs,
  cleanupJobs,
  getStats,
  getRegisteredProcessors,
  clearProcessors,
  register,
} from "@captable/queue";
