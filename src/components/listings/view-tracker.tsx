"use client";

import { useEffect, useRef } from "react";

export default function ViewTracker({ slug }: { slug: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Fire and forget
    fetch(`/api/listings/${slug}/view`, { method: "POST" }).catch((err) => {
      console.error("Failed to track view:", err);
    });
  }, [slug]);

  return null;
}
