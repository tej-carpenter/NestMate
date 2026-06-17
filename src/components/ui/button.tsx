import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "default" | "secondary" | "ghost" | "outline";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const buttonStyles: Record<ButtonVariant, string> = {
  default: "bg-[color:var(--brand)] text-[color:var(--brand-foreground)] shadow-sm shadow-black/10 hover:opacity-90",
  secondary: "bg-black/5 text-[color:var(--foreground)] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15",
  ghost: "bg-transparent text-[color:var(--foreground)] hover:bg-black/5 dark:hover:bg-white/10",
  outline: "border border-[color:var(--border)] bg-transparent text-[color:var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-sm",
  lg: "h-14 px-6 text-base",
};

export function Button({ className, variant = "default", size = "md", asChild, ...props }: ButtonProps) {
  const baseClassName = cn(
    "inline-flex items-center justify-center gap-2 font-semibold transition duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-[var(--radius-lg)]",
    buttonStyles[variant],
    sizeStyles[size],
    className,
  );

  if (asChild && React.isValidElement(props.children)) {
    const child = React.Children.only(props.children) as React.ReactElement<{ className?: string }>;

    return React.cloneElement(child, {
      className: cn(baseClassName, child.props.className),
    });
  }

  return (
    <button className={baseClassName} {...props} />
  );
}