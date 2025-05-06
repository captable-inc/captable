import { signUp } from "@captable/auth/client";
import { useNavigate } from "react-router";

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
    <div className="flex h-screen items-center justify-center">
      <button onClick={register} type="submit">
        Register
      </button>
    </div>
  );
}
