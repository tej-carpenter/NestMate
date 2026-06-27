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
    <button
      type="button"
      onClick={() => {
        const currentIndex = options.findIndex((option) => option.value === theme);
        const nextIndex = (currentIndex + 1) % options.length;
        setTheme(options[nextIndex].value);
      }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-sm hover:bg-black/5 dark:hover:bg-white/10 transition"
      aria-label={`Toggle theme (Current: ${activeOption.label})`}
      title={`Toggle theme (Current: ${activeOption.label})`}
    >
      <ActiveIcon className="h-4 w-4" />
    </button>
  );
}