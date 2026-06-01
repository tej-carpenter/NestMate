"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { getVerificationSummary } from "@/lib/verification/requests";
import type { VerificationSubjectType } from "@/lib/verification/status";

const toneClasses = {
  success: "border-emerald-500/20 bg-emerald-50 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-50",
  warn: "border-amber-500/20 bg-amber-50 text-amber-950 dark:border-amber-400/20 dark:bg-amber-500/15 dark:text-amber-50",
  danger: "border-rose-500/20 bg-rose-50 text-rose-950 dark:border-rose-400/20 dark:bg-rose-500/15 dark:text-rose-50",
  muted: "border-[color:var(--border)] bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200",
} as const;

export function VerificationBadges({
  subjectType,
  subjectId,
  compact = false,
  className,
}: {
  subjectType: VerificationSubjectType;
  subjectId: string | null | undefined;
  compact?: boolean;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<ReturnType<typeof getVerificationSummary> | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (!subjectId) {
        setSummary(null);
        setMounted(true);
        return;
      }

      setSummary(getVerificationSummary(subjectType, subjectId));
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, [subjectId, subjectType]);

  if (!mounted) {
    return <Badge className={cn("border-[color:var(--border)] bg-[color:var(--surface-strong)] text-slate-600 dark:text-slate-300", className)}><ShieldCheck className="h-3.5 w-3.5" /> Loading verification</Badge>;
  }

  if (!summary) {
    return <Badge className={cn("border-[color:var(--border)] bg-[color:var(--surface-strong)] text-slate-600 dark:text-slate-300", className)}><ShieldCheck className="h-3.5 w-3.5" /> Verification not started</Badge>;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {Object.values(summary.levels).map((level) => (
        <Badge key={level.level} className={cn("inline-flex items-center gap-2 border text-[11px] font-semibold uppercase tracking-[0.18em]", toneClasses[level.tone])}>
          <ShieldCheck className="h-3.5 w-3.5" />
          {compact ? level.badgeLabel : `${level.badgeLabel}: ${level.statusLabel}`}
        </Badge>
      ))}
      <Badge className={cn("inline-flex items-center gap-2 border text-[11px] font-semibold uppercase tracking-[0.18em]", toneClasses[summary.overallStatus === "approved" ? "success" : summary.overallStatus === "rejected" ? "danger" : summary.overallStatus === "needs_action" || summary.overallStatus === "pending_review" ? "warn" : "muted"])}>
        <ShieldCheck className="h-3.5 w-3.5" />
        {summary.overallLabel}
      </Badge>
    </div>
  );
}