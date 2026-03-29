import { Button } from "@/components/ui/button";
import { RiCheckboxCircleLine } from "@remixicon/react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Password Updated",
};

export default function PasswordUpdated() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="grid w-full max-w-md grid-cols-1 gap-5 rounded-xl border border-border bg-card p-10 shadow">
        <div className="flex flex-col gap-y-2 text-center">
          <RiCheckboxCircleLine className="h-10 w-auto" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Password Updated
          </h1>

          <p className="text-sm text-muted-foreground">
            Your password has been updated successfully.
          </p>

          <Link href="/" className="mt-4">
            <Button size="lg">Return to login page</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
