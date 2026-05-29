import * as React from "react";
import { cn } from "@/lib/cn";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full",
        "min-h-[8rem]",
        "rounded-[var(--radius-md)]",
        "border border-[color:var(--border)] bg-[color:var(--surface-strong)]",
        "px-[var(--space-4)] py-[var(--space-3)] text-[var(--type-base)] text-[color:var(--foreground)]",
        "shadow-sm outline-none transition placeholder:text-slate-400",
        "focus:border-[color:var(--brand)] focus:ring-4 focus:ring-[color:var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}