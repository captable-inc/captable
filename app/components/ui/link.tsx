import { cn } from "@/lib/utils";
import { LinkProps, Link as RouterLink } from "react-router";

export const Link = ({
  children,
  className,
  ...props
}: LinkProps & { className?: string }) => {
  return (
    <RouterLink
      className={cn(
        "text-primary hover:underline underline-offset-4",
        className,
      )}
      {...props}
    >
      {children}
    </RouterLink>
  );
};
