import { cn } from "@/lib/utils";

type FurrowDividerProps = {
  variant?: "divider" | "hero";
  className?: string;
};

// Four slightly-varied parallel strokes — the estate's own furrow/vineyard-row
// motif (see spec: "Furrow-line signature — implementation"). `divider` is
// the full-strength section-break version; `hero` is the faint version used
// behind hero content.
const STROKES = [
  { y: 8, length: 1, opacity: { divider: 1, hero: 0.18 } },
  { y: 18, length: 0.92, opacity: { divider: 1, hero: 0.14 } },
  { y: 28, length: 1, opacity: { divider: 0.85, hero: 0.16 } },
  { y: 38, length: 0.88, opacity: { divider: 0.85, hero: 0.12 } },
];

export function FurrowDivider({
  variant = "divider",
  className,
}: FurrowDividerProps) {
  const strokeColor =
    variant === "hero"
      ? "var(--color-cobre-viejo)"
      : "var(--color-piedra-volcanica)";

  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 400 46"
      preserveAspectRatio="none"
      className={cn("w-full h-auto", className)}
    >
      {STROKES.map((s, i) => (
        <path
          key={i}
          d={`M ${(400 * (1 - s.length)) / 2} ${s.y} L ${
            400 - (400 * (1 - s.length)) / 2
          } ${s.y}`}
          stroke={strokeColor}
          strokeWidth={i % 2 === 0 ? 1.5 : 1}
          strokeOpacity={s.opacity[variant]}
        />
      ))}
    </svg>
  );
}
