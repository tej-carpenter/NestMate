"use client";

import * as React from "react";

type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemePreference) => void;
}

const themeStorageKey = "nestmate-theme";

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light" as const;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: ThemePreference) {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(theme: ThemePreference) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTheme = resolveTheme(theme);
  const root = document.documentElement;

  root.dataset.theme = resolvedTheme;
  root.classList.toggle("dark", resolvedTheme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemePreference>("system");
  const resolvedTheme = theme === "dark" ? "dark" : "light";
  const initialSyncPendingRef = React.useRef(true);

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeStorageKey) as ThemePreference | null;

    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      applyTheme(storedTheme);

      const frame = window.requestAnimationFrame(() => {
        initialSyncPendingRef.current = false;
        setThemeState(storedTheme);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    initialSyncPendingRef.current = false;
    window.localStorage.setItem(themeStorageKey, "system");
    applyTheme("system");
  }, []);

  React.useEffect(() => {
    if (initialSyncPendingRef.current) {
      return;
    }

    window.localStorage.setItem(themeStorageKey, theme);
    applyTheme(theme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setThemeState,
    }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}