"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordTrafficEvent } from "@/lib/local-data";
import { readLocalSession } from "@/lib/session";

export function TrafficTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const session = readLocalSession();
    recordTrafficEvent({
      route: pathname,
      role: session?.role ?? "anonymous",
    });
  }, [pathname]);

  return null;
}