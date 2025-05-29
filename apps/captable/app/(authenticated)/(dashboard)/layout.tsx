import { withServerSideSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function OnboardedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await withServerSideSession();

  if (!session.user.isOnboarded) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
