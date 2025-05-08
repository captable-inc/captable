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
import { Link } from "@/components/ui/link";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { RiAppleFill, RiGoogleFill } from "@remixicon/react";

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
      <Card className="w-full max-w-[450px] mx-auto">
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
                  className="w-full rounded-lg flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-hover"
                  onClick={(e) => handleSocialSignIn("google", e)}
                >
                  <RiGoogleFill className="h-5 w-5" />
                  {type === "login"
                    ? "Login with Google"
                    : "Sign up with Google"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full rounded-lg flex items-center justify-center gap-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  onClick={(e) => handleSocialSignIn("apple", e)}
                >
                  <RiAppleFill className="h-6 w-6" />
                  {type === "login" ? "Login with Apple" : "Sign up with Apple"}
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    className="rounded-lg"
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
                    <Link
                      to="/forgot-password"
                      className="ml-auto text-sm"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    className="rounded-lg"
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
                  className="w-full rounded-lg bg-primary text-white hover:bg-primary-hover"
                  onClick={(e) => handleEmailSession(e)}
                >
                  {type === "login" ? "Login" : "Sign up"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  to={type === "login" ? "/signup" : "/login"}
                >
                  {type === "login" ? "Sign up" : "Login"}
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link to="/terms">Terms of Service</Link> and{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </div>
    </div>
  );
}
