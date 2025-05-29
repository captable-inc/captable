import { cachedServerSideSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await cachedServerSideSession();

  if (!session) {
    redirect("/login");
  }
  return <>{children}</>;
}
