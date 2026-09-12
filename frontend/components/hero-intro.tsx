"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Eyebrow } from "./eyebrow";

/**
 * The hero's one deliberate load-in moment: eyebrow, headline, and subhead
 * stagger in on mount (not scroll-triggered — this is above the fold and
 * already visible at rest). Gated behind prefers-reduced-motion the same
 * way Reveal/RevealStagger are; each line renders at full opacity by
 * default and GSAP only ever animates *from* hidden when motion is
 * actually allowed, so there's no flash of invisible content if JS is
 * slow, disabled, or motion is reduced.
 */
export function HeroIntro({
  eyebrow,
  headline,
  subhead,
  className,
}: {
  eyebrow: string;
  headline: string;
  subhead: string;
  className?: string;
}) {
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap
        .timeline()
        .from(eyebrowRef.current, { opacity: 0, y: 10, duration: 0.4, ease: "power1.out" })
        .from(
          headlineRef.current,
          { opacity: 0, y: 14, duration: 0.5, ease: "power1.out" },
          "-=0.25",
        )
        .from(
          subheadRef.current,
          { opacity: 0, y: 10, duration: 0.4, ease: "power1.out" },
          "-=0.3",
        );
    });

    return () => mm.revert();
  }, []);

  return (
    <div className={className}>
      <div ref={eyebrowRef}>
        <Eyebrow className="text-[var(--color-lana-dorada)]">{eyebrow}</Eyebrow>
      </div>
      <h1 ref={headlineRef} className="font-display text-4xl md:text-6xl mt-2">
        {headline}
      </h1>
      <p ref={subheadRef} className="font-body text-lg mt-2 max-w-md">
        {subhead}
      </p>
    </div>
  );
}
