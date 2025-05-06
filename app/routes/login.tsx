import { signIn } from "@captable/auth/client";
import { useNavigate } from "react-router";
import { Layout } from "../components/Layout";

export default function Login() {
  const navigate = useNavigate();
  const email = "";
  const password = "";

  async function login() {
    const { data, error } = await signIn.email({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    }
    if (data) {
      navigate("/dashboard");
    }
  }
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center">
        <h1 className="mb-6 text-2xl font-bold">Login</h1>
        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          onClick={login}
        >
          Login
        </button>
      </div>
    </Layout>
  );
}
