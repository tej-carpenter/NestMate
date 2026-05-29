"use client";

import { useEffect, useState } from "react";
import { Monitor, MoonStar, SunMedium } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "@/components/theme/theme-provider";

const options = [
  { value: "light" as const, label: "Light", icon: SunMedium },
  { value: "dark" as const, label: "Dark", icon: MoonStar },
  { value: "system" as const, label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const activeOption = options.find((option) => option.value === theme) ?? options[0];
  const ActiveIcon = activeOption.icon;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => setMounted(true), 0);

    return () => window.clearTimeout(handle);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-24 rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm sm:w-32" aria-hidden="true" />;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:inline-flex items-center rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-1 shadow-sm">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-[0.9rem] px-3 text-xs font-semibold transition",
                theme === option.value
                  ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                  : "text-[color:var(--foreground)] hover:bg-black/5 dark:hover:bg-white/10",
              )}
              aria-pressed={theme === option.value}
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          const currentIndex = options.findIndex((option) => option.value === theme);
          const nextIndex = (currentIndex + 1) % options.length;
          setTheme(options[nextIndex].value);
        }}
        className="inline-flex h-9 items-center gap-2 rounded-[0.9rem] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-xs font-semibold text-[color:var(--foreground)] shadow-sm sm:hidden"
      >
        <ActiveIcon className="h-3.5 w-3.5" />
        {activeOption.label}
      </button>
    </div>
  );
}