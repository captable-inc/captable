import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn, signUp } from "@cap/auth/client";
import { useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type User = {
  email: string;
  password: string;
};

type SocialSession = {
  provider: "apple" | "google";
  isLoading: boolean;
  error: string | null;
};

export function SessionForm({
  type = "login",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  type?: "login" | "signup";
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({
    email: "user@example.com",
    password: "password",
  });

  async function handleEmailSession(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!user || !user.email || !user.password) {
      toast.error("Please enter an email and password");
      return;
    }

    if (type === "login") {
      const { data, error } = await signIn.email({
        email: user?.email,
        password: user?.password,
      });

      error && toast.error(error.message);
      data && navigate("/");
    } else {
      const { data, error } = await signUp.email({
        email: user?.email,
        password: user?.password,
        name: user?.email,
      });

      if (error) {
        debugger;
      }

      error && toast.error(error.message);
      data && navigate("/");
    }
  }

  async function handleSocialSignIn(
    provider: SocialSession["provider"],
    e: React.MouseEvent<HTMLButtonElement>,
  ) {
    e.preventDefault();
    toast.error("Social sign in is not implemented yet");
    // const { data, error } = await signIn.social({
    //   provider,
    // });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {type === "login" ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {type === "login"
              ? "Login with your Apple or Google account"
              : "Sign up with your Apple or Google account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => handleSocialSignIn("apple", e)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  {type === "login" ? "Login with Apple" : "Sign up with Apple"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => handleSocialSignIn("google", e)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {type === "login"
                    ? "Login with Google"
                    : "Sign up with Google"}
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={user?.email}
                    onChange={(e) =>
                      setUser({
                        email: e.target.value,
                        password: user?.password || "",
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={user?.password}
                    onChange={(e) =>
                      setUser({
                        email: user?.email || "",
                        password: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  onClick={(e) => handleEmailSession(e)}
                >
                  {type === "login" ? "Login" : "Sign up"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  to={type === "login" ? "/signup" : "/login"}
                  className="underline underline-offset-4"
                >
                  {type === "login" ? "Sign up" : "Login"}
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our{" "}
        <Link to="/terms">Terms of Service</Link> and{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </div>
    </div>
  );
}
