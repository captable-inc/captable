import type { Session } from "@captable/auth/types";
import { serverSideSession } from "@captable/auth/server";
import { redirect } from "next/navigation";

export const useServerSideSession = async ({
  headers,
}: {
  headers: Headers;
}) => {
  let session: Session | null = null;

  try {
    session = await serverSideSession({ headers });
  } catch (error) {
    redirect("/auth");
    return null;
  }

  return session;
};
