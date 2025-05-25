// Email templates
export { default as AccountVerificationEmail } from "./emails/AccountVerificationEmail";
export { default as EsignConfirmationEmail } from "./emails/EsignConfirmationEmail";
export { default as EsignEmail } from "./emails/EsignEmail";
export { default as MagicLinkEmail } from "./emails/MagicLinkEmail";
export { default as MemberInviteEmail } from "./emails/MemberInviteEmail";
export { default as PasswordResetEmail } from "./emails/PasswordResetEmail";
export { default as ShareDataRoomEmail } from "./emails/ShareDataRoomEmail";
export { default as ShareUpdateEmail } from "./emails/ShareUpdateEmail";

// Re-export commonly used functions from react-email
export { render, renderAsync } from "@react-email/components";

// Export constants
export { META } from "./lib/constants";

// Export types for email props
export type { AccountVerificationEmailProps } from "./emails/AccountVerificationEmail";
export type { EsignConfirmationEmailProps, EsignConfirmationEmailPayloadType } from "./emails/EsignConfirmationEmail";
export type { EsignEmailProps, EsignEmailPayloadType } from "./emails/EsignEmail";
export type { MagicLinkEmailProps } from "./emails/MagicLinkEmail";
export type { MemberInviteEmailProps } from "./emails/MemberInviteEmail";
export type { PasswordResetEmailProps } from "./emails/PasswordResetEmail";
export type { ShareDataRoomEmailProps } from "./emails/ShareDataRoomEmail";
export type { ShareUpdateEmailProps } from "./emails/ShareUpdateEmail"; 