import { cn } from "@/lib/utils";
import { type RiHome4Line } from "@remixicon/react";
import Link from "next/link";

type Icon = typeof RiHome4Line;

interface NavLinkProps {
  href?: string;
  icon?: Icon;
  name: string;
  active: boolean;
  className?: string;
}

export function NavLink({ active, href, icon, name, className }: NavLinkProps) {
  const Icon = icon;

  return (
    <>
      {href ? (
        <Link
          href={href}
          className={cn(
            className,
            active
              ? "bg-secondary font-semibold text-primary"
              : "text-foreground/70 hover:bg-secondary hover:text-primary",
            "group flex gap-x-3 rounded-md p-1 text-sm leading-6 transition-colors",
          )}
        >
          {Icon && (
            <Icon
              className={cn(
                active
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-primary",
                "h-6 w-6 shrink-0",
              )}
              aria-hidden="true"
            />
          )}
          {name}
        </Link>
      ) : (
        <button
          className={cn(
            className,
            active
              ? "bg-secondary font-semibold text-primary"
              : "text-foreground/70 hover:bg-secondary hover:text-primary",
            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 transition-colors",
          )}
        >
          {Icon && (
            <Icon
              className={cn(
                active
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-primary",
                "h-6 w-6 shrink-0",
              )}
              aria-hidden="true"
            />
          )}
          {name}
        </button>
      )}
    </>
  );
}
