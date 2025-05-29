import { cachedServerSideSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await cachedServerSideSession();

  if (session?.user?.companyPublicId) {
    return redirect(`/${session.user.companyPublicId}`);
  }

  return redirect("/login");
}
