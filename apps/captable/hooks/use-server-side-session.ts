import { serverSideSession, type Session } from "@captable/auth";
import { redirect } from "next/navigation";

export const useServerSideSession = async ({
  request,
}: {
  request: Request;
}) => {
  let session: Session | null = null;

  try {
    session = await serverSideSession({ request });
  } catch (error) {
    redirect("/auth");
    return null;
  }

  return session;
};
