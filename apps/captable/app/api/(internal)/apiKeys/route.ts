import { useServerSideSession } from "@/hooks/use-server-side-session";

export const POST = async (req: Request) => {
  const session = await useServerSideSession();
  const { user } = session;
};
