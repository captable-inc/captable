import SignInForm from "@/components/onboarding/signin";
import { IS_GOOGLE_AUTH_ENABLED } from "@/lib/constants/auth";
import { serverSideSession } from "@captable/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to Captable, Inc.",
};

export default async function SignIn() {
  try {
    const session = await serverSideSession({ headers: await headers() });

    if (session?.user) {
      if (session?.user?.companyPublicId) {
        return redirect(`/${session.user.companyPublicId}`);
      }
      return redirect("/onboarding");
    }
  } catch (error) {
    // No session, continue to login page
  }

  return <SignInForm isGoogleAuthEnabled={IS_GOOGLE_AUTH_ENABLED} />;
}
