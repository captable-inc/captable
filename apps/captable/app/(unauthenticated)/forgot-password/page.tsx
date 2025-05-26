import ForgotPassword from "@/components/onboarding/forgot-password";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
