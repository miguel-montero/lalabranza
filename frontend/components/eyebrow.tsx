import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-label text-xs uppercase tracking-widest text-[var(--color-cobre-viejo)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
