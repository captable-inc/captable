import type { ReactElement } from "react";

// Export all email templates and their types explicitly
export { default as AccountVerificationEmail } from "./templates/AccountVerificationEmail.js";
export { default as EsignConfirmationEmail } from "./templates/EsignConfirmationEmail.js";
export { default as EsignEmail } from "./templates/EsignEmail.js";
export { default as MagicLinkEmail } from "./templates/MagicLinkEmail.js";
export { default as MemberInviteEmail } from "./templates/MemberInviteEmail.js";
export { default as PasswordResetEmail } from "./templates/PasswordResetEmail.js";
export { default as ShareDataRoomEmail } from "./templates/ShareDataRoomEmail.js";
export { default as ShareUpdateEmail } from "./templates/ShareUpdateEmail.js";

// Export types
export type { AccountVerificationEmailProps } from "./templates/AccountVerificationEmail.js";
export type { EsignConfirmationEmailProps } from "./templates/EsignConfirmationEmail.js";
export type { EsignEmailProps } from "./templates/EsignEmail.js";
export type { MagicLinkEmailProps } from "./templates/MagicLinkEmail.js";
export type { MemberInviteEmailProps } from "./templates/MemberInviteEmail.js";
export type { PasswordResetEmailProps } from "./templates/PasswordResetEmail.js";
export type { ShareDataRoomEmailProps } from "./templates/ShareDataRoomEmail.js";
export type { ShareUpdateEmailProps } from "./templates/ShareUpdateEmail.js";

// Dynamic import for React Email render function to avoid ES module issues
export async function render(component: ReactElement, options?: { pretty?: boolean; plainText?: boolean }) {
  const { render: reactEmailRender } = await import("@react-email/components");
  return reactEmailRender(component, options);
}
