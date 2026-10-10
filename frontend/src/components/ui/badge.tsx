import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "outline" | "success" | "warning";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "border-transparent bg-primary text-primary-foreground",
        variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground",
        variant === "outline" && "text-foreground",
        variant === "success" && "border-transparent bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
        variant === "warning" && "border-transparent bg-amber-500/15 text-amber-900 dark:text-amber-200",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
