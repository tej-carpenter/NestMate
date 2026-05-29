import * as React from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full",
        "min-h-11",
        "rounded-[var(--radius-md)]",
        "border border-[color:var(--border)] bg-[color:var(--surface-strong)]",
        "px-[var(--space-4)] py-3 text-[var(--type-base)] leading-6 text-[color:var(--foreground)]",
        "shadow-sm outline-none transition placeholder:text-slate-400",
        "focus:border-[color:var(--brand)] focus:ring-4 focus:ring-[color:var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}