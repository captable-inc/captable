import { VerifyMemberForm } from "@/components/member/verify-member-form";
import { authOptions } from "@/server/auth";
import { checkVerificationToken } from "@/server/member";
import type { Metadata } from "next";
import { serverSideSession } from "@captable/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Verify member",
};

export default async function VerifyMember({
  params,
  searchParams,
  request,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    passwordResetToken: string;
    email: string;
  }>;
  request: Request;
}) {
  const { token } = await params;
  const { passwordResetToken, email } = await searchParams;
  const session = await serverSideSession({ request });

  const urlParams = new URLSearchParams({
    email: email,
    verificationToken: token,
  });

  if (!session?.user || !session?.user.email) {
    redirect(`/set-password/${passwordResetToken}?${urlParams.toString()}`);
  }

  // check if token is valid
  const { memberId } = await checkVerificationToken(token, session.user.email);

  return <VerifyMemberForm memberId={memberId} token={token} />;
}
