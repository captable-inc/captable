interface LoginFormHeaderProps {
  page?: string;
}

export function AuthFormHeader({ page }: LoginFormHeaderProps) {
  return (
    <div className="flex flex-col gap-y-2 text-center">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        {page === "signup" ? "Create your account" : "Welcome back"}
      </h1>
    </div>
  );
}
