import { serverSideSession } from "@captable/auth";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Better Auth requires request parameter - we'll handle this in a middleware or different approach
    // For now, we'll remove server-side session check and handle it client-side
    return <>{children}</>;
  } catch (error) {
    redirect("/login");
  }
}
