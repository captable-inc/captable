import { signOut, useSession } from "@captable/auth/client";
import { useNavigate } from "react-router";
import { Layout } from "../components/Layout";

export default function Dashboard() {
  const session = useSession();
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome: {session?.data?.user?.name}</p>
        <button
          className="w-fit rounded-md bg-primary px-4 py-2 text-primary-foreground"
          onClick={async () => {
            await signOut();
            navigate("/login");
          }}
        >
          Sign Out
        </button>
      </div>
    </Layout>
  );
}
