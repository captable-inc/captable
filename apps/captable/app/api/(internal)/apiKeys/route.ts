import { withServerSideSession } from "@/server/auth";

export const POST = async (req: Request) => {
  const session = await withServerSideSession();
  const { user } = session;
};
