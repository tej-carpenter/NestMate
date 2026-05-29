import * as React from "react";
import { cn } from "@/lib/cn";

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] px-[var(--space-4)] text-[var(--type-base)] text-[color:var(--foreground)] shadow-sm outline-none transition",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export default Select;
