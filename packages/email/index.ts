import type { ReactElement } from "react";

// Export all email templates and their types explicitly
export { default as AccountVerificationEmail } from "./templates/account-verification-email.js";
export { default as EsignConfirmationEmail } from "./templates/esign-confirmation-email.js";
export { default as EsignEmail } from "./templates/esign-email.js";
export { default as MagicLinkEmail } from "./templates/magic-link-email.js";
export { default as MemberInviteEmail } from "./templates/member-invite-email.js";
export { default as PasswordResetEmail } from "./templates/password-reset-email.js";
export { default as ShareDataRoomEmail } from "./templates/share-data-room-email.js";
export { default as ShareUpdateEmail } from "./templates/share-update-email.js";

// Export types
export type { AccountVerificationEmailProps } from "./templates/account-verification-email.js";
export type { EsignConfirmationEmailProps } from "./templates/esign-confirmation-email.js";
export type { EsignEmailProps } from "./templates/esign-email.js";
export type { MagicLinkEmailProps } from "./templates/magic-link-email.js";
export type { MemberInviteEmailProps } from "./templates/member-invite-email.js";
export type { PasswordResetEmailProps } from "./templates/password-reset-email.js";
export type { ShareDataRoomEmailProps } from "./templates/share-data-room-email.js";
export type { ShareUpdateEmailProps } from "./templates/share-update-email.js";

// Export email components
export {
  Layout,
  Button,
  Heading,
  Text,
  Link,
  Footer,
} from "./components/index.js";

export type {
  LayoutProps,
  ButtonProps,
  HeadingProps,
  TextProps,
  LinkProps,
  FooterProps,
} from "./components/index.js";

// Dynamic import for React Email render function to avoid ES module issues
export async function render(component: ReactElement, options?: { pretty?: boolean; plainText?: boolean }) {
  const { render: reactEmailRender } = await import("@react-email/components");
  return reactEmailRender(component, options);
}
