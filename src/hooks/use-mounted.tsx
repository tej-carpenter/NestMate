"use client";

import { useEffect, useState } from "react";

export default function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  return mounted;
}
