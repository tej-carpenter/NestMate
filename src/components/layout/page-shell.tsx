import { cn } from "@/lib/cn";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16",
        className,
      )}
    >
      {children}
    </main>
  );
}