import { signUp } from "@captable/auth/client";
import { useNavigate } from "react-router";
import { Layout } from "../components/Layout";

export default function Register() {
  const email = "";
  const password = "";
  const name = "";

  const navigate = useNavigate();

  async function register() {
    const { data, error } = await signUp.email(
      {
        email,
        password,
        name,
        callbackURL: "/dashboard",
      },
      {
        onRequest: (ctx) => {},
        onSuccess: (ctx) => {
          navigate("/dashboard");
        },
        onError: (ctx) => {
          alert(ctx.error.message);
        },
      },
    );
  }
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center">
        <h1 className="mb-6 text-2xl font-bold">Register</h1>
        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          onClick={register}
          type="submit"
        >
          Register
        </button>
      </div>
    </Layout>
  );
}
