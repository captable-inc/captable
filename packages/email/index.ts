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

// Dynamic email template loaders to avoid build-time Html component conflicts
export const getAccountVerificationEmail = async () => {
  const { default: AccountVerificationEmail } = await import("./emails/AccountVerificationEmail");
  return AccountVerificationEmail;
};

export const getEsignConfirmationEmail = async () => {
  const { default: EsignConfirmationEmail } = await import("./emails/EsignConfirmationEmail");
  return EsignConfirmationEmail;
};

export const getEsignEmail = async () => {
  const { default: EsignEmail } = await import("./emails/EsignEmail");
  return EsignEmail;
};

export const getMagicLinkEmail = async () => {
  const { default: MagicLinkEmail } = await import("./emails/MagicLinkEmail");
  return MagicLinkEmail;
};

export const getMemberInviteEmail = async () => {
  const { default: MemberInviteEmail } = await import("./emails/MemberInviteEmail");
  return MemberInviteEmail;
};

export const getPasswordResetEmail = async () => {
  const { default: PasswordResetEmail } = await import("./emails/PasswordResetEmail");
  return PasswordResetEmail;
};

export const getShareDataRoomEmail = async () => {
  const { default: ShareDataRoomEmail } = await import("./emails/ShareDataRoomEmail");
  return ShareDataRoomEmail;
};

export const getShareUpdateEmail = async () => {
  const { default: ShareUpdateEmail } = await import("./emails/ShareUpdateEmail");
  return ShareUpdateEmail;
}; 