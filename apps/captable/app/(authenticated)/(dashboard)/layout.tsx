import { useServerSideSession } from "@/hooks/use-server-side-session";
import { redirect } from "next/navigation";

export default async function OnboardedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await useServerSideSession();

  if (!session.user.isOnboarded) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
