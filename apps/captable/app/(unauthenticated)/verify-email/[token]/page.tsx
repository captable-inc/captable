import VerifyEmail from "@/components/onboarding/verify-email";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
};

export type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function VerifyEmailPage({ params }: PageProps) {
  const { token } = await params;
  return <VerifyEmail token={token} />;
}
