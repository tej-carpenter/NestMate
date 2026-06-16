"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { readLocalSession } from "@/lib/session";

export function TrafficTracker() {
  const pathname = usePathname();
  const hasFired = useRef(false);

  useEffect(() => {
    if (pathname && !hasFired.current) {
      hasFired.current = true;
      // Traffic tracking is disabled in Supabase mode for now
    }
  }, [pathname]);

  return null;
}