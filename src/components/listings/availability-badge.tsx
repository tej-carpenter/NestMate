import { cn } from "@/lib/cn";

export function AvailabilityBadge({
  availableUnits,
  className,
}: {
  availableUnits: number;
  className?: string;
}) {
  if (availableUnits < 0) {
    return (
      <span className={cn("text-slate-500 font-medium", className)}>
        Availability Unknown
      </span>
    );
  }

  if (availableUnits === 0) {
    return (
      <span className={cn("text-red-600 dark:text-red-400 font-medium", className)}>
        ● Fully Occupied
      </span>
    );
  }

  if (availableUnits <= 5) {
    return (
      <span className={cn("text-red-600 dark:text-red-400 font-medium", className)}>
        ● Only {availableUnits} spot{availableUnits === 1 ? "" : "s"} left
      </span>
    );
  }

  if (availableUnits <= 10) {
    return (
      <span className={cn("text-yellow-600 dark:text-yellow-400 font-medium", className)}>
        ● {availableUnits} spots available
      </span>
    );
  }

  return (
    <span className={cn("text-emerald-600 dark:text-emerald-400 font-medium", className)}>
      ● {availableUnits} spots available
    </span>
  );
}
