"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const svgRef = useRef<SVGSVGElement>(null);
  const strokeColor =
    variant === "hero"
      ? "var(--color-cobre-viejo)"
      : "var(--color-piedra-volcanica)";

  // The "etch" reveal: strokes draw themselves in as the divider scrolls
  // into view, echoing how a furrow is actually cut. Gated behind
  // prefers-reduced-motion the same way Reveal/RevealStagger are — the
  // paths render fully drawn by default, and gsap only ever animates
  // *from* the undrawn (dash-offset) state when motion is allowed, so
  // there's never a stroke stuck invisible without JS.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll("path");

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(paths, {
        strokeDasharray: (_i, el) => (el as SVGPathElement).getTotalLength(),
        strokeDashoffset: (_i, el) => (el as SVGPathElement).getTotalLength(),
      });
      gsap.to(paths, {
        strokeDashoffset: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: svg,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-hidden="true"
      viewBox="0 0 400 46"
      preserveAspectRatio="none"
      className={cn("w-full h-10", className)}
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
