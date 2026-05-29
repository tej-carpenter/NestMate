import * as React from "react";
import { cn } from "@/lib/cn";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "accent" | "muted";
}

export function Chip({ className, children, tone = "default", ...props }: ChipProps) {
  const toneClass =
    tone === "accent"
      ? "bg-[color:var(--brand)] text-white"
      : tone === "muted"
      ? "bg-[color:var(--surface-strong)] text-[color:var(--muted)]"
      : "bg-[color:var(--surface-strong)] text-[color:var(--foreground)]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-[var(--space-4)] py-[var(--space-2)] text-[var(--type-small)] font-semibold shadow-sm",
        toneClass,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Chip;
