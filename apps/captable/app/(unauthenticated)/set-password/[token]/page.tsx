import { SetPasswordForm } from "@/components/onboarding/set-password";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Set Password",
};

export type PageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    verificationToken: string;
    email: string;
  }>;
};

export default async function SetPasswordPage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params;
  const { verificationToken, email } = await searchParams;

  if (!verificationToken || !email) {
    redirect("/set-password");
  }

  return (
    <SetPasswordForm
      token={token}
      email={email}
      verificationToken={verificationToken}
    />
  );
}
