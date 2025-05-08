import { Link as RouterLink, LinkProps } from "react-router";
import { cn } from "@/lib/utils";

export const Link = ({ children, className, ...props }: LinkProps & { className?: string }) => {
  return (
    <RouterLink 
      className={cn("text-primary hover:underline underline-offset-4", className)}
      {...props}
    >
      {children}
    </RouterLink>
  );
};
