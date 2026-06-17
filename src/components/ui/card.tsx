import * as React from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-[color:var(--surface)] border border-[color:var(--border)] shadow-sm shadow-black/5",
        "rounded-[var(--radius-lg)]",
        className,
      )}
      {...props}
    />
  );
}