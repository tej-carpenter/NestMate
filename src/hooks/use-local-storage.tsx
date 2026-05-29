"use client";

import { useCallback, useEffect, useState } from "react";

export default function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const t = window.setTimeout(() => setState(JSON.parse(raw) as T), 0);
        return () => window.clearTimeout(t);
      }
    } catch {}
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setState((prev) => {
        const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch {}
        return value;
      });
    },
    [key],
  );

  return [state, set] as const;
}
