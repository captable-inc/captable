import SignInForm from "@/components/onboarding/signin";
import { IS_GOOGLE_AUTH_ENABLED } from "@/lib/constants/auth";
import { serverSideSession } from "@/server/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to Captable, Inc.",
};

export default async function SignIn() {
  const session = await serverSideSession();

  if (session?.user) {
    if (session?.user?.companyPublicId) {
      return redirect(`/${session.user.companyPublicId}`);
    }
    return redirect("/onboarding");
  }

  return <SignInForm isGoogleAuthEnabled={IS_GOOGLE_AUTH_ENABLED} />;
}
