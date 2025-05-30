import { serverSideSession } from "@captable/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function HomePage() {
  try {
    const session = await serverSideSession({ headers: await headers() });

    if (session?.user?.companyPublicId) {
      return redirect(`/${session.user.companyPublicId}`);
    }
  } catch (error) {
    // No session, redirect to login
  }

  return redirect("/login");
}
