import { signIn } from "@captable/auth/client";
import { useNavigate } from "react-router";

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
    <div className="flex h-screen items-center justify-center">
      <button onClick={login}>Login</button>
    </div>
  );
}
