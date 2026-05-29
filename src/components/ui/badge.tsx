import * as React from "react";
import { cn } from "@/lib/cn";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        "rounded-[var(--radius-sm)]",
        "border border-[color:var(--border)]",
        "bg-[color:var(--surface-strong)]",
        "px-[var(--space-3)] py-[var(--space-1)]",
        "text-[var(--type-small)] font-semibold text-[color:var(--foreground)]",
        className,
      )}
      {...props}
    />
  );
}