import { signOut, useSession } from "@captable/auth/client";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const session = useSession();
  const navigate = useNavigate();
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col gap-4">
        <h1>Dashboard</h1>
        <p>Welcome: {session?.data?.user?.name}</p>
        <button
          onClick={async () => {
            await signOut();
            navigate("/login");
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
